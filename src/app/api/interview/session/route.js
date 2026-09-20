import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/redis";
import { createInterviewSessionSchema } from "@/lib/validations/interviewSession";
import { generatePersonalizedInterviewPlan } from "@/lib/ragEngine";

// Helper to filter or balance questions from Interview Plan based on selected Interview Type
function selectQuestionsForSession(allQuestions = [], interviewType = "MIXED", count = 5) {
  if (!allQuestions || allQuestions.length === 0) return [];

  let filtered = [];

  switch (interviewType) {
    case "TECHNICAL":
      // Technical + Gap Probing + System Design
      filtered = allQuestions.filter(
        (q) =>
          q.category === "TECHNICAL" ||
          q.category === "GAP_PROBING" ||
          q.category === "SYSTEM_DESIGN"
      );
      break;

    case "BEHAVIORAL":
      filtered = allQuestions.filter((q) => q.category === "BEHAVIORAL");
      break;

    case "HR":
      // Behavioral + Culture fit
      filtered = allQuestions.filter((q) => q.category === "BEHAVIORAL");
      if (filtered.length === 0) {
        filtered = allQuestions;
      }
      break;

    case "MIXED":
    default:
      // Balanced mix
      filtered = allQuestions;
      break;
  }

  // If filtered pool is smaller than requested count, fill remaining from overall pool
  if (filtered.length < count) {
    const existingIds = new Set(filtered.map((q) => q.id));
    const remaining = allQuestions.filter((q) => !existingIds.has(q.id));
    filtered = [...filtered, ...remaining];
  }

  // Slice to requested count and re-index order
  return filtered.slice(0, count).map((q, idx) => ({
    ...q,
    order: idx + 1,
  }));
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to configure an interview session." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate Limiting
    if (rateLimiter) {
      try {
        const { success } = await rateLimiter.limit(`session_create_${userId}`);
        if (!success) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please wait a moment before configuring another session." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning:", err);
      }
    }

    const body = await req.json();
    const validation = createInterviewSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      targetRoleId,
      interviewType,
      difficulty,
      questionCount,
      totalDurationMinutes,
      enableVideo,
      enableAudio,
      customFocusTopics,
    } = validation.data;

    // Retrieve candidate profile, target role, and existing interview plan
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
        { error: "Profile not found. Please complete candidate onboarding first." },
        { status: 404 }
      );
    }

    let rawQuestions = profile.targetRole?.interviewPlan?.questions || [];

    // If no interview plan exists yet, generate on-the-fly
    if (!rawQuestions || rawQuestions.length === 0) {
      if (profile.targetRole) {
        const generatedPlan = await generatePersonalizedInterviewPlan({
          candidateProfile: profile,
          targetRole: profile.targetRole,
          resumeAnalysis: profile.resumeAnalysis,
          jdAnalysis: profile.targetRole.jdAnalysis,
          skillGap: profile.targetRole.jdAnalysis?.skillGap || null,
        });

        if (generatedPlan?.questions) {
          rawQuestions = generatedPlan.questions;
          // Persist generated plan in DB
          await prisma.interviewPlan.upsert({
            where: { targetRoleId: profile.targetRole.id },
            update: {
              title: generatedPlan.title,
              difficulty: generatedPlan.difficulty || difficulty,
              summary: generatedPlan.summary,
              questions: generatedPlan.questions,
            },
            create: {
              targetRoleId: profile.targetRole.id,
              title: generatedPlan.title,
              difficulty: generatedPlan.difficulty || difficulty,
              summary: generatedPlan.summary,
              questions: generatedPlan.questions,
            },
          });
        }
      }
    }

    // Filter questions tailored to this specific session configuration
    const selectedQuestions = selectQuestionsForSession(rawQuestions, interviewType, questionCount);

    // Create persistent InterviewSession record
    const newSession = await prisma.interviewSession.create({
      data: {
        userId,
        targetRoleId: targetRoleId || profile.targetRole?.id || null,
        interviewType,
        difficulty: difficulty || profile.targetRole?.difficulty || "MEDIUM",
        questionCount,
        totalDurationMinutes,
        enableVideo,
        enableAudio,
        status: "INITIALIZED",
        selectedQuestions,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Interview session configured and initialized successfully!",
      sessionId: newSession.id,
      session: newSession,
    });
  } catch (error) {
    console.error("Error creating interview session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize interview session." },
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

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (sessionId) {
      const interviewSession = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
      });

      if (!interviewSession || interviewSession.userId !== session.user.id) {
        return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, session: interviewSession });
    }

    // Otherwise list user's past sessions
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("Error fetching interview sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
