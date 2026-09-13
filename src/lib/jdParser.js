import { ai } from "./gemini";

const JD_ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert technical recruiter and job specification analyst for high-tier engineering and tech roles.
Analyze the given Job Description (which may be provided as text, a PDF document, or an image screenshot of a job posting).

Extract the following structured information:
1. Target Job Title & Seniority Level (ENTRY, MID, SENIOR, LEAD, EXECUTIVE).
2. Categorized Required Skills (e.g. "Core Languages", "Frameworks & Architecture", "Database & Storage", "Cloud & DevOps", "Methodologies").
3. Flat list of Required Technologies (all mandatory & preferred tools/tech mentioned).
4. Key Responsibilities (clear, concise list of core duties).
5. Role Expectations: Domain knowledge expectations, soft skills/leadership traits, and minimum years of experience required.
6. Recommended Focus Areas: Top 4-6 specific technical topics an interviewer should test to evaluate candidate readiness for THIS specific role (e.g., "System Design for High Concurrency", "PostgreSQL Query Tuning", "React State Architecture").

Output must be strictly valid JSON matching the requested schema.
`;

const JD_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    roleTitle: { type: "STRING" },
    seniorityLevel: {
      type: "STRING",
      enum: ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"],
    },
    companyType: { type: "STRING" },
    requiredSkills: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING" },
          items: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["category", "items"],
      },
    },
    requiredTechnologies: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    responsibilities: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    roleExpectations: {
      type: "OBJECT",
      properties: {
        domainKnowledge: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        softSkills: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        minimumExperienceYears: { type: "INTEGER" },
      },
      required: ["domainKnowledge", "softSkills"],
    },
    keyFocusAreas: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: [
    "roleTitle",
    "seniorityLevel",
    "requiredSkills",
    "requiredTechnologies",
    "responsibilities",
    "roleExpectations",
    "keyFocusAreas",
  ],
};

/**
 * Analyzes job description from file buffer (PDF or Image) or raw text using Gemini Multimodal AI.
 */
export async function analyzeJobDescription({ fileBuffer, mimeType, rawText }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const parts = [];

  if (fileBuffer && mimeType) {
    const base64Data = fileBuffer.toString("base64");
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
    parts.push({
      text: "Please extract all job description details, required skills, technologies, responsibilities, role expectations, and recommended focus areas according to the JSON schema.",
    });
  } else if (rawText) {
    parts.push({
      text: `Job Description Text to Analyze:\n\n${rawText}`,
    });
  } else {
    throw new Error("Either a file (PDF/Image) or raw text must be provided.");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: parts,
    config: {
      systemInstruction: JD_ANALYSIS_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: JD_JSON_SCHEMA,
      temperature: 0.1,
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Empty response received from Gemini AI model.");
  }

  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    console.error("Failed to parse Gemini JD JSON output:", responseText);
    throw new Error("Invalid JSON returned by AI model.");
  }
}

/**
 * Calculates Candidate vs Job Description Skill Gap analysis.
 */
export function calculateSkillGap(resumeAnalysis, jdAnalysis) {
  if (!jdAnalysis) return null;

  const candidateSkills = new Set(
    (resumeAnalysis?.technologies || [])
      .concat(resumeAnalysis?.skills?.flatMap((s) => s.items) || [])
      .map((s) => s.toLowerCase().trim())
  );

  const requiredTechs = jdAnalysis.requiredTechnologies || [];
  const requiredSkillItems = jdAnalysis.requiredSkills?.flatMap((s) => s.items) || [];
  const totalRequired = Array.from(new Set([...requiredTechs, ...requiredSkillItems]));

  if (totalRequired.length === 0) {
    return {
      matchPercentage: 80,
      matchingSkills: candidateSkills.size > 0 ? Array.from(candidateSkills).slice(0, 10) : [],
      missingCriticalSkills: [],
      overqualifiedSkills: [],
      recommendedFocusAreas: jdAnalysis.keyFocusAreas || [],
    };
  }

  const matching = [];
  const missing = [];

  totalRequired.forEach((req) => {
    const reqLower = req.toLowerCase().trim();
    let isMatch = candidateSkills.has(reqLower);

    // Partial substring match check (e.g., "PostgreSQL" vs "Postgres")
    if (!isMatch) {
      for (const candSkill of candidateSkills) {
        if (candSkill.includes(reqLower) || reqLower.includes(candSkill)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      matching.push(req);
    } else {
      missing.push(req);
    }
  });

  const matchPercentage = Math.round((matching.length / totalRequired.length) * 100);

  // Recommended focus areas combining missing critical skills and AI focus topics
  const recommendedFocusAreas = Array.from(
    new Set([...missing.slice(0, 4), ...(jdAnalysis.keyFocusAreas || [])])
  ).slice(0, 6);

  return {
    matchPercentage: Math.min(Math.max(matchPercentage, 15), 100), // bounded between 15% and 100%
    matchingSkills: matching,
    missingCriticalSkills: missing,
    overqualifiedSkills: Array.from(candidateSkills)
      .filter((s) => !totalRequired.some((r) => r.toLowerCase().includes(s)))
      .slice(0, 8),
    recommendedFocusAreas,
  };
}
