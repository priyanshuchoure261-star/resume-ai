import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RETRIES = 3;

type JobAnalysis = {
  company: string;
  role: string;
  jobType: "job" | "internship" | "fresher" | "unknown";
  location: string;
  summary: string;

  requiredSkills: string[];
  preferredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];

  education: string[];
  experience: string[];

  keywords: string[];
  responsibilities: string[];

  candidateGuidance: string[];
  skillGapGuidance: string[];
  learningRoadmap: string[];
};

function cleanJsonText(text: string): string {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAnalysis(data: any): JobAnalysis {
  const validJobTypes = [
    "job",
    "internship",
    "fresher",
    "unknown",
  ] as const;

  const jobType = validJobTypes.includes(data?.jobType)
    ? data.jobType
    : "unknown";

  return {
    company:
      typeof data?.company === "string"
        ? data.company.trim()
        : "",

    role:
      typeof data?.role === "string"
        ? data.role.trim()
        : "",

    jobType,

    location:
      typeof data?.location === "string"
        ? data.location.trim()
        : "",

    summary:
      typeof data?.summary === "string"
        ? data.summary.trim()
        : "",

    requiredSkills: normalizeStringArray(
      data?.requiredSkills
    ),

    preferredSkills: normalizeStringArray(
      data?.preferredSkills
    ),

    technicalSkills: normalizeStringArray(
      data?.technicalSkills
    ),

    softSkills: normalizeStringArray(
      data?.softSkills
    ),

    education: normalizeStringArray(
      data?.education
    ),

    experience: normalizeStringArray(
      data?.experience
    ),

    keywords: normalizeStringArray(
      data?.keywords
    ),

    responsibilities: normalizeStringArray(
      data?.responsibilities
    ),

    candidateGuidance: normalizeStringArray(
      data?.candidateGuidance
    ),

    skillGapGuidance: normalizeStringArray(
      data?.skillGapGuidance
    ),

    learningRoadmap: normalizeStringArray(
      data?.learningRoadmap
    ),
  };
}

function buildPrompt(input: {
  company?: string;
  role?: string;
  jobType?: string;
  jobDescription?: string;
}) {
  const company =
    input.company?.trim() || "Not provided";

  const role =
    input.role?.trim() || "Not provided";

  const jobType =
    input.jobType?.trim() || "unknown";

  const jobDescription =
    input.jobDescription?.trim() || "Not provided";

  return `
You are the Job Analysis Engine of a real-world AI Resume and Career platform.

Analyze the target company, position and job description.

IMPORTANT RULES:

1. Do not invent specific company facts.
2. Use only information supported by the provided input.
3. Do not tell the candidate to claim skills they do not have.
4. Never create fake experience, projects, certifications or achievements.
5. If information is missing, use an empty array or "Not provided".
6. Support full-time jobs, internships and fresher roles.
7. For internships and fresher roles, pay special attention to:
   projects, coursework, education, skills, certifications and learning potential.
8. Keep the analysis practical for resume building.
9. Return ONLY valid JSON.
10. Do not return markdown or code fences.

TARGET INFORMATION

Company:
${company}

Role:
${role}

Job Type:
${jobType}

Job Description:
${jobDescription}

Return exactly this JSON structure:

{
  "company": "string",
  "role": "string",
  "jobType": "job | internship | fresher | unknown",
  "location": "string",
  "summary": "string",

  "requiredSkills": [
    "skill"
  ],

  "preferredSkills": [
    "skill"
  ],

  "technicalSkills": [
    "skill"
  ],

  "softSkills": [
    "skill"
  ],

  "education": [
    "requirement"
  ],

  "experience": [
    "requirement"
  ],

  "keywords": [
    "important resume keyword"
  ],

  "responsibilities": [
    "responsibility"
  ],

  "candidateGuidance": [
    "practical guidance for the candidate"
  ],

  "skillGapGuidance": [
    "skill gap or preparation guidance"
  ],

  "learningRoadmap": [
    "learning step"
  ]
}

For learningRoadmap:
Keep the order logical from fundamentals to role preparation.

For candidateGuidance:
Explain what the candidate should genuinely improve or demonstrate.

For skillGapGuidance:
Mention what evidence the candidate should have before claiming a skill.
`;
}

function isRetryableStatus(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function getRetryDelay(attempt: number): number {
  const baseDelay = 1500 * Math.pow(2, attempt);

  const jitter =
    Math.floor(Math.random() * 700);

  return baseDelay + jitter;
}

async function wait(ms: number) {
  await new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function callGemini(prompt: string) {
  let lastResponseText = "";

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      const response = await fetch(
        `${GEMINI_URL}?key=${encodeURIComponent(
          GEMINI_API_KEY as string
        )}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              responseMimeType:
                "application/json",

              thinkingConfig: {
                thinkingLevel: "low",
              },
            },
          }),

          cache: "no-store",
        }
      );

      const responseText =
        await response.text();

      lastResponseText = responseText;

      if (response.ok) {
        return {
          response,
          responseText,
        };
      }

      if (
        !isRetryableStatus(response.status) ||
        attempt === MAX_RETRIES
      ) {
        return {
          response,
          responseText,
        };
      }

      const delay =
        getRetryDelay(attempt);

      console.warn(
        `Gemini temporary error ${response.status}. Retrying in ${delay}ms...`
      );

      await wait(delay);
    } catch (error) {
      console.error(
        `Gemini request attempt ${
          attempt + 1
        } failed:`,
        error
      );

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      const delay =
        getRetryDelay(attempt);

      await wait(delay);
    }
  }

  throw new Error(
    lastResponseText ||
      "Gemini request failed after retries."
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API key is not configured. Please check GEMINI_API_KEY in .env.local.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const company =
      typeof body?.company === "string"
        ? body.company.trim()
        : "";

    const role =
      typeof body?.role === "string"
        ? body.role.trim()
        : "";

    const jobType =
      typeof body?.jobType === "string"
        ? body.jobType.trim()
        : "";

    const jobDescription =
      typeof body?.jobDescription === "string"
        ? body.jobDescription.trim()
        : "";

    if (
      !company &&
      !role &&
      !jobDescription
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide at least a company, role, or job description.",
          code: "MISSING_JOB_DATA",
        },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      company,
      role,
      jobType,
      jobDescription,
    });

    const result =
      await callGemini(prompt);

    const response =
      result.response;

    const responseText =
      result.responseText;

    let responseData: any = null;

    try {
      responseData =
        JSON.parse(responseText);
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      const apiMessage =
        responseData?.error?.message ||
        "Gemini API request failed.";

      if (response.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gemini is temporarily busy or the API rate limit was reached. Please wait a few seconds and try again.",
            code: "RATE_LIMITED",
          },
          { status: 429 }
        );
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gemini API authentication failed. Please check your GEMINI_API_KEY.",
            code: "AUTH_ERROR",
          },
          {
            status: response.status,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: apiMessage,
          code: "GEMINI_API_ERROR",
        },
        {
          status: response.status,
        }
      );
    }

    const generatedText =
      responseData
        ?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (
      typeof generatedText !== "string" ||
      !generatedText.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini returned an empty analysis response.",
          code: "EMPTY_AI_RESPONSE",
        },
        { status: 502 }
      );
    }

    let parsedAnalysis: any;

    try {
      parsedAnalysis =
        JSON.parse(
          cleanJsonText(
            generatedText
          )
        );
    } catch (error) {
      console.error(
        "INVALID_GEMINI_JSON:",
        generatedText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini returned an invalid analysis format. Please try again.",
          code: "INVALID_AI_JSON",
        },
        { status: 502 }
      );
    }

    const analysis =
      normalizeAnalysis(
        parsedAnalysis
      );

    return NextResponse.json({
      success: true,
      analysis,
      meta: {
        model: GEMINI_MODEL,
      },
    });
  } catch (error) {
    console.error(
      "ANALYZE_JOB_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to analyze the job right now. Please try again in a few seconds.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}