import { NextResponse } from "next/server";

/* =========================================================
   ENV
========================================================= */

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY?.trim();

const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "";

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta";

const GEMINI_TIMEOUT_MS = 60000;

const MAX_RESUME_CONTEXT_LENGTH = 50000;

const MAX_RETRIES = 1;

/* =========================================================
   TYPES
========================================================= */

type GeminiModel = {
  name?: string;
  displayName?: string;
  supportedGenerationMethods?: string[];
};

type GeminiAttemptResult = {
  ok: boolean;
  status: number;
  responseText: string;
  errorMessage: string;
  model: string;
};

/* =========================================================
   RESPONSE SCHEMA
========================================================= */

const analysisSchema = {
  type: "object",

  properties: {
    overallScore: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },

    summary: {
      type: "string",
    },

    verdict: {
      type: "string",
    },

    items: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          score: {
            type: "integer",
            minimum: 0,
            maximum: 100,
          },

          status: {
            type: "string",
            enum: [
              "strong",
              "good",
              "gap",
            ],
          },

          description: {
            type: "string",
          },
        },

        required: [
          "name",
          "score",
          "status",
          "description",
        ],
      },
    },

    keywords: {
      type: "array",

      items: {
        type: "string",
      },
    },

    recommendations: {
      type: "array",

      items: {
        type: "string",
      },
    },

    optimizedResume: {
      type: "object",

      properties: {
        professionalSummary: {
          type: "string",
        },

        skills: {
          type: "array",

          items: {
            type: "string",
          },
        },

        experience: {
          type: "array",

          items: {
            type: "string",
          },
        },

        projects: {
          type: "array",

          items: {
            type: "string",
          },
        },
      },

      required: [
        "professionalSummary",
        "skills",
        "experience",
        "projects",
      ],
    },
  },

  required: [
    "overallScore",
    "summary",
    "verdict",
    "items",
    "keywords",
    "recommendations",
    "optimizedResume",
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getString(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string"
    ? value.trim()
    : fallback;
}

function getBoolean(value: unknown): boolean {
  return value === true;
}

function clampScore(value: unknown): number {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(numberValue)
    )
  );
}

function normalizeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractGeminiError(
  responseText: string
): string {
  if (!responseText) {
    return "Gemini returned an empty error response.";
  }

  try {
    const parsed = JSON.parse(
      responseText
    );

    return (
      parsed?.error?.message ||
      parsed?.message ||
      responseText
    );
  } catch {
    return responseText;
  }
}

function safelySerializeResume(
  resume: unknown
): string {
  if (!resume) {
    return "No structured resume data was provided.";
  }

  try {
    const serialized =
      JSON.stringify(
        resume,
        null,
        2
      );

    if (
      serialized.length >
      MAX_RESUME_CONTEXT_LENGTH
    ) {
      return (
        serialized.slice(
          0,
          MAX_RESUME_CONTEXT_LENGTH
        ) +
        "\n[Resume data truncated]"
      );
    }

    return serialized;
  } catch {
    return "Structured resume data could not be serialized.";
  }
}

/* =========================================================
   NORMALIZE AI RESPONSE
========================================================= */

function normalizeAnalysis(
  analysis: any
) {
  const safeAnalysis =
    analysis &&
    typeof analysis === "object"
      ? analysis
      : {};

  const rawItems =
    Array.isArray(
      safeAnalysis.items
    )
      ? safeAnalysis.items
      : [];

  const items = rawItems
    .filter(
      (item: any) =>
        item &&
        typeof item === "object"
    )
    .map((item: any) => ({
      name: getString(
        item.name,
        "Requirement"
      ),

      score: clampScore(
        item.score
      ),

      status:
        item.status === "strong" ||
        item.status === "good" ||
        item.status === "gap"
          ? item.status
          : "gap",

      description: getString(
        item.description
      ),
    }));

  const optimizedResume =
    safeAnalysis.optimizedResume &&
    typeof safeAnalysis.optimizedResume ===
      "object"
      ? safeAnalysis.optimizedResume
      : {};

  return {
    overallScore:
      clampScore(
        safeAnalysis.overallScore
      ),

    summary:
      getString(
        safeAnalysis.summary
      ),

    verdict:
      getString(
        safeAnalysis.verdict
      ),

    items,

    keywords:
      normalizeStringArray(
        safeAnalysis.keywords
      ),

    recommendations:
      normalizeStringArray(
        safeAnalysis.recommendations
      ),

    optimizedResume: {
      professionalSummary:
        getString(
          optimizedResume.professionalSummary
        ),

      skills:
        normalizeStringArray(
          optimizedResume.skills
        ),

      experience:
        normalizeStringArray(
          optimizedResume.experience
        ),

      projects:
        normalizeStringArray(
          optimizedResume.projects
        ),
    },
  };
}

/* =========================================================
   GET AVAILABLE GEMINI MODELS
========================================================= */

/*
 * We do NOT hardcode one Gemini model.
 *
 * This is important because different API keys/projects
 * can have access to different Gemini models.
 */

async function getAvailableModels(): Promise<
  string[]
> {
  if (!GEMINI_API_KEY) {
    return [];
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    15000
  );

  try {
    const response =
      await fetch(
        `${GEMINI_API_BASE}/models?pageSize=100`,
        {
          method: "GET",

          headers: {
            "x-goog-api-key":
              GEMINI_API_KEY,
          },

          signal: controller.signal,

          cache: "no-store",
        }
      );

    const responseText =
      await response.text();

    if (!response.ok) {
      console.error(
        "Gemini model discovery failed:",
        {
          status:
            response.status,
          message:
            extractGeminiError(
              responseText
            ),
        }
      );

      return [];
    }

    let data: any;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch {
      return [];
    }

    const models =
      Array.isArray(
        data?.models
      )
        ? (data.models as GeminiModel[])
        : [];

    const generationModels =
      models
        .filter(
          (model) =>
            Array.isArray(
              model.supportedGenerationMethods
            ) &&
            model.supportedGenerationMethods.includes(
              "generateContent"
            )
        )
        .map(
          (model) =>
            getModelId(
              model.name
            )
        )
        .filter(Boolean);

    return rankModels(
      generationModels
    );
  } catch (error: any) {
    console.error(
      "Gemini model discovery error:",
      error
    );

    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   MODEL HELPERS
========================================================= */

function getModelId(
  name: unknown
): string {
  if (
    typeof name !== "string"
  ) {
    return "";
  }

  return name
    .replace(
      /^models\//,
      ""
    )
    .trim();
}

function rankModels(
  models: string[]
): string[] {
  const uniqueModels =
    Array.from(
      new Set(
        models.filter(Boolean)
      )
    );

  const preferredPatterns = [
    "flash",
    "flash-lite",
    "pro",
  ];

  return uniqueModels.sort(
    (a, b) => {
      const aLower =
        a.toLowerCase();

      const bLower =
        b.toLowerCase();

      const aScore =
        getModelPriority(
          aLower,
          preferredPatterns
        );

      const bScore =
        getModelPriority(
          bLower,
          preferredPatterns
        );

      return (
        bScore - aScore
      );
    }
  );
}

function getModelPriority(
  model: string,
  preferredPatterns: string[]
): number {
  let score = 0;

  if (
    model.includes(
      preferredPatterns[0]
    )
  ) {
    score += 100;
  }

  if (
    model.includes(
      preferredPatterns[1]
    )
  ) {
    score += 20;
  }

  if (
    model.includes(
      preferredPatterns[2]
    )
  ) {
    score += 10;
  }

  if (
    model.includes(
      "preview"
    )
  ) {
    score -= 5;
  }

  if (
    model.includes(
      "experimental"
    )
  ) {
    score -= 20;
  }

  return score;
}

/* =========================================================
   MODEL SELECTION
========================================================= */

async function getModelCandidates(): Promise<
  string[]
> {
  const discoveredModels =
    await getAvailableModels();

  const result: string[] = [];

  /*
   * Explicit model from .env.local gets first priority.
   */
  if (GEMINI_MODEL) {
    result.push(
      getModelId(
        GEMINI_MODEL
      )
    );
  }

  /*
   * Then use dynamically discovered models.
   */
  for (
    const model of discoveredModels
  ) {
    if (
      model &&
      !result.includes(model)
    ) {
      result.push(model);
    }
  }

  /*
   * Last-resort common model.
   *
   * It is NOT assumed to be available.
   * If unavailable, the error will be returned safely.
   */
  if (
    result.length === 0
  ) {
    result.push(
      "gemini-2.0-flash"
    );
  }

  return result;
}

/* =========================================================
   CALL GEMINI
========================================================= */

async function callGemini(
  model: string,
  prompt: string
): Promise<GeminiAttemptResult> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      GEMINI_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        `${GEMINI_API_BASE}/models/${model}:generateContent`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              GEMINI_API_KEY as string,
          },

          signal:
            controller.signal,

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

            /*
             * Google Search grounding allows ResumeAI
             * to research real companies and roles.
             */
            tools: [
              {
                google_search: {},
              },
            ],

            generationConfig: {
              temperature: 0.2,

              responseMimeType:
                "application/json",

              responseSchema:
                analysisSchema,
            },
          }),
        }
      );

    const responseText =
      await response.text();

    if (!response.ok) {
      return {
        ok: false,
        status:
          response.status,
        responseText,
        errorMessage:
          extractGeminiError(
            responseText
          ),
        model,
      };
    }

    return {
      ok: true,
      status:
        response.status,
      responseText,
      errorMessage: "",
      model,
    };
  } catch (error: any) {
    if (
      error?.name ===
      "AbortError"
    ) {
      return {
        ok: false,
        status: 504,
        responseText: "",
        errorMessage:
          "Gemini request timed out. Please try again.",
        model,
      };
    }

    return {
      ok: false,
      status: 500,
      responseText: "",
      errorMessage:
        error?.message ||
        "Unable to connect to Gemini.",
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   GENERATE ANALYSIS
========================================================= */

async function generateAnalysis(
  prompt: string
) {
  const models =
    await getModelCandidates();

  let lastFailure:
    | GeminiAttemptResult
    | null = null;

  for (
    let modelIndex = 0;
    modelIndex <
    models.length;
    modelIndex++
  ) {
    const model =
      models[modelIndex];

    /*
     * Only retry the SAME model once for
     * temporary server failures.
     */
    for (
      let attempt = 0;
      attempt <= MAX_RETRIES;
      attempt++
    ) {
      const result =
        await callGemini(
          model,
          prompt
        );

      if (result.ok) {
        return result;
      }

      lastFailure =
        result;

      console.error(
        "Gemini request failed:",
        {
          model,
          attempt:
            attempt + 1,
          status:
            result.status,
          message:
            result.errorMessage,
        }
      );

      /*
       * Authentication / permission /
       * invalid request errors should stop.
       */
      if (
        result.status === 400 ||
        result.status === 401 ||
        result.status === 403
      ) {
        return result;
      }

      /*
       * 429 is usually project/key quota.
       *
       * DO NOT jump through every model.
       * That only creates more unnecessary requests.
       */
      if (
        result.status === 429
      ) {
        return result;
      }

      /*
       * Model unavailable.
       *
       * Try the next discovered model.
       */
      if (
        result.status === 404
      ) {
        break;
      }

      /*
       * Temporary server error.
       */
      if (
        result.status === 500 ||
        result.status === 502 ||
        result.status === 503 ||
        result.status === 504
      ) {
        if (
          attempt <
          MAX_RETRIES
        ) {
          await sleep(
            1200
          );
        }

        continue;
      }

      break;
    }
  }

  return (
    lastFailure || {
      ok: false,
      status: 503,
      responseText: "",
      errorMessage:
        "No usable Gemini model is available for this API key.",
      model:
        GEMINI_MODEL ||
        "unknown",
    }
  );
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
  try {
    /* -----------------------------------------------------
       API KEY
    ----------------------------------------------------- */

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing. Add it to .env.local and restart the Next.js server.",
        },
        {
          status: 500,
        }
      );
    }

    /* -----------------------------------------------------
       REQUEST BODY
    ----------------------------------------------------- */

    let body: any;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       USER DATA
    ----------------------------------------------------- */

    const company =
      getString(
        body?.company
      );

    const position =
      getString(
        body?.position
      );

    const targetRole =
      getString(
        body?.targetRole
      );

    const experience =
      getString(
        body?.experience
      );

    const skills =
      getString(
        body?.skills
      );

    const education =
      getString(
        body?.education
      );

    const projects =
      getString(
        body?.projects
      );

    const certifications =
      getString(
        body?.certifications
      );

    const jobDescription =
      getString(
        body?.jobDescription
      );

    const resumeText =
      getString(
        body?.resumeText
      );

    const fileName =
      getString(
        body?.fileName
      );

    const companyDetails =
      getString(
        body?.companyDetails
      );

    const applicationType =
      getString(
        body?.applicationType,
        getBoolean(
          body?.isInternship
        )
          ? "internship"
          : "job"
      );

    const resume =
      body?.resume &&
      typeof body.resume ===
        "object"
        ? body.resume
        : null;

    const structuredResume =
      safelySerializeResume(
        resume
      );

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (
      !position &&
      !targetRole &&
      !experience &&
      !skills &&
      !education &&
      !projects &&
      !resumeText &&
      !resume
    ) {
      return NextResponse.json(
        {
          error:
            "Not enough candidate information to analyze the resume. Please complete your resume information first.",
        },
        {
          status: 400,
        }
      );
    }

    const finalPosition =
      position ||
      targetRole ||
      "Target position";

    /* -----------------------------------------------------
       AI PROMPT
    ----------------------------------------------------- */

    const prompt = `
You are ResumeAI, a production-grade AI resume analyst and resume optimizer.

You are helping a real candidate prepare a resume for a real job or internship.

APPLICATION TYPE:
${applicationType || "job"}

TARGET COMPANY:
${company || "Not provided"}

TARGET POSITION:
${finalPosition}

COMPANY DETAILS PROVIDED BY USER:
${companyDetails || "Not provided"}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

CANDIDATE EXPERIENCE:
${experience || "Not provided"}

CANDIDATE SKILLS:
${skills || "Not provided"}

CANDIDATE EDUCATION:
${education || "Not provided"}

CANDIDATE PROJECTS:
${projects || "Not provided"}

CANDIDATE CERTIFICATIONS:
${certifications || "Not provided"}

UPLOADED RESUME TEXT:
${resumeText || "Not provided"}

UPLOADED FILE:
${fileName || "No file provided"}

STRUCTURED RESUME DATA:
${structuredResume}

==================================================
MAIN OBJECTIVE
==================================================

Analyze the REAL candidate against the target company and target position.

The purpose of ResumeAI is to help the candidate create a truthful,
professional and role-specific resume.

==================================================
JOB APPLICATION
==================================================

If APPLICATION TYPE is "job":

Analyze:

- role alignment
- required skills
- technical skills
- experience relevance
- education
- projects
- certifications
- ATS keywords
- missing requirements
- resume quality
- communication requirements when relevant

==================================================
INTERNSHIP APPLICATION
==================================================

If APPLICATION TYPE is "internship":

Treat the candidate as a fresher/intern candidate.

Focus on:

- education
- projects
- technical skills
- relevant coursework
- learning ability
- communication
- certifications
- internships
- practical skills

Do NOT penalize a candidate simply because they do not have full-time work experience.

Tell the candidate which missing skills they should learn.

==================================================
COMPANY ANALYSIS
==================================================

When a real company name is provided, use reliable current public information
when available through Google Search grounding.

Analyze:

- company domain
- technology areas
- relevant role expectations
- role-related skills
- publicly available job requirements

Never invent company facts.

If reliable company information is unavailable,
use the supplied job description and role information.

==================================================
STRICT TRUTH POLICY
==================================================

NEVER invent:

- experience
- companies
- projects
- certifications
- education
- technologies
- achievements
- years of experience
- job titles
- internship experience
- metrics
- responsibilities
- company facts

If information is missing, do not fabricate it.

You may rewrite candidate-provided information to make it:

- clearer
- professional
- concise
- ATS-friendly
- relevant

You may improve grammar.

You may reorder information.

You may NOT create new factual claims.

Do not use fake placeholder names.

Do not use fake placeholder companies.

==================================================
ATS ANALYSIS
==================================================

Analyze:

- job title relevance
- required skills
- technical skills
- communication requirements
- experience
- education
- projects
- certifications
- ATS keywords
- missing keywords
- job description alignment

The keywords array should contain useful ATS keywords relevant to the target role.

IMPORTANT:

If a skill is missing, do NOT pretend the candidate has it.

Put missing skills inside recommendations.

==================================================
SCORE
==================================================

overallScore must be an honest 0-100 match score.

Do not artificially increase the score.

==================================================
ANALYSIS ITEMS
==================================================

Each item must contain:

name
score
status
description

status must be exactly:

strong
good
gap

strong:
The candidate clearly demonstrates the requirement.

good:
The candidate partially demonstrates or reasonably aligns with the requirement.

gap:
The requirement is missing or there is insufficient evidence.

==================================================
RECOMMENDATIONS
==================================================

Recommendations must be practical.

Examples:

- learn a missing technology
- improve communication
- improve project explanation
- add relevant certification
- improve ATS keywords
- improve role-specific wording
- add missing education information
- add measurable achievements if the candidate actually has them

Never claim that the candidate already completed a recommendation.

==================================================
OPTIMIZED RESUME
==================================================

optimizedResume must ONLY use factual information provided by the candidate.

Improve:

- professional summary
- skills presentation
- experience wording
- project wording
- ATS readability
- role relevance

If no experience exists:

optimizedResume.experience must be [].

If no projects exist:

optimizedResume.projects must be [].

If no skills exist:

optimizedResume.skills must be [].

If there is insufficient information for a professional summary:

keep professionalSummary short and factual.

==================================================
FINAL OUTPUT
==================================================

Return ONLY valid JSON matching the provided response schema.

Required fields:

overallScore
summary
verdict
items
keywords
recommendations
optimizedResume

optimizedResume must contain:

professionalSummary
skills
experience
projects
`;

    /* -----------------------------------------------------
       GEMINI
    ----------------------------------------------------- */

    const geminiResult =
      await generateAnalysis(
        prompt
      );

    /* -----------------------------------------------------
       GEMINI FAILURE
    ----------------------------------------------------- */

    if (
      !geminiResult.ok
    ) {
      const message =
        geminiResult.errorMessage ||
        "Gemini is temporarily unavailable.";

      console.error(
        "Gemini analysis failed:",
        {
          model:
            geminiResult.model,
          status:
            geminiResult.status,
          message,
        }
      );

      /* 429 */

      if (
        geminiResult.status ===
        429
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini API is temporarily rate-limited. Please wait a few seconds and try again.",
          },
          {
            status: 429,
          }
        );
      }

      /* Authentication */

      if (
        geminiResult.status ===
          401 ||
        geminiResult.status ===
          403
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini API authentication failed. Please check GEMINI_API_KEY and make sure the API key has Gemini API access.",
          },
          {
            status:
              geminiResult.status,
          }
        );
      }

      /* Model */

      if (
        geminiResult.status ===
        404
      ) {
        return NextResponse.json(
          {
            error:
              `No usable Gemini generation model is available for this API key. Model attempted: ${geminiResult.model}.`,
          },
          {
            status: 502,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            `Gemini analysis failed: ${message}`,
        },
        {
          status:
            geminiResult.status >=
              400 &&
            geminiResult.status <
              600
              ? geminiResult.status
              : 503,
        }
      );
    }

    /* -----------------------------------------------------
       PARSE GEMINI HTTP RESPONSE
    ----------------------------------------------------- */

    let geminiData: any;

    try {
      geminiData =
        JSON.parse(
          geminiResult.responseText
        );
    } catch {
      console.error(
        "Gemini API response was not valid JSON:",
        geminiResult.responseText
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an invalid API response.",
        },
        {
          status: 502,
        }
      );
    }

    /* -----------------------------------------------------
       EXTRACT MODEL TEXT
    ----------------------------------------------------- */

    const candidate =
      geminiData?.candidates?.[0];

    const rawText =
      candidate?.content?.parts
        ?.map(
          (part: any) =>
            part?.text || ""
        )
        .join("")
        .trim();

    if (!rawText) {
      console.error(
        "Gemini returned no generated text:",
        geminiData
      );

      const finishReason =
        candidate?.finishReason;

      if (
        finishReason ===
        "SAFETY"
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini could not generate the analysis because the request was blocked by its safety system.",
          },
          {
            status: 502,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Gemini returned an empty analysis. Please try again.",
        },
        {
          status: 502,
        }
      );
    }

    /* -----------------------------------------------------
       PARSE STRUCTURED RESULT
    ----------------------------------------------------- */

    let analysis: any;

    try {
      analysis =
        JSON.parse(
          rawText
        );
    } catch {
      console.error(
        "Gemini structured JSON parse error:",
        rawText
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned invalid structured analysis. Please try again.",
        },
        {
          status: 502,
        }
      );
    }

    /* -----------------------------------------------------
       NORMALIZE
    ----------------------------------------------------- */

    const normalizedAnalysis =
      normalizeAnalysis(
        analysis
      );

    /* -----------------------------------------------------
       FINAL RESPONSE
    ----------------------------------------------------- */

    return NextResponse.json(
      normalizedAnalysis,
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Resume analysis route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to analyze resume.",
      },
      {
        status: 500,
      }
    );
  }
}