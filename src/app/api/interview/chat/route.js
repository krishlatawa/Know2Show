import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimiter } from "@/lib/redis";
import { candidateAnswerSubmissionSchema } from "@/lib/validations/adaptiveChat";
import {
  evaluateCandidateAnswer,
  generateExecutiveSessionSummary,
} from "@/lib/adaptiveEngine";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate Limiter
    if (rateLimiter) {
      try {
        const { success } = await rateLimiter.limit(`interview_chat_${userId}`);
        if (!success) {
          return NextResponse.json(
            { error: "Please wait a moment before sending another response." },
            { status: 429 }
          );
        }
      } catch (err) {
        console.warn("Rate limiter warning:", err);
      }
    }

    const body = await req.json();
    const validation = candidateAnswerSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sessionId, questionId, answerText, timeTakenSeconds } = validation.data;

    // Fetch the active InterviewSession
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            profile: {
              include: {
                targetRole: true,
              },
            },
          },
        },
      },
    });

    if (!interviewSession || interviewSession.userId !== userId) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    if (interviewSession.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This interview session has already been completed." },
        { status: 400 }
      );
    }

    const selectedQuestions = Array.isArray(interviewSession.selectedQuestions)
      ? interviewSession.selectedQuestions
      : [];

    const existingTranscript = Array.isArray(interviewSession.transcript)
      ? interviewSession.transcript
      : [];

    const lastTurn = existingTranscript[existingTranscript.length - 1] || null;
    const isAnsweringFollowUp =
      Boolean(lastTurn?.followUpQuestion) &&
      (questionId.includes("followup") || questionId === `${lastTurn.questionId}_followup`);

    let currentQuestion;

    if (isAnsweringFollowUp) {
      // Reconstruct dynamic question context from the previous turn's follow-up prompt
      currentQuestion = {
        id: questionId,
        category: lastTurn.category || "TECHNICAL",
        focusTopic: lastTurn.focusTopic || "Deep-Dive",
        difficulty: lastTurn.difficulty || interviewSession.difficulty,
        questionText: lastTurn.followUpQuestion,
        expectedConcepts: lastTurn.missingConcepts || [],
        evaluationRubric: {},
        isFollowUp: true,
      };
    } else {
      // Standard blueprint question lookup
      currentQuestion =
        selectedQuestions.find((q) => q.id === questionId) ||
        selectedQuestions[interviewSession.currentQuestionIndex] || {
          id: questionId,
          category: "TECHNICAL",
          questionText: "Please explain your technical approach.",
          expectedConcepts: [],
          evaluationRubric: {},
        };
    }

    const targetRole = interviewSession.user?.profile?.targetRole || null;

    // Evaluate answer with Real-Time Adaptive Engine
    const evaluation = await evaluateCandidateAnswer({
      currentQuestion,
      candidateAnswer: answerText,
      interviewType: interviewSession.interviewType,
      difficulty: interviewSession.difficulty,
      targetRole,
      previousTurns: existingTranscript,
    });

    // Construct the new transcript turn object
    const newTurn = {
      turnIndex: existingTranscript.length + 1,
      questionId: currentQuestion.id || `q_${existingTranscript.length + 1}`,
      questionText: currentQuestion.questionText,
      category: currentQuestion.category || "GENERAL",
      focusTopic: currentQuestion.focusTopic || "Core",
      difficulty: currentQuestion.difficulty || interviewSession.difficulty,
      candidateAnswer: answerText,
      timeTakenSeconds: timeTakenSeconds || 0,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      missingConcepts: evaluation.missingConcepts || [],
      weaknesses: evaluation.weaknesses || [],
      adaptationStrategy: evaluation.adaptationStrategy,
      followUpQuestion: isAnsweringFollowUp ? null : evaluation.followUpQuestion || null,
      aiSpokenResponse: evaluation.aiSpokenResponse,
      timestamp: new Date().toISOString(),
    };

    const updatedTranscript = [...existingTranscript, newTurn];

    const targetQuestionCount =
      interviewSession.questionCount || selectedQuestions.length;
    const totalTurnsAnswered = updatedTranscript.length;

    // Check if session reached the exact total question count
    const isComplete = totalTurnsAnswered >= targetQuestionCount;

    // Follow-up is only spawned if candidate was NOT on a follow-up AND session has remaining question quota
    const isFollowUp =
      !isComplete &&
      !isAnsweringFollowUp &&
      (evaluation.adaptationStrategy === "FOLLOW_UP" ||
        evaluation.adaptationStrategy === "PROBE_FUNDAMENTALS" ||
        evaluation.adaptationStrategy === "ESCALATE") &&
      Boolean(evaluation.followUpQuestion);

    // Calculate progression: advance index if not generating a follow-up
    let nextQuestionIndex = interviewSession.currentQuestionIndex;
    if (!isFollowUp) {
      nextQuestionIndex += 1;
    }

    let executiveSummary = null;
    let finalOverallScore = null;

    if (isComplete) {
      // Generate final executive summary
      executiveSummary = await generateExecutiveSessionSummary({
        session: interviewSession,
        allTurns: updatedTranscript,
        targetRole,
      });
      finalOverallScore = executiveSummary.overallScore;

      // Update session to COMPLETED in database
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          currentQuestionIndex: nextQuestionIndex,
          transcript: updatedTranscript,
          overallScore: finalOverallScore,
          feedbackSummary: executiveSummary,
        },
      });
    } else {
      // Update session progress in database
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: "IN_PROGRESS",
          startedAt: interviewSession.startedAt || new Date(),
          currentQuestionIndex: nextQuestionIndex,
          transcript: updatedTranscript,
        },
      });
    }

    const nextQuestion = isComplete
      ? null
      : isFollowUp
      ? {
          id: `${currentQuestion.id}_followup`,
          category: currentQuestion.category,
          focusTopic: currentQuestion.focusTopic,
          difficulty:
            evaluation.adaptationStrategy === "ESCALATE" ? "HARD" : currentQuestion.difficulty,
          questionText: evaluation.followUpQuestion,
          expectedConcepts: evaluation.missingConcepts || [],
          evaluationRubric: currentQuestion.evaluationRubric || {},
          isFollowUp: true,
          parentQuestionId: currentQuestion.id,
        }
      : selectedQuestions[nextQuestionIndex] || null;

    return NextResponse.json({
      success: true,
      evaluation,
      turn: newTurn,
      nextQuestion,
      isFollowUp,
      isComplete,
      currentQuestionIndex: nextQuestionIndex,
      totalQuestions: selectedQuestions.length,
      transcript: updatedTranscript,
      feedbackSummary: executiveSummary,
    });
  } catch (error) {
    console.error("Error processing interview chat turn:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process interview response." },
      { status: 500 }
    );
  }
}
