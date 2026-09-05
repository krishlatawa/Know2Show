import { z } from "zod";

export const SENIORITY_LEVELS = [
  { value: "ENTRY", label: "Entry-Level / Junior (0-2 yrs)" },
  { value: "MID", label: "Mid-Level (2-5 yrs)" },
  { value: "SENIOR", label: "Senior (5-8 yrs)" },
  { value: "LEAD", label: "Lead / Principal (8+ yrs)" },
  { value: "EXECUTIVE", label: "Director / Executive" },
];

export const COMPANY_TYPES = [
  { value: "FAANG", label: "FAANG & Big Tech" },
  { value: "STARTUP", label: "Fast-Paced Startup" },
  { value: "ENTERPRISE", label: "Enterprise & Corporate" },
  { value: "FINTECH", label: "Fintech & Banking" },
  { value: "AGENCY", label: "Consulting & Agency" },
];

export const DIFFICULTY_LEVELS = [
  { value: "EASY", label: "Easy - Fundamental Concepts" },
  { value: "MEDIUM", label: "Medium - Standard Technical & Behavioral" },
  { value: "HARD", label: "Hard - Advanced In-Depth Architecture" },
  { value: "FAANG_LEVEL", label: "FAANG-Level - Top-Tier Rigorous" },
];

export const candidateProfileSchema = z.object({
  headline: z.string().min(2, "Headline must be at least 2 characters").max(100, "Headline cannot exceed 100 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative").max(50, "Experience cannot exceed 50 years"),
  seniorityLevel: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"], {
    errorMap: () => ({ message: "Please select a valid seniority level" }),
  }),
  skills: z.array(z.string().min(1)).min(1, "Please add at least one primary skill"),
  githubUrl: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
});

export const targetRoleSchema = z.object({
  roleTitle: z.string().min(2, "Role title must be at least 2 characters").max(100, "Role title cannot exceed 100 characters"),
  companyType: z.string().min(1, "Please select a target company type"),
  jobDescription: z.string().max(5000, "Job description cannot exceed 5000 characters").optional().or(z.literal("")),
  focusTopics: z.array(z.string().min(1)).min(1, "Please add at least one key focus topic"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "FAANG_LEVEL"], {
    errorMap: () => ({ message: "Please select a difficulty level" }),
  }),
});

export const onboardingSubmissionSchema = z.object({
  profile: candidateProfileSchema,
  targetRole: targetRoleSchema,
});
