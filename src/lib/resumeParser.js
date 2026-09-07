import { ai } from "./gemini";

/**
 * Prompt instruction to guide Gemini to extract structured Skills, Projects, Experience, and Technologies.
 */
const RESUME_ANALYSIS_SYSTEM_INSTRUCTION = `
You are an expert technical recruiter and resume analyst for high-tier software engineering and tech roles.
Analyze the given resume thoroughly and extract structured details.

Rules:
1. Candidate Info: Identify full name, professional headline, and a crisp 2-3 sentence bio summarizing domain strengths.
2. Experience Years & Seniority: Calculate total cumulative years of tech experience. Categorize seniority strictly as one of: ENTRY (0-2 yrs), MID (2-5 yrs), SENIOR (5-8 yrs), LEAD (8-12 yrs), EXECUTIVE (12+ yrs).
3. Categorized Skills: Group skills logically into categories such as "Languages", "Frameworks & Libraries", "Databases & Storage", "Cloud & DevOps", "Architecture & Concepts", "Tools & Platforms".
4. Technologies: Produce a deduplicated flat list of all specific technologies, tools, libraries, languages, and protocols mentioned.
5. Experience: Extract every job entry with company name, role title, approximate dates, location, a concise summary of responsibilities, specific technologies used in that role, and quantifiable achievement bullet points (e.g. reduced latency by 30%, led team of 5).
6. Projects: Extract all highlighted personal, open-source, or portfolio projects including title, description, user's role, technologies used, key highlights/impact, and links (GitHub / Live Demo) if present.
7. Education: Extract degrees, institutions, fields of study, and graduation years.

Output must be strictly valid JSON matching the requested structure.
`;

const RESUME_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    candidateName: { type: "STRING" },
    headline: { type: "STRING" },
    bio: { type: "STRING" },
    totalYearsExp: { type: "INTEGER" },
    seniorityLevel: {
      type: "STRING",
      enum: ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"],
    },
    skills: {
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
    technologies: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          company: { type: "STRING" },
          role: { type: "STRING" },
          startDate: { type: "STRING" },
          endDate: { type: "STRING" },
          isCurrent: { type: "BOOLEAN" },
          location: { type: "STRING" },
          description: { type: "STRING" },
          technologiesUsed: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          achievements: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["company", "role", "description", "technologiesUsed", "achievements"],
      },
    },
    projects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          role: { type: "STRING" },
          technologiesUsed: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          highlights: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          githubUrl: { type: "STRING" },
          liveUrl: { type: "STRING" },
        },
        required: ["title", "description", "technologiesUsed", "highlights"],
      },
    },
    education: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          institution: { type: "STRING" },
          degree: { type: "STRING" },
          fieldOfStudy: { type: "STRING" },
          graduationYear: { type: "STRING" },
        },
        required: ["institution", "degree"],
      },
    },
  },
  required: [
    "candidateName",
    "headline",
    "bio",
    "totalYearsExp",
    "seniorityLevel",
    "skills",
    "technologies",
    "experience",
    "projects",
    "education",
  ],
};

/**
 * Analyzes resume content (either buffer for PDF or raw text) using Google Gemini.
 * @param {Object} params
 * @param {Buffer|null} params.fileBuffer - Optional binary file buffer (e.g., PDF)
 * @param {string|null} params.mimeType - MIME type of the file (e.g. application/pdf)
 * @param {string|null} params.rawText - Raw text of resume if submitted as text
 * @returns {Promise<Object>} Parsed resume object
 */
export async function analyzeResume({ fileBuffer, mimeType, rawText }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const parts = [];

  if (fileBuffer && mimeType) {
    // Multimodal document upload (PDF/Text)
    const base64Data = fileBuffer.toString("base64");
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    });
    parts.push({
      text: "Please extract all candidate information, skills, technologies, work experience, projects, and education according to the required schema.",
    });
  } else if (rawText) {
    parts.push({
      text: `Resume Text to Analyze:\n\n${rawText}`,
    });
  } else {
    throw new Error("Either a file or resume raw text must be provided.");
  }

  // Model hierarchy: gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash
  const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: parts,
    config: {
      systemInstruction: RESUME_ANALYSIS_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESUME_JSON_SCHEMA,
      temperature: 0.1, // low temperature for high extraction consistency
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
    console.error("Failed to parse Gemini JSON output:", responseText);
    throw new Error("Invalid JSON structure returned by AI model.");
  }
}
