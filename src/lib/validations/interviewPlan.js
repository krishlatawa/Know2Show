import { z } from "zod";

export const evaluationRubricSchema = z.object({
  poor: z.string().min(1, "Poor rubric criteria required"),
  average: z.string().min(1, "Average rubric criteria required"),
  excellent: z.string().min(1, "Excellent rubric criteria required"),
});

export const questionBlueprintSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1),
  category: z.enum(["TECHNICAL", "SYSTEM_DESIGN", "GAP_PROBING", "BEHAVIORAL"]),
  questionText: z.string().min(10, "Question text must be at least 10 characters"),
  focusTopic: z.string().min(1, "Focus topic is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "FAANG_LEVEL"]).default("MEDIUM"),
  expectedConcepts: z.array(z.string().min(1)).min(1, "At least 1 expected concept required"),
  evaluationRubric: evaluationRubricSchema,
  hint: z.string().optional().default("Focus on clear structure, trade-offs, and core principles."),
});

export const interviewPlanSchema = z.object({
  title: z.string().min(3, "Title is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "FAANG_LEVEL"]).default("MEDIUM"),
  summary: z.string().optional().default(""),
  questions: z.array(questionBlueprintSchema).min(3, "Interview plan must contain at least 3 questions"),
});

export const generatePlanRequestSchema = z.object({
  targetRoleId: z.string().optional(),
  overrideFocusTopics: z.array(z.string()).optional(),
});
