import { ai } from "./gemini";

const RAG_PLAN_SYSTEM_INSTRUCTION = `
You are an elite Lead Interviewer and Technical Assessment Architect for top software engineering companies (FAANG, High-Growth Startups, Enterprise Tech).
Your task is to generate a highly personalized, rigorous 5-to-8 question Interview Plan blueprint tailored specifically to the candidate's profile, target role, and identified skill gaps.

Blueprint Requirements:
1. Question Balance: Generate 5 to 8 questions divided across 4 categories:
   - TECHNICAL: Deep-dive questions into core languages, frameworks, and engineering fundamentals.
   - GAP_PROBING: Target questions specifically designed to probe identified missing/unverified skills from the candidate's skill gap radar!
   - SYSTEM_DESIGN: Scalability, architecture, data modeling, API design, or state architecture questions.
   - BEHAVIORAL: Leadership, conflict resolution, or past project trade-offs (STAR method).
2. For EACH Question, provide:
   - id: Unique identifier (e.g., "q1", "q2").
   - order: Question number (1, 2, 3...).
   - category: One of TECHNICAL, SYSTEM_DESIGN, GAP_PROBING, BEHAVIORAL.
   - questionText: The exact, scenario-based question text.
   - focusTopic: Specific technical or behavioral topic being evaluated.
   - difficulty: Difficulty level (EASY, MEDIUM, HARD, FAANG_LEVEL).
   - expectedConcepts: 3-5 specific technical concepts or terms the candidate MUST touch upon for a full score.
   - evaluationRubric: Concrete criteria for "poor" (failing answer), "average" (passing answer), and "excellent" (top 5% answer).
   - hint: Helpful guidance for the candidate if stuck.

Output must strictly match the JSON schema.
`;

const INTERVIEW_PLAN_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    difficulty: {
      type: "STRING",
      enum: ["EASY", "MEDIUM", "HARD", "FAANG_LEVEL"],
    },
    summary: { type: "STRING" },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          order: { type: "INTEGER" },
          category: {
            type: "STRING",
            enum: ["TECHNICAL", "SYSTEM_DESIGN", "GAP_PROBING", "BEHAVIORAL"],
          },
          questionText: { type: "STRING" },
          focusTopic: { type: "STRING" },
          difficulty: {
            type: "STRING",
            enum: ["EASY", "MEDIUM", "HARD", "FAANG_LEVEL"],
          },
          expectedConcepts: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          evaluationRubric: {
            type: "OBJECT",
            properties: {
              poor: { type: "STRING" },
              average: { type: "STRING" },
              excellent: { type: "STRING" },
            },
            required: ["poor", "average", "excellent"],
          },
          hint: { type: "STRING" },
        },
        required: [
          "id",
          "order",
          "category",
          "questionText",
          "focusTopic",
          "difficulty",
          "expectedConcepts",
          "evaluationRubric",
        ],
      },
    },
  },
  required: ["title", "difficulty", "summary", "questions"],
};

/**
 * Synthesizes candidate background, target role, JD requirements, and skill gaps into a structured Interview Plan.
 */
export async function generatePersonalizedInterviewPlan({
  profile,
  targetRole,
  resumeAnalysis,
  jdAnalysis,
  overrideFocusTopics = [],
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  // Compile RAG Context
  const candidateSeniority = profile?.seniorityLevel || "MID";
  const candidateYearsExp = profile?.experienceYears ?? 2;
  const candidateSkills = (profile?.skills || []).concat(resumeAnalysis?.technologies || []).join(", ");
  const candidateProjects = (resumeAnalysis?.projects || []).map((p) => `${p.title}: ${p.description}`).join(" | ");

  const roleTitle = targetRole?.roleTitle || "Software Engineer";
  const companyType = targetRole?.companyType || "FAANG";
  const difficulty = targetRole?.difficulty || "MEDIUM";
  const focusTopics = Array.from(new Set([...(targetRole?.focusTopics || []), ...overrideFocusTopics])).join(", ");

  const requiredTechs = jdAnalysis?.requiredTechnologies?.join(", ") || "General Engineering";
  const missingCriticalSkills = jdAnalysis?.skillGap?.missingCriticalSkills?.join(", ") || "None identified";
  const matchedSkills = jdAnalysis?.skillGap?.matchingSkills?.join(", ") || "General Stack";

  const userContextPrompt = `
Generate a Personalized Mock Interview Plan for this Candidate:

--- CANDIDATE PROFILE ---
- Seniority Level: ${candidateSeniority} (${candidateYearsExp} years experience)
- Primary Skills: ${candidateSkills || "Full-Stack Software Engineering"}
- Key Highlighted Projects: ${candidateProjects || "Full-stack web application development"}

--- TARGET ROLE & GOAL ---
- Target Role Title: ${roleTitle}
- Target Company Type: ${companyType} (Calibrate question style to this culture)
- Overall Target Difficulty: ${difficulty}
- Primary Focus Topics: ${focusTopics || "System Design, Algorithms, Web Architecture"}

--- JOB SPECIFICATION & SKILL GAP CONTEXT ---
- Required Technologies for Job: ${requiredTechs}
- Matched Strengths: ${matchedSkills}
- MISSING CRITICAL SKILLS (MUST PROBE IN GAP_PROBING QUESTIONS): ${missingCriticalSkills}

Generate a balanced 5-to-8 question blueprint. Ensure at least 1-2 questions specifically probe the candidate's missing critical skills (${missingCriticalSkills}).
`;

  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ text: userContextPrompt }],
    config: {
      systemInstruction: RAG_PLAN_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: INTERVIEW_PLAN_JSON_SCHEMA,
      temperature: 0.2, // Slightly higher for varied questions, yet structured
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Empty response received from Gemini RAG engine.");
  }

  try {
    const parsedPlan = JSON.parse(responseText);
    return parsedPlan;
  } catch (err) {
    console.error("Failed to parse RAG Interview Plan JSON output:", responseText);
    throw new Error("Invalid JSON structure returned by RAG engine.");
  }
}
