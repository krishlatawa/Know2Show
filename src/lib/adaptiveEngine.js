import { ai, callGeminiWithRetry } from "./gemini";
import { answerEvaluationOutputSchema, sessionFeedbackSummarySchema } from "./validations/adaptiveChat";

const ADAPTIVE_EVALUATION_SYSTEM_PROMPT = `
You are an elite, highly experienced Lead Technical Interviewer and Hiring Manager for top-tier tech companies (FAANG, High-Growth Startups).
Your task is to analyze the candidate's answer to an interview question in real-time and decide the optimal adaptive interviewing strategy.

Evaluation Rules:
1. Compare the candidate's response specifically against the provided question's 'expectedConcepts' and 'evaluationRubric'.
2. Score the answer from 0 to 100:
   - 80-100 (Excellent): Clear, structured, correct, touched upon key expected concepts, addressed trade-offs.
   - 50-79 (Average/Partial): Correct direction, but missed critical concepts, lacked depth, or was slightly ambiguous.
   - 0-49 (Poor/Flawed): Factually incorrect, missed foundational principles, or gave a non-viable answer.
3. Determine the Adaptation Strategy:
   - If Score >= 80: 'ESCALATE'. Generate a follow-up pushing for higher scale, edge-cases, or architectural constraints.
   - If Score < 50: 'PROBE_FUNDAMENTALS'. Target the single most important missing concept and ask a simpler fundamental question.
   - If Score 50-79: 'FOLLOW_UP'. Ask a specific clarifying follow-up probing the concepts they omitted.
   - If the candidate fully exhausted this topic and another question is preferred: 'PROCEED'.
4. Provide 'aiSpokenResponse': A natural, polite, spoken 1-to-2 sentence verbal transition that an interviewer would say out loud before asking the next question or follow-up.

Output must strictly follow the JSON schema.
`;

const ADAPTIVE_EVALUATION_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    score: { type: "INTEGER" },
    feedback: { type: "STRING" },
    strengths: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    missingConcepts: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    weaknesses: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    adaptationStrategy: {
      type: "STRING",
      enum: ["ESCALATE", "PROBE_FUNDAMENTALS", "FOLLOW_UP", "PROCEED"],
    },
    followUpQuestion: { type: "STRING" },
    aiSpokenResponse: { type: "STRING" },
  },
  required: [
    "score",
    "feedback",
    "strengths",
    "missingConcepts",
    "weaknesses",
    "adaptationStrategy",
    "aiSpokenResponse",
  ],
};

/**
 * Evaluates candidate answer in real-time and produces adaptive turn strategy
 */
export async function evaluateCandidateAnswer({
  currentQuestion,
  candidateAnswer,
  interviewType = "MIXED",
  difficulty = "MEDIUM",
  targetRole = null,
  previousTurns = [],
}) {
  try {
    const promptContext = `
TARGET ROLE SPECIFICATION:
- Role: ${targetRole?.roleTitle || "Software Engineer"}
- Company Type: ${targetRole?.companyType || "Technology"}
- Seniority Level: ${targetRole?.seniorityLevel || "MID"}
- Round Type: ${interviewType}
- Target Difficulty: ${difficulty}

CURRENT QUESTION CONTEXT:
- Category: ${currentQuestion.category}
- Focus Topic: ${currentQuestion.focusTopic || "Core Concepts"}
- Question: "${currentQuestion.questionText}"
- Expected Concepts & Keywords: ${JSON.stringify(currentQuestion.expectedConcepts || [])}
- Evaluation Rubric: ${JSON.stringify(currentQuestion.evaluationRubric || {})}

CANDIDATE'S SUBMITTED ANSWER:
"${candidateAnswer}"

PREVIOUS TURNS IN THIS SESSION:
${previousTurns.slice(-2).map((t, idx) => `Turn ${idx + 1}: Q: "${t.questionText}" -> Answered with score ${t.score}/100`).join("\n") || "First question of session."}

Evaluate the candidate's answer against the expected concepts and rubrics now.
`;

    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: modelName,
        contents: promptContext,
        config: {
          systemInstruction: ADAPTIVE_EVALUATION_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: ADAPTIVE_EVALUATION_JSON_SCHEMA,
          temperature: 0.3,
        },
      })
    );

    const parsedJson = JSON.parse(response.text.trim());
    const validated = answerEvaluationOutputSchema.safeParse(parsedJson);

    if (validated.success) {
      return validated.data;
    }

    console.warn("Schema parse fallback for evaluation:", validated.error);
    return parsedJson;
  } catch (error) {
    console.error("Adaptive evaluation error:", error);
    // Safe deterministic fallback if Gemini call encounters an issue
    return {
      score: 70,
      feedback: "Answer recorded. Demonstrates core understanding of the topic.",
      strengths: ["Clear communication", "Addressed the primary question"],
      missingConcepts: currentQuestion.expectedConcepts?.slice(0, 2) || [],
      weaknesses: [],
      adaptationStrategy: "PROCEED",
      followUpQuestion: null,
      aiSpokenResponse: "Thank you for that explanation. Let's move on to the next question.",
    };
  }
}

/**
 * Generates final executive feedback summary upon interview completion
 */
export async function generateExecutiveSessionSummary({ session, allTurns, targetRole }) {
  try {
    if (!allTurns || allTurns.length === 0) {
      return {
        overallScore: 70,
        totalQuestionsAnswered: 0,
        performanceLevel: "NEEDS_IMPROVEMENT",
        summaryHeadline: "Session Concluded",
        executiveSummary: "Interview concluded with limited responses recorded.",
        topStrengths: ["Participated in mock interview"],
        criticalSkillGaps: ["Incomplete session"],
        recommendedActionPlan: ["Practice complete rounds with time management."],
      };
    }

    const avgScore = Math.round(
      allTurns.reduce((sum, t) => sum + (t.score || 0), 0) / allTurns.length
    );

    const summaryPrompt = `
You are an executive hiring bar raiser. Summarize this completed mock interview session.

TARGET ROLE:
- Role: ${targetRole?.roleTitle || "Software Engineer"}
- Target Difficulty: ${session.difficulty}
- Interview Type: ${session.interviewType}

INTERVIEW TRANSCRIPT TURNS (${allTurns.length} Questions Answered):
${allTurns
  .map(
    (t, idx) => `
Question ${idx + 1} [${t.category}]: "${t.questionText}"
Candidate Answer: "${t.candidateAnswer}"
Score: ${t.score}/100
Strengths: ${JSON.stringify(t.strengths)}
Missing Concepts: ${JSON.stringify(t.missingConcepts)}
`
  )
  .join("\n")}

Compute comprehensive final feedback.
`;

    const SUMMARY_SCHEMA = {
      type: "OBJECT",
      properties: {
        overallScore: { type: "INTEGER" },
        totalQuestionsAnswered: { type: "INTEGER" },
        performanceLevel: {
          type: "STRING",
          enum: ["EXEMPLARY", "STRONG", "NEEDS_IMPROVEMENT", "UNSATISFACTORY"],
        },
        summaryHeadline: { type: "STRING" },
        executiveSummary: { type: "STRING" },
        topStrengths: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        criticalSkillGaps: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        recommendedActionPlan: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
      required: [
        "overallScore",
        "totalQuestionsAnswered",
        "performanceLevel",
        "summaryHeadline",
        "executiveSummary",
        "topStrengths",
        "criticalSkillGaps",
        "recommendedActionPlan",
      ],
    };

    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: modelName,
        contents: summaryPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: SUMMARY_SCHEMA,
          temperature: 0.2,
        },
      })
    );

    const parsed = JSON.parse(response.text.trim());
    const validated = sessionFeedbackSummarySchema.safeParse(parsed);
    return validated.success ? validated.data : parsed;
  } catch (err) {
    console.error("Executive summary generation error:", err);
    const calculatedAvg = Math.round(
      allTurns.reduce((sum, t) => sum + (t.score || 70), 0) / (allTurns.length || 1)
    );
    return {
      overallScore: calculatedAvg,
      totalQuestionsAnswered: allTurns.length,
      performanceLevel: calculatedAvg >= 80 ? "STRONG" : "NEEDS_IMPROVEMENT",
      summaryHeadline: "Interview Session Completed Successfully",
      executiveSummary: `Completed ${allTurns.length} interview questions with an average score of ${calculatedAvg}%.`,
      topStrengths: allTurns.flatMap((t) => t.strengths || []).slice(0, 4),
      criticalSkillGaps: allTurns.flatMap((t) => t.missingConcepts || []).slice(0, 4),
      recommendedActionPlan: ["Review identified missing concepts before onsite rounds."],
    };
  }
}
