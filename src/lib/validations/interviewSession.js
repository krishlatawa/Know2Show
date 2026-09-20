import { z } from "zod";

export const interviewTypeEnum = z.enum([
  "TECHNICAL",
  "BEHAVIORAL",
  "HR",
  "MIXED",
]);

export const sessionDifficultyEnum = z.enum([
  "EASY",
  "MEDIUM",
  "HARD",
  "FAANG_LEVEL",
]);

export const sessionStatusEnum = z.enum([
  "INITIALIZED",
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
]);

export const createInterviewSessionSchema = z.object({
  targetRoleId: z.string().optional(),
  interviewType: interviewTypeEnum.default("MIXED"),
  difficulty: sessionDifficultyEnum.default("MEDIUM"),
  questionCount: z.coerce
    .number()
    .int()
    .min(3, "Session must contain at least 3 questions")
    .max(10, "Session cannot exceed 10 questions")
    .default(5),
  totalDurationMinutes: z.coerce
    .number()
    .int()
    .min(10, "Minimum session duration is 10 minutes")
    .max(90, "Maximum session duration is 90 minutes")
    .default(30),
  enableVideo: z.boolean().default(true),
  enableAudio: z.boolean().default(true),
  customFocusTopics: z.array(z.string()).optional().default([]),
});

export const updateSessionStatusSchema = z.object({
  status: sessionStatusEnum,
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});
