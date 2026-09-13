import { z } from "zod";

export const jdSkillCategorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
  items: z.array(z.string().min(1)).default([]),
});

export const roleExpectationsSchema = z.object({
  domainKnowledge: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  minimumExperienceYears: z.number().int().min(0).optional().default(0),
});

export const parsedJdSchema = z.object({
  roleTitle: z.string().optional().default(""),
  seniorityLevel: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"]).default("MID"),
  companyType: z.string().optional().default("TECH_COMPANY"),
  requiredSkills: z.array(jdSkillCategorySchema).default([]),
  requiredTechnologies: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  roleExpectations: roleExpectationsSchema.default({ domainKnowledge: [], softSkills: [], minimumExperienceYears: 0 }),
  keyFocusAreas: z.array(z.string()).default([]),
});

export const skillGapSchema = z.object({
  matchPercentage: z.number().min(0).max(100).default(0),
  matchingSkills: z.array(z.string()).default([]),
  missingCriticalSkills: z.array(z.string()).default([]),
  overqualifiedSkills: z.array(z.string()).default([]),
  recommendedFocusAreas: z.array(z.string()).default([]),
});
