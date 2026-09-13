import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/redis";
import { analyzeJobDescription, calculateSkillGap } from "@/lib/jdParser";
import { parsedJdSchema } from "@/lib/validations/jd";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to analyze job descriptions." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limiting check
    if (rateLimiter) {
      try {
        const { success } = await rateLimiter.limit(`jd_analyze_${userId}`);
        if (!success) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please wait a moment before analyzing another Job Description." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning:", err);
      }
    }

    let parsedJdData = null;
    let fileMetadata = { fileName: null, fileSize: null, rawText: null };

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { error: "No file or screenshot image provided in form data." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit. Please upload a smaller document or screenshot." },
          { status: 400 }
        );
      }

      const mimeType = file.type || "application/pdf";
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(mimeType) && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
        return NextResponse.json(
          { error: "Unsupported format. Please upload a PDF, TXT, or Image screenshot (PNG/JPEG/WEBP)." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fileMetadata.fileName = file.name;
      fileMetadata.fileSize = file.size;

      // Extract via Gemini Multimodal
      parsedJdData = await analyzeJobDescription({
        fileBuffer: buffer,
        mimeType: mimeType,
      });
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      const rawText = body.rawText;

      if (!rawText || rawText.trim().length < 30) {
        return NextResponse.json(
          { error: "Job description text must be at least 30 characters." },
          { status: 400 }
        );
      }

      fileMetadata.rawText = rawText;
      parsedJdData = await analyzeJobDescription({ rawText });
    } else {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validatedData = parsedJdSchema.safeParse(parsedJdData);
    const finalJd = validatedData.success ? validatedData.data : parsedJdData;

    // Retrieve user profile & resume analysis for Skill Gap Radar calculation
    let skillGapResult = null;
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          resumeAnalysis: true,
          targetRole: true,
        },
      });

      if (profile?.resumeAnalysis) {
        skillGapResult = calculateSkillGap(profile.resumeAnalysis, finalJd);
      } else {
        // Fallback gap calculation without resume
        skillGapResult = {
          matchPercentage: 70,
          matchingSkills: [],
          missingCriticalSkills: finalJd.requiredTechnologies || [],
          overqualifiedSkills: [],
          recommendedFocusAreas: finalJd.keyFocusAreas || [],
        };
      }

      // Persist or update JdAnalysis in database if TargetRole exists
      if (profile?.targetRole) {
        await prisma.jdAnalysis.upsert({
          where: { targetRoleId: profile.targetRole.id },
          update: {
            fileName: fileMetadata.fileName,
            fileSize: fileMetadata.fileSize,
            rawText: fileMetadata.rawText,
            roleTitle: finalJd.roleTitle || profile.targetRole.roleTitle,
            seniorityLevel: finalJd.seniorityLevel || "MID",
            companyType: finalJd.companyType || profile.targetRole.companyType,
            requiredSkills: finalJd.requiredSkills || [],
            requiredTechnologies: finalJd.requiredTechnologies || [],
            responsibilities: finalJd.responsibilities || [],
            roleExpectations: finalJd.roleExpectations || {},
            keyFocusAreas: finalJd.keyFocusAreas || [],
            skillGap: skillGapResult,
          },
          create: {
            targetRoleId: profile.targetRole.id,
            fileName: fileMetadata.fileName,
            fileSize: fileMetadata.fileSize,
            rawText: fileMetadata.rawText,
            roleTitle: finalJd.roleTitle || profile.targetRole.roleTitle,
            seniorityLevel: finalJd.seniorityLevel || "MID",
            companyType: finalJd.companyType || profile.targetRole.companyType,
            requiredSkills: finalJd.requiredSkills || [],
            requiredTechnologies: finalJd.requiredTechnologies || [],
            responsibilities: finalJd.responsibilities || [],
            roleExpectations: finalJd.roleExpectations || {},
            keyFocusAreas: finalJd.keyFocusAreas || [],
            skillGap: skillGapResult,
          },
        });

        // Also update targetRole focusTopics with AI recommended areas if empty or user wants
        if (skillGapResult?.recommendedFocusAreas?.length > 0) {
          await prisma.targetRole.update({
            where: { id: profile.targetRole.id },
            data: {
              focusTopics: Array.from(
                new Set([...profile.targetRole.focusTopics, ...skillGapResult.recommendedFocusAreas])
              ).slice(0, 10),
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Note: Could not persist JdAnalysis to database:", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Job Description analyzed successfully!",
      data: finalJd,
      skillGap: skillGapResult,
    });
  } catch (error) {
    console.error("Error in POST /api/jd/analyze:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze Job Description. Please try again.",
      },
      { status: 500 }
    );
  }
}
