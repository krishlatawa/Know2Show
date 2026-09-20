import { z } from "zod";

// Adaptation Strategies for the Adaptive Interviewer
export const adaptationStrategyEnum = z.enum([
  "ESCALATE",          // Strong answer (Score >= 80) -> Raise difficulty / add scale constraints
  "PROBE_FUNDAMENTALS", // Weak answer (Score < 50) -> Drop down to core foundational concepts
  "FOLLOW_UP",         // Partial/Vague answer (Score 50-79) -> Probe missing concepts specifically
  "PROCEED",           // Clean answer -> Advance directly to next blueprint question
]);

// 1. Candidate Answer Submission Schema (Client -> API)
export const candidateAnswerSubmissionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  questionId: z.string().min(1, "Question ID is required"),
  answerText: z.string().min(3, "Answer must be at least 3 characters long"),
  timeTakenSeconds: z.number().int().nonnegative().optional().default(0),
  audioDurationSeconds: z.number().nonnegative().optional().default(0),
});

// 2. AI Real-Time Answer Evaluation Schema (Gemini LLM -> Backend)
export const answerEvaluationOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(5, "Evaluation feedback is required"),
  strengths: z.array(z.string()).min(1, "At least one strength must be noted"),
  missingConcepts: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  adaptationStrategy: adaptationStrategyEnum,
  followUpQuestion: z.string().nullable().optional(),
  aiSpokenResponse: z.string().min(5, "AI spoken transition response is required"),
});

// 3. Transcript Turn Schema (Database Persisted Item)
export const transcriptTurnSchema = z.object({
  turnIndex: z.number().int().positive(),
  questionId: z.string(),
  questionText: z.string(),
  category: z.string(),
  focusTopic: z.string().optional(),
  difficulty: z.string().optional(),
  candidateAnswer: z.string(),
  timeTakenSeconds: z.number().optional(),
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()),
  missingConcepts: z.array(z.string()),
  weaknesses: z.array(z.string()),
  adaptationStrategy: adaptationStrategyEnum,
  followUpQuestion: z.string().nullable().optional(),
  aiSpokenResponse: z.string(),
  timestamp: z.string().datetime(),
});

// 4. Final Session Completion Summary Schema
export const sessionFeedbackSummarySchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  totalQuestionsAnswered: z.number().int().nonnegative(),
  performanceLevel: z.enum(["EXEMPLARY", "STRONG", "NEEDS_IMPROVEMENT", "UNSATISFACTORY"]),
  summaryHeadline: z.string(),
  executiveSummary: z.string(),
  topStrengths: z.array(z.string()).min(1),
  criticalSkillGaps: z.array(z.string()),
  recommendedActionPlan: z.array(z.string()).min(1),
});
