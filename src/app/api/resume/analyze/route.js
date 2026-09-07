import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/redis";
import { analyzeResume } from "@/lib/resumeParser";
import { parsedResumeSchema } from "@/lib/validations/resume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to analyze your resume." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limiting: resume analysis consumes AI tokens
    if (rateLimiter) {
      try {
        const { success } = await rateLimiter.limit(`resume_analyze_${userId}`);
        if (!success) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please wait a moment before analyzing another resume." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning:", err);
      }
    }

    let parsedResumeData = null;
    let fileMetadata = { fileName: null, fileSize: null, rawText: null };

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json(
          { error: "No file provided in form data." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit. Please upload a smaller resume." },
          { status: 400 }
        );
      }

      const mimeType = file.type || "application/pdf";
      const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
      if (!allowedTypes.includes(mimeType) && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF or plain text resume." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fileMetadata.fileName = file.name;
      fileMetadata.fileSize = file.size;

      // Extract via Gemini
      parsedResumeData = await analyzeResume({
        fileBuffer: buffer,
        mimeType: mimeType === "application/pdf" ? "application/pdf" : "text/plain",
      });
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      const rawText = body.rawText;

      if (!rawText || rawText.trim().length < 30) {
        return NextResponse.json(
          { error: "Resume text must be at least 30 characters." },
          { status: 400 }
        );
      }

      fileMetadata.rawText = rawText;
      parsedResumeData = await analyzeResume({ rawText });
    } else {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validatedData = parsedResumeSchema.safeParse(parsedResumeData);
    if (!validatedData.success) {
      console.warn("Resume parsing partial schema mismatch, using raw parsed data:", validatedData.error);
    }

    const finalResume = validatedData.success ? validatedData.data : parsedResumeData;

    // Persist or link to Profile if profile exists
    try {
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (userProfile) {
        await prisma.resumeAnalysis.upsert({
          where: { profileId: userProfile.id },
          update: {
            fileName: fileMetadata.fileName,
            fileSize: fileMetadata.fileSize,
            rawText: fileMetadata.rawText,
            candidateName: finalResume.candidateName || null,
            headline: finalResume.headline || null,
            totalYearsExp: finalResume.totalYearsExp || 0,
            seniorityLevel: finalResume.seniorityLevel || "MID",
            skills: finalResume.skills || [],
            technologies: finalResume.technologies || [],
            experience: finalResume.experience || [],
            projects: finalResume.projects || [],
            education: finalResume.education || [],
          },
          create: {
            profileId: userProfile.id,
            fileName: fileMetadata.fileName,
            fileSize: fileMetadata.fileSize,
            rawText: fileMetadata.rawText,
            candidateName: finalResume.candidateName || null,
            headline: finalResume.headline || null,
            totalYearsExp: finalResume.totalYearsExp || 0,
            seniorityLevel: finalResume.seniorityLevel || "MID",
            skills: finalResume.skills || [],
            technologies: finalResume.technologies || [],
            experience: finalResume.experience || [],
            projects: finalResume.projects || [],
            education: finalResume.education || [],
          },
        });
      }
    } catch (dbErr) {
      // Database connection errors shouldn't crash the immediate parsed response
      console.warn("Note: Could not persist ResumeAnalysis to database:", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Resume analyzed successfully!",
      data: finalResume,
    });
  } catch (error) {
    console.error("Error in POST /api/resume/analyze:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze resume. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        resumeAnalysis: true,
      },
    });

    if (!profile || !profile.resumeAnalysis) {
      return NextResponse.json({
        success: true,
        resumeAnalysis: null,
      });
    }

    return NextResponse.json({
      success: true,
      resumeAnalysis: profile.resumeAnalysis,
    });
  } catch (error) {
    console.error("Error in GET /api/resume/analyze:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
