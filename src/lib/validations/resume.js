import { z } from "zod";

export const skillCategorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
  items: z.array(z.string().min(1)).default([]),
});

export const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role title is required"),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  isCurrent: z.boolean().optional().default(false),
  location: z.string().optional().default(""),
  description: z.string().default(""),
  technologiesUsed: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().default(""),
  role: z.string().optional().default(""),
  technologiesUsed: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  githubUrl: z.string().optional().default(""),
  liveUrl: z.string().optional().default(""),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional().default(""),
  graduationYear: z.string().optional().default(""),
});

export const parsedResumeSchema = z.object({
  candidateName: z.string().optional().default(""),
  headline: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  totalYearsExp: z.number().int().min(0).default(0),
  seniorityLevel: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"]).default("MID"),
  skills: z.array(skillCategorySchema).default([]),
  technologies: z.array(z.string()).default([]),
  experience: z.array(workExperienceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  education: z.array(educationSchema).default([]),
});

export const resumeTextRequestSchema = z.object({
  rawText: z.string().min(30, "Resume text must be at least 30 characters"),
});
