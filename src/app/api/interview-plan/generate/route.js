import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/redis";
import { generatePersonalizedInterviewPlan } from "@/lib/ragEngine";
import { interviewPlanSchema } from "@/lib/validations/interviewPlan";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to generate your interview plan." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limiting check
    if (rateLimiter) {
      try {
        const { success } = await rateLimiter.limit(`plan_generate_${userId}`);
        if (!success) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please wait a moment before generating another plan." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning:", err);
      }
    }

    // Fetch full candidate context from Prisma database
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        targetRole: {
          include: {
            jdAnalysis: true,
            interviewPlan: true,
          },
        },
        resumeAnalysis: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Candidate profile not found. Please complete profile onboarding first." },
        { status: 404 }
      );
    }

    if (!profile.targetRole) {
      return NextResponse.json(
        { error: "Target role missing. Please specify target role and target company in profile settings." },
        { status: 400 }
      );
    }

    // Generate personalized interview plan using RAG engine & Gemini LLM
    const generatedPlan = await generatePersonalizedInterviewPlan({
      candidateProfile: profile,
      targetRole: profile.targetRole,
      resumeAnalysis: profile.resumeAnalysis,
      jdAnalysis: profile.targetRole.jdAnalysis,
      skillGap: profile.targetRole.jdAnalysis?.skillGap || null,
    });

    // Validate generated plan structure using Zod schema
    const validationResult = interviewPlanSchema.safeParse(generatedPlan);
    const validPlan = validationResult.success ? validationResult.data : generatedPlan;

    // Upsert InterviewPlan in database linked to candidate's TargetRole
    const savedPlan = await prisma.interviewPlan.upsert({
      where: {
        targetRoleId: profile.targetRole.id,
      },
      update: {
        title: validPlan.title,
        difficulty: validPlan.difficulty || profile.targetRole.difficulty || "MEDIUM",
        summary: validPlan.summary,
        questions: validPlan.questions,
      },
      create: {
        targetRoleId: profile.targetRole.id,
        title: validPlan.title,
        difficulty: validPlan.difficulty || profile.targetRole.difficulty || "MEDIUM",
        summary: validPlan.summary,
        questions: validPlan.questions,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Personalized Interview Plan generated successfully!",
      plan: savedPlan,
    });
  } catch (error) {
    console.error("Error in POST /api/interview-plan/generate:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate interview plan. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        targetRole: {
          include: {
            interviewPlan: true,
          },
        },
      },
    });

    if (!profile?.targetRole?.interviewPlan) {
      return NextResponse.json(
        { error: "No interview plan found for this candidate profile." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: profile.targetRole.interviewPlan,
    });
  } catch (error) {
    console.error("Error in GET /api/interview-plan/generate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
