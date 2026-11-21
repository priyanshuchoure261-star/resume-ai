"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CareerChatbot from "@/components/chat/CareerChatbot";
import AuthGuard from "@/components/auth/AuthGuard";
import PromotionSlot from "@/components/ads/PromotionSlot";

type ResumeData = {
  selectedCompany?: string;
  company?: string;
  position?: string;
  experience?: string;
  skills?: string;
  jobDescription?: string;
  resumeText?: string;
  fileName?: string;
  profileImage?: string;
  template?: string;
  updatedAt?: string;
};

type AnalysisItem = {
  name: string;
  score: number;
  status: "strong" | "good" | "gap";
  description: string;
};

type AnalysisResult = {
  overallScore: number;
  summary: string;
  verdict: string;
  analysisItems: AnalysisItem[];
  keywords: string[];
  recommendations: string[];
};

type JobAnalysis = {
  company?: string;
  role?: string;
  jobType?: string;
  location?: string;
  summary?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  education?: string[];
  experience?: string[];
  keywords?: string[];
  responsibilities?: string[];
  candidateGuidance?: string[];
  skillGapGuidance?: string[];
  learningRoadmap?: string[];
};

const defaultData: ResumeData = {
  company: "Target Company",
  position: "Target Position",
  experience: "",
  skills: "",
  jobDescription: "",
  resumeText: "",
  template: "classic",
};

export default function OptimizePage() {
  const [data, setData] =
    useState<ResumeData>(defaultData);

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  const [progress, setProgress] = useState(0);

  const [analysisDone, setAnalysisDone] =
    useState(false);

  const [error, setError] = useState("");

  const [jobAnalysis, setJobAnalysis] =
    useState<JobAnalysis | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "roadmap" | "keywords" | "skills"
  >("overview");

  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      try {
        setProgress(5);
        setAnalysisDone(false);
        setError("");
        setAnalysis(null);

        /*
         * -----------------------------------------
         * LOAD RESUME DATA
         * -----------------------------------------
         */

        let resumeData: ResumeData = {
          ...defaultData,
        };

        try {
          const saved =
            sessionStorage.getItem("resumeAIData") ||
            sessionStorage.getItem("RESUME_AI_PROFILE") ||
            sessionStorage.getItem("resumeProfile");

          if (saved) {
            const parsed = JSON.parse(saved);

            if (
              parsed &&
              typeof parsed === "object"
            ) {
              resumeData = {
                ...defaultData,
                ...parsed,
              };
            }
          }
        } catch (storageError) {
          console.warn(
            "Could not read saved resume data:",
            storageError
          );
        }

        if (cancelled) return;

        setData(resumeData);

        try {
          const savedJob = sessionStorage.getItem("resumeAI_job_analysis");
          if (savedJob) {
            setJobAnalysis(JSON.parse(savedJob));
          } else {
            const comp =
              resumeData.selectedCompany ||
              resumeData.company ||
              "";
            const pos = resumeData.position || "";
            if (comp || pos || resumeData.jobDescription) {
              fetch("/api/analyze-job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  company: comp,
                  role: pos,
                  jobDescription: resumeData.jobDescription || "",
                }),
              })
                .then((r) => r.json())
                .then((res) => {
                  if (res?.analysis && !cancelled) {
                    setJobAnalysis(res.analysis);
                    try {
                      sessionStorage.setItem(
                        "resumeAI_job_analysis",
                        JSON.stringify(res.analysis)
                      );
                    } catch {}
                  }
                })
                .catch(() => {});
            }
          }
        } catch {}

        /*
         * -----------------------------------------
         * VALIDATION
         * -----------------------------------------
         */

        const hasUsefulData = Boolean(
          resumeData.position ||
            resumeData.experience ||
            resumeData.skills ||
            resumeData.resumeText ||
            resumeData.fileName
        );

        if (!hasUsefulData) {
          throw new Error(
            "Resume information is missing. Please go back and complete your resume first."
          );
        }

        /*
         * -----------------------------------------
         * PROGRESS
         * -----------------------------------------
         */

        setProgress(15);

        await new Promise((resolve) =>
          setTimeout(resolve, 250)
        );

        if (cancelled) return;

        setProgress(30);

        /*
         * -----------------------------------------
         * BUILD API PAYLOAD
         * -----------------------------------------
         */

        const payload = {
          company:
            resumeData.selectedCompany ||
            resumeData.company ||
            "",

          position:
            resumeData.position || "",

          experience:
            resumeData.experience || "",

          skills:
            resumeData.skills || "",

          jobDescription:
            resumeData.jobDescription || "",

          resumeText:
            resumeData.resumeText || "",

          fileName:
            resumeData.fileName || "",

          template:
            resumeData.template || "classic",

          resume: resumeData,
        };

        console.log(
          "Sending resume analysis request:",
          payload
        );

        /*
         * -----------------------------------------
         * REAL AI API REQUEST
         * -----------------------------------------
         */

        const response = await fetch(
          "/api/analyze-resume",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (cancelled) return;

        setProgress(60);

        /*
         * -----------------------------------------
         * READ RESPONSE SAFELY
         * -----------------------------------------
         */

        const responseText =
          await response.text();

        let result: any = null;

        try {
          result = responseText
            ? JSON.parse(responseText)
            : null;
        } catch (parseError) {
          console.error(
            "Could not parse API response:",
            parseError,
            responseText
          );

          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }

        console.log(
          "Resume analysis API response:",
          result
        );

        /*
         * -----------------------------------------
         * API ERROR
         * -----------------------------------------
         */

        if (!response.ok) {
          const serverMessage =
            result?.error ||
            result?.message ||
            result?.details ||
            `Analysis request failed with status ${response.status}.`;

          throw new Error(
            String(serverMessage)
          );
        }

        /*
         * -----------------------------------------
         * VALID RESPONSE
         * -----------------------------------------
         */

        if (!result) {
          throw new Error(
            "The analysis server returned an empty response."
          );
        }

        setProgress(80);

        /*
         * -----------------------------------------
         * NORMALIZE RESPONSE
         * -----------------------------------------
         */

        const normalizedAnalysis =
          normalizeAnalysisResult(result);

        setAnalysis(normalizedAnalysis);

        /*
         * -----------------------------------------
         * SAVE REAL ANALYSIS FOR FINAL RESUME
         * -----------------------------------------
         * Keep the selected template together with
         * the actual AI response so /resume can
         * render the correct design.
         */
        try {
          const analysisToStore = {
            ...result,
            template: resumeData.template || "classic",
            profile: resumeData,
            analyzedAt: new Date().toISOString(),
          };

          sessionStorage.setItem(
            "resumeAI_analysis",
            JSON.stringify(analysisToStore)
          );

          sessionStorage.setItem(
            "RESUME_AI_ANALYSIS",
            JSON.stringify(analysisToStore)
          );
        } catch (storageError) {
          console.warn(
            "Could not save AI analysis:",
            storageError
          );
        }

        setProgress(100);
        setAnalysisDone(true);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Resume analysis error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while analyzing your resume.";

        setError(message);
        setProgress(0);
        setAnalysisDone(false);
      }
    }

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  const company =
    data.selectedCompany ||
    data.company ||
    "Target Company";

  const position =
    data.position ||
    "Target Position";

  const template =
    data.template ||
    "classic";

  const overallScore =
    analysis?.overallScore ?? 0;

  const analysisItems =
    analysis?.analysisItems ?? [];

  const keywords =
    analysis?.keywords ?? [];

  const recommendations =
    analysis?.recommendations ?? [];

  const strongCount =
    analysisItems.filter(
      (item) => item.status === "strong"
    ).length;

  const goodCount =
    analysisItems.filter(
      (item) => item.status === "good"
    ).length;

  const gapItems = useMemo(
    () => analysisItems.filter((item) => item.status === "gap"),
    [analysisItems]
  );

  const roadmapSteps = useMemo(() => {
    if (jobAnalysis?.learningRoadmap && jobAnalysis.learningRoadmap.length > 0) {
      return jobAnalysis.learningRoadmap;
    }
    const steps: string[] = [];
    if (gapItems.length > 0) {
      steps.push(
        `Focus on priority fundamentals: ${gapItems
          .slice(0, 3)
          .map((g) => g.name)
          .join(", ")}.`
      );
      steps.push(
        `Build a hands-on project demonstrating practical implementation of ${gapItems[0].name}.`
      );
    } else {
      steps.push("Strengthen your core foundation with role-aligned concepts and patterns.");
      steps.push("Build a featured portfolio application tailored to the target tech stack.");
    }
    if (recommendations.length > 0) {
      steps.push(recommendations[0]);
    } else {
      steps.push("Highlight measurable impact and quantified metrics in your project descriptions.");
    }
    steps.push(
      `Prepare for behavioral & technical interview questions specific to ${position || "your target role"}.`
    );
    return steps;
  }, [jobAnalysis, gapItems, recommendations, position]);

  const guidanceList = useMemo(() => {
    const list: string[] = [];
    if (jobAnalysis?.skillGapGuidance) {
      list.push(...jobAnalysis.skillGapGuidance);
    }
    if (jobAnalysis?.candidateGuidance) {
      list.push(...jobAnalysis.candidateGuidance);
    }
    if (list.length === 0 && recommendations.length > 1) {
      list.push(...recommendations.slice(1, 4));
    }
    return list;
  }, [jobAnalysis, recommendations]);

  const gapCount =
    analysisItems.filter(
      (item) => item.status === "gap"
    ).length;

  return (
    <AuthGuard fallbackMessage="Please log in to view AI resume optimization and roadmap.">
      <main className="optimize-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="optimize-container">

        {/* HEADER */}

        <header className="top-header">
          <Link
            href="/create"
            className="back-link"
          >
            ← Back to resume
          </Link>

          <div className="ai-badge">
            <span className="pulse-dot" />
            AI ANALYSIS ENGINE
          </div>

          <div className="header-spacer" />
        </header>

        {/* HERO */}

        <section className="hero-section">
          <div className="hero-badge">
            AI-POWERED RESUME ANALYSIS
          </div>

          <h1>
            Making your{" "}
            <span>resume job-ready.</span>
          </h1>

          <p>
            ResumeAI is analyzing your actual
            resume information against the
            requirements of your target
            opportunity.
          </p>

          <div className="target-card">
            <div className="company-logo">
              {company
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="target-info">
              <small>TARGET COMPANY</small>
              <strong>{company}</strong>
            </div>

            <div className="target-divider" />

            <div className="target-info">
              <small>POSITION</small>
              <strong>{position}</strong>
            </div>

            <div className="target-divider" />

            <div className="target-info">
              <small>TEMPLATE</small>
              <strong>
                {template.charAt(0).toUpperCase() +
                  template.slice(1)}
              </strong>
            </div>

            <div className="target-status">
              <span
                className={`status-dot ${
                  analysisDone
                    ? "finished"
                    : ""
                }`}
              />

              {error
                ? "ERROR"
                : analysisDone
                ? "COMPLETE"
                : "ANALYZING"}
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <section className="error-card">
            <div className="error-icon">
              !
            </div>

            <div>
              <strong>
                Resume analysis failed
              </strong>

              <p>{error}</p>

              <Link
                href="/create"
                className="error-link"
              >
                ← Go back and check resume
              </Link>
            </div>
          </section>
        )}

        {/* SCORE */}

        <section className="score-grid">
          <div className="score-card">
            <div className="score-content">

              <div className="eyebrow">
                OVERALL JOB MATCH
              </div>

              <div className="score-number">
                {analysisDone
                  ? overallScore
                  : progress}

                <span>%</span>
              </div>

              <h2>
                {error
                  ? "Analysis unavailable"
                  : analysisDone
                  ? getScoreTitle(
                      overallScore
                    )
                  : "Analyzing your profile..."}
              </h2>

              <p>
                {error
                  ? error
                  : analysisDone
                  ? analysis?.summary ||
                    "Your resume has been analyzed against the target opportunity."
                  : "We're comparing your actual resume information with the target role."}
              </p>

              {analysisDone &&
                analysis?.verdict && (
                  <div className="verdict">
                    {analysis.verdict}
                  </div>
                )}
            </div>

            <div
              className="score-ring"
              style={
                {
                  "--progress": `${
                    analysisDone
                      ? overallScore
                      : progress
                  }%`,
                } as React.CSSProperties
              }
            >
              <div className="score-ring-inner">
                <strong>
                  {analysisDone
                    ? overallScore
                    : progress}
                </strong>

                <span>MATCH</span>
              </div>
            </div>
          </div>

          {/* PROCESS */}

          <div className="analysis-card">

            <div className="card-header">
              <div>
                <div className="eyebrow">
                  AI PROCESS
                </div>

                <h3>
                  {error
                    ? "Analysis failed"
                    : analysisDone
                    ? "Analysis complete"
                    : "Analyzing resume"}
                </h3>
              </div>

              <span
                className={`analysis-status ${
                  analysisDone
                    ? "complete"
                    : error
                    ? "failed"
                    : ""
                }`}
              >
                {error
                  ? "ERROR"
                  : analysisDone
                  ? "✓ DONE"
                  : `${progress}%`}
              </span>
            </div>

            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  error
                    ? "failed-fill"
                    : ""
                }`}
                style={{
                  width: `${
                    error ? 0 : progress
                  }%`,
                }}
              />
            </div>

            <div className="analysis-steps">

              <AnalysisStep
                done={
                  analysisDone ||
                  progress >= 25
                }
                active={
                  !error &&
                  !analysisDone &&
                  progress < 25
                }
                text="Reading your profile"
              />

              <AnalysisStep
                done={
                  analysisDone ||
                  progress >= 45
                }
                active={
                  !error &&
                  !analysisDone &&
                  progress >= 25 &&
                  progress < 45
                }
                text="Matching job requirements"
              />

              <AnalysisStep
                done={
                  analysisDone ||
                  progress >= 70
                }
                active={
                  !error &&
                  !analysisDone &&
                  progress >= 45 &&
                  progress < 70
                }
                text="Checking ATS keywords"
              />

              <AnalysisStep
                done={analysisDone}
                active={
                  !error &&
                  !analysisDone &&
                  progress >= 70
                }
                text="Preparing recommendations"
              />

            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="stats-grid">
          <StatCard
            value={strongCount}
            label="STRONG MATCHES"
            description="Skills strongly aligned"
          />

          <StatCard
            value={goodCount}
            label="GOOD MATCHES"
            description="Relevant skills detected"
          />

          <StatCard
            value={gapCount}
            label="SKILL GAPS"
            description="Areas to improve"
          />

          <StatCard
            value={analysisItems.length}
            label="SKILLS ANALYZED"
            description="Resume skills reviewed"
          />
        </section>

        {/* ANALYSIS */}

        <section className="analysis-section">

          <div className="section-title">
            <div>
              <div className="eyebrow">
                DETAILED ANALYSIS
              </div>

              <h2>
                How your resume performs
              </h2>
            </div>

            <div className="overall-pill">
              <span />

              {analysisDone
                ? `${overallScore}% overall match`
                : "Analysis in progress"}
            </div>
          </div>

          <div className="tabs">

            <button
              className={
                activeTab === "overview"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("overview")
              }
            >
              Overview
            </button>

            <button
              className={
                activeTab === "roadmap"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("roadmap")
              }
            >
              Roadmap & Gaps ✦
            </button>

            <button
              className={
                activeTab === "keywords"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("keywords")
              }
            >
              Keywords
            </button>

            <button
              className={
                activeTab === "skills"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("skills")
              }
            >
              Skills
            </button>

            <Link
              href="/match"
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                background: "rgba(124, 58, 237, 0.15)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#c4b5fd",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Detailed Match Report →
            </Link>

          </div>

          {/* LOADING */}

          {!analysisDone &&
            !error && (
              <div className="empty-analysis">
                <div className="loading-orb">
                  ✦
                </div>

                <h3>
                  AI is analyzing your resume
                </h3>

                <p>
                  Please wait while ResumeAI
                  compares your experience,
                  skills and keywords with
                  the target role.
                </p>
              </div>
            )}

          {/* OVERVIEW */}

          {analysisDone &&
            activeTab === "overview" && (
              <div className="analysis-list">

                {analysisItems.length > 0 ? (
                  analysisItems.map(
                    (item, index) => (
                      <AnalysisRow
                        key={`${item.name}-${index}`}
                        item={item}
                      />
                    )
                  )
                ) : (
                  <EmptyState
                    text="No detailed skill analysis was returned by the AI."
                  />
                )}

              </div>
            )}

          {/* ROADMAP & SKILL GAPS */}

          {analysisDone &&
            activeTab === "roadmap" && (
              <div className="roadmap-panel">
                <div className="roadmap-intro">
                  <div className="roadmap-icon">✦</div>
                  <div>
                    <h3>Personalized Preparation & Learning Roadmap</h3>
                    <p>
                      Step-by-step learning order, hands-on projects, and honest skill bridging tailored for {position || "your target role"} at {company || "the company"}.
                    </p>
                  </div>
                </div>

                <div className="roadmap-card">
                  <div className="roadmap-card-header">
                    <span className="roadmap-badge">STEP-BY-STEP LEARNING ORDER</span>
                    <h4>What to learn & master first</h4>
                  </div>
                  <div className="roadmap-timeline">
                    {roadmapSteps.map((step, idx) => (
                      <div key={idx} className="timeline-node">
                        <div className="node-marker">
                          <span className="node-number">{String(idx + 1).padStart(2, "0")}</span>
                          {idx < roadmapSteps.length - 1 && <div className="timeline-line" />}
                        </div>
                        <div className="node-content">
                          <div className="node-title">Phase {idx + 1}</div>
                          <p className="node-desc">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="roadmap-card">
                  <div className="roadmap-card-header">
                    <span className="roadmap-badge warning">IDENTIFIED SKILL GAPS ({gapItems.length})</span>
                    <h4>Honest Preparation Bridge</h4>
                    <p className="card-subtext">
                      Never add fake skills. Follow these practical bridges to genuinely earn and demonstrate them.
                    </p>
                  </div>

                  {gapItems.length > 0 ? (
                    <div className="gap-grid">
                      {gapItems.map((item, idx) => (
                        <div key={`${item.name}-${idx}`} className="gap-card">
                          <div className="gap-card-head">
                            <span className="gap-tag">{item.name}</span>
                            <span className="gap-status-pill">Skill gap</span>
                          </div>
                          <p className="gap-desc">{item.description}</p>
                          <div className="gap-bridge">
                            <span className="bridge-icon">✓</span>
                            <span className="bridge-text">
                              <strong>Action Plan:</strong> Build a proof-of-concept project or solve practical problems using {item.name} before claiming it.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="all-good-note">
                      ✓ No critical skill gaps found! Your profile aligns strongly with the requirements.
                    </div>
                  )}
                </div>

                {guidanceList.length > 0 && (
                  <div className="roadmap-card">
                    <div className="roadmap-card-header">
                      <span className="roadmap-badge info">ROLE & INTERVIEW PREPARATION</span>
                      <h4>Actionable Guidance for this Role</h4>
                    </div>
                    <div className="guidance-items">
                      {guidanceList.map((g, idx) => (
                        <div key={idx} className="guidance-row">
                          <span className="guidance-bullet">→</span>
                          <p>{g}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* KEYWORDS */}

          {analysisDone &&
            activeTab === "keywords" && (
              <div className="keyword-panel">

                <div className="keyword-intro">

                  <div className="keyword-icon">
                    #
                  </div>

                  <div>
                    <h3>
                      Important keywords
                    </h3>

                    <p>
                      Keywords identified by
                      the AI analysis for this
                      opportunity.
                    </p>
                  </div>

                </div>

                <div className="keyword-cloud">

                  {keywords.length > 0 ? (
                    keywords.map(
                      (keyword, index) => (
                        <span
                          key={`${keyword}-${index}`}
                        >
                          {keyword}
                        </span>
                      )
                    )
                  ) : (
                    <p className="muted-text">
                      No keywords were returned
                      by the AI.
                    </p>
                  )}

                </div>

              </div>
            )}

          {/* SKILLS */}

          {analysisDone &&
            activeTab === "skills" && (
              <div className="skills-panel">

                <div className="skills-summary">

                  <div className="skill-summary-card">
                    <strong>
                      {strongCount}
                    </strong>

                    <span>Strong</span>
                  </div>

                  <div className="skill-summary-card">
                    <strong>
                      {goodCount}
                    </strong>

                    <span>Good</span>
                  </div>

                  <div className="skill-summary-card">
                    <strong>
                      {gapCount}
                    </strong>

                    <span>Needs work</span>
                  </div>

                </div>

                <div className="analysis-list">

                  {analysisItems.length > 0 ? (
                    analysisItems.map(
                      (item, index) => (
                        <AnalysisRow
                          key={`${item.name}-${index}`}
                          item={item}
                        />
                      )
                    )
                  ) : (
                    <EmptyState
                      text="No skill analysis available."
                    />
                  )}

                </div>

              </div>
            )}

        </section>

        {/* RECOMMENDATIONS */}

        <section className="recommendation-section">

          <div className="recommendation-header">

            <div className="recommendation-icon">
              ✦
            </div>

            <div>
              <div className="eyebrow">
                AI RECOMMENDATIONS
              </div>

              <h2>
                Improve your chances
              </h2>
            </div>

          </div>

          {!analysisDone &&
            !error && (
              <div className="recommendation-loading">
                AI recommendations will
                appear after analysis.
              </div>
            )}

          {error && (
            <div className="recommendation-loading">
              Recommendations are unavailable
              because the AI analysis failed.
            </div>
          )}

          {analysisDone &&
            recommendations.length ===
              0 && (
              <div className="recommendation-loading">
                No recommendations were
                returned by the AI.
              </div>
            )}

          {analysisDone &&
            recommendations.length > 0 && (
              <div className="recommendation-list">

                {recommendations.map(
                  (
                    recommendation,
                    index
                  ) => (
                    <div
                      className="recommendation-item"
                      key={`${recommendation}-${index}`}
                    >

                      <div className="recommendation-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <p>
                        {recommendation}
                      </p>

                      <span>→</span>

                    </div>
                  )
                )}

              </div>
            )}

        </section>

        {/* PROFILE */}

        <section className="profile-section">

          <div className="profile-header">

            <div>
              <div className="eyebrow">
                PROFILE USED
              </div>

              <h2>
                Your resume information
              </h2>
            </div>

            <Link
              href="/create"
              className="edit-link"
            >
              Edit profile →
            </Link>

          </div>

          <div className="profile-grid">

            <ProfileItem
              label="COMPANY"
              value={company}
            />

            <ProfileItem
              label="POSITION"
              value={position}
            />

            <ProfileItem
              label="EXPERIENCE"
              value={
                data.experience ||
                "Not provided"
              }
            />

            <ProfileItem
              label="SKILLS"
              value={
                data.skills ||
                "Not provided"
              }
            />

            {data.fileName && (
              <ProfileItem
                label="RESUME FILE"
                value={data.fileName}
              />
            )}

          </div>

        </section>

        {/* CTA */}

        <section className="cta-section">

          <div>
            <div className="eyebrow">
              NEXT STEP
            </div>

            <h2>
              Ready to optimize your resume?
            </h2>

            <p>
              Use these AI insights to make
              your resume stronger, clearer
              and more ATS-friendly.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/match"
              className="cta-button"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <span>Match Breakdown</span>
              <span className="cta-arrow">→</span>
            </Link>

            <Link
              href="/resume"
              className="cta-button"
            >
              <span>Continue to Resume</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>

        </section>

        <PromotionSlot slot="banner" />

        <footer>
          <span>ResumeAI</span>

          <span>
            AI-powered career tools
          </span>
        </footer>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .optimize-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: #f7f3ff;
          background:
            radial-gradient(
              circle at 10% 5%,
              rgba(104, 35, 210, 0.28),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 35%,
              rgba(218, 47, 255, 0.16),
              transparent 30%
            ),
            #08050f;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .background-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .glow-one {
          width: 380px;
          height: 380px;
          top: 350px;
          left: -180px;
          background: rgba(104, 48, 220, 0.12);
        }

        .glow-two {
          width: 420px;
          height: 420px;
          top: 850px;
          right: -200px;
          background: rgba(218, 48, 255, 0.1);
        }

        .optimize-container {
          width: min(
            1180px,
            calc(100% - 36px)
          );
          margin: 0 auto;
          position: relative;
          z-index: 2;
          padding: 24px 0 70px;
        }

        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 55px;
        }

        .back-link {
          color: #aaa1b9;
          text-decoration: none;
          font-size: 14px;
        }

        .back-link:hover {
          color: white;
        }

        .ai-badge,
        .hero-badge {
          border: 1px solid
            rgba(188, 74, 255, 0.35);
          background: rgba(
            150,
            46,
            255,
            0.1
          );
          color: #d996ff;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .ai-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pulse-dot,
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d85cff;
          box-shadow: 0 0 12px
            rgba(216, 92, 255, 0.9);
        }

        .status-dot.finished {
          background: #7dffbf;
          box-shadow: 0 0 12px
            rgba(125, 255, 191, 0.8);
        }

        .header-spacer {
          width: 120px;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 34px;
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: 22px;
        }

        .hero-section h1 {
          margin: 0;
          font-size: clamp(
            42px,
            6vw,
            72px
          );
          line-height: 1;
          letter-spacing: -0.055em;
          font-weight: 850;
        }

        .hero-section h1 span {
          background: linear-gradient(
            90deg,
            #c759ff,
            #ff6cf7,
            #a95aff
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-section > p {
          max-width: 700px;
          margin: 22px auto 30px;
          color: #9c93aa;
          line-height: 1.7;
          font-size: 15px;
        }

        .target-card {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 20px;
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          background: rgba(
            255,
            255,
            255,
            0.035
          );
          border-radius: 18px;
          text-align: left;
          max-width: 760px;
          margin: 0 auto;
          backdrop-filter: blur(20px);
        }

        .company-logo {
          width: 50px;
          height: 50px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: white;
          color: #111;
          font-size: 21px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .target-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .target-info small,
        .eyebrow {
          color: #777080;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .target-info strong {
          color: #f6f2fa;
          font-size: 14px;
        }

        .target-divider {
          height: 36px;
          width: 1px;
          background: rgba(
            255,
            255,
            255,
            0.1
          );
          margin: 0 5px;
        }

        .target-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b9afc3;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .error-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          margin: 0 0 18px;
          border-radius: 18px;
          border: 1px solid
            rgba(255, 80, 130, 0.2);
          background: rgba(
            255,
            70,
            130,
            0.06
          );
        }

        .error-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(
            255,
            70,
            130,
            0.12
          );
          color: #ff8caf;
          font-weight: 900;
        }

        .error-card strong {
          font-size: 14px;
        }

        .error-card p {
          color: #a996a7;
          font-size: 12px;
          margin: 6px 0 10px;
          line-height: 1.6;
        }

        .error-link {
          color: #d56cff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .score-grid {
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 18px;
          margin-top: 22px;
        }

        .score-card,
        .analysis-card,
        .analysis-section,
        .recommendation-section,
        .profile-section,
        .cta-section {
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          background: rgba(
            255,
            255,
            255,
            0.035
          );
          border-radius: 24px;
          backdrop-filter: blur(22px);
        }

        .score-card {
          min-height: 250px;
          padding: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        }

        .score-number {
          font-size: 62px;
          line-height: 1;
          font-weight: 850;
          margin-top: 10px;
          letter-spacing: -0.06em;
        }

        .score-number span {
          color: #bd5bff;
          font-size: 25px;
          margin-left: 4px;
        }

        .score-content h2 {
          margin: 10px 0 5px;
          font-size: 18px;
        }

        .score-content p {
          margin: 0;
          color: #81788c;
          font-size: 12px;
          max-width: 390px;
          line-height: 1.6;
        }

        .verdict {
          margin-top: 14px;
          color: #cba4df;
          font-size: 11px;
          line-height: 1.5;
        }

        .score-ring {
          --progress: 0%;
          width: 155px;
          height: 155px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(
              #d25cff var(--progress),
              rgba(
                255,
                255,
                255,
                0.07
              ) 0
            );
          position: relative;
          flex-shrink: 0;
          transition: background 0.4s ease;
        }

        .score-ring::before {
          content: "";
          position: absolute;
          inset: 9px;
          border-radius: 50%;
          background: #100a19;
        }

        .score-ring-inner {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .score-ring-inner strong {
          font-size: 31px;
        }

        .score-ring-inner span {
          color: #8e8499;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        .analysis-card {
          padding: 28px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-header h3 {
          margin: 8px 0 0;
          font-size: 19px;
        }

        .analysis-status {
          color: #d05cff;
          font-size: 10px;
          font-weight: 800;
        }

        .analysis-status.complete {
          color: #b7ffdb;
        }

        .analysis-status.failed {
          color: #ff8caf;
        }

        .progress-bar {
          height: 5px;
          background: rgba(
            255,
            255,
            255,
            0.07
          );
          border-radius: 99px;
          margin: 24px 0;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            #8b35ff,
            #ed5cff
          );
          transition: width 0.25s ease;
        }

        .failed-fill {
          background: #ff5c91;
        }

        .analysis-steps {
          display: grid;
          gap: 13px;
        }

        .analysis-step {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #71687c;
          font-size: 11px;
        }

        .analysis-step.active {
          color: #d9cde3;
        }

        .analysis-step.done {
          color: #aaa0b4;
        }

        .step-icon {
          width: 18px;
          height: 18px;
          border: 1px solid
            rgba(255, 255, 255, 0.14);
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 9px;
        }

        .analysis-step.done .step-icon {
          border-color: #b954ff;
          color: #d267ff;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            1fr
          );
          gap: 14px;
          margin: 18px 0;
        }

        .stat-card {
          padding: 23px;
          border: 1px solid
            rgba(255, 255, 255, 0.07);
          border-radius: 18px;
          background: rgba(
            255,
            255,
            255,
            0.025
          );
        }

        .stat-value {
          font-size: 29px;
          font-weight: 800;
        }

        .stat-label {
          color: #a99faf;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin-top: 8px;
        }

        .stat-description {
          color: #655d6c;
          font-size: 10px;
          margin-top: 5px;
        }

        .analysis-section,
        .recommendation-section,
        .profile-section {
          margin-top: 18px;
          padding: 30px;
        }

        .section-title,
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .section-title h2,
        .profile-header h2,
        .recommendation-header h2,
        .cta-section h2 {
          margin: 7px 0 0;
          font-size: 23px;
          letter-spacing: -0.025em;
        }

        .overall-pill {
          border: 1px solid
            rgba(200, 83, 255, 0.22);
          background: rgba(
            188,
            70,
            255,
            0.08
          );
          color: #d9a3ff;
          padding: 9px 13px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }

        .overall-pill span {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c653ff;
          margin-right: 7px;
        }

        .tabs {
          display: flex;
          gap: 7px;
          margin: 26px 0 15px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
        }

        .tabs button {
          border: 0;
          background: transparent;
          color: #736a7b;
          padding: 10px 15px 13px;
          cursor: pointer;
          font-size: 12px;
          text-transform: capitalize;
          border-bottom: 2px solid
            transparent;
        }

        .tabs button.active {
          color: #e4d8ec;
          border-bottom-color: #c653ff;
        }

        .analysis-list {
          display: grid;
          gap: 10px;
        }

        .analysis-row {
          display: grid;
          grid-template-columns:
            1.1fr 90px 90px 2fr;
          align-items: center;
          gap: 20px;
          padding: 16px 17px;
          border: 1px solid
            rgba(255, 255, 255, 0.055);
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.018
          );
        }

        .skill-name {
          font-weight: 700;
          font-size: 13px;
        }

        .skill-score {
          font-weight: 800;
          font-size: 14px;
        }

        .status-badge {
          justify-self: start;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .status-badge.strong {
          color: #d2a0ff;
          background: rgba(
            183,
            73,
            255,
            0.11
          );
        }

        .status-badge.good {
          color: #9dcfff;
          background: rgba(
            70,
            135,
            255,
            0.1
          );
        }

        .status-badge.gap {
          color: #ffb5cf;
          background: rgba(
            255,
            87,
            145,
            0.09
          );
        }

        .skill-description {
          color: #766d7e;
          font-size: 11px;
        }

        .roadmap-panel {
          padding-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .roadmap-intro {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px 20px;
          border-radius: 16px;
          background: rgba(192, 75, 255, 0.05);
          border: 1px solid rgba(192, 75, 255, 0.15);
        }

        .roadmap-intro h3 {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .roadmap-intro p {
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.5;
        }

        .roadmap-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(192, 75, 255, 0.15);
          color: #d25cff;
          display: grid;
          place-items: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .roadmap-card {
          padding: 22px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .roadmap-card-header {
          margin-bottom: 18px;
        }

        .roadmap-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          margin-bottom: 8px;
        }

        .roadmap-badge.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .roadmap-badge.info {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
        }

        .roadmap-card-header h4 {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
        }

        .card-subtext {
          font-size: 12px;
          color: #71717a;
          margin-top: 4px;
        }

        .roadmap-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }

        .timeline-node {
          display: flex;
          gap: 16px;
        }

        .node-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .node-number {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: #e9d5ff;
          font-size: 12px;
          font-weight: 700;
          display: grid;
          place-items: center;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          min-height: 24px;
          background: rgba(168, 85, 247, 0.2);
          margin-top: 6px;
        }

        .node-content {
          padding-top: 4px;
          flex: 1;
        }

        .node-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #c084fc;
          margin-bottom: 4px;
        }

        .node-desc {
          font-size: 13.5px;
          color: #d4d4d8;
          line-height: 1.5;
        }

        .gap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }

        .gap-card {
          padding: 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(245, 158, 11, 0.2);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gap-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gap-tag {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
        }

        .gap-status-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .gap-desc {
          font-size: 12.5px;
          color: #a1a1aa;
          line-height: 1.45;
        }

        .gap-bridge {
          display: flex;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          margin-top: auto;
        }

        .bridge-icon {
          color: #4ade80;
          font-weight: 800;
          font-size: 13px;
        }

        .bridge-text {
          font-size: 11.5px;
          color: #dcfce7;
          line-height: 1.4;
        }

        .all-good-note {
          padding: 16px;
          border-radius: 12px;
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          font-size: 13px;
          font-weight: 600;
        }

        .guidance-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .guidance-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13px;
          color: #d4d4d8;
          line-height: 1.5;
        }

        .guidance-bullet {
          color: #38bdf8;
          font-weight: 700;
        }

        .keyword-panel,
        .skills-panel {
          padding-top: 10px;
        }

        .keyword-intro {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          border-radius: 15px;
          background: rgba(
            255,
            255,
            255,
            0.025
          );
        }

        .keyword-icon,
        .recommendation-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(
            192,
            75,
            255,
            0.12
          );
          color: #d25cff;
          font-weight: 900;
        }

        .keyword-intro h3 {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .keyword-intro p {
          margin: 0;
          color: #766d7e;
          font-size: 11px;
        }

        .keyword-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 17px;
        }

        .keyword-cloud span {
          border: 1px solid
            rgba(197, 86, 255, 0.2);
          color: #cdb1dc;
          background: rgba(
            197,
            86,
            255,
            0.07
          );
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 10px;
        }

        .muted-text {
          color: #766d7e;
          font-size: 11px;
        }

        .skills-summary {
          display: grid;
          grid-template-columns: repeat(
            3,
            1fr
          );
          gap: 10px;
          margin-bottom: 15px;
        }

        .skill-summary-card {
          padding: 18px;
          border-radius: 13px;
          background: rgba(
            255,
            255,
            255,
            0.025
          );
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .skill-summary-card strong {
          font-size: 25px;
        }

        .skill-summary-card span {
          color: #736a7b;
          font-size: 10px;
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 23px;
        }

        .recommendation-list {
          display: grid;
          gap: 9px;
        }

        .recommendation-item {
          display: grid;
          grid-template-columns:
            45px 1fr 30px;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border-radius: 13px;
          background: rgba(
            255,
            255,
            255,
            0.022
          );
          border: 1px solid
            rgba(255, 255, 255, 0.045);
        }

        .recommendation-number {
          color: #8d8296;
          font-size: 10px;
          font-weight: 800;
        }

        .recommendation-item p {
          margin: 0;
          color: #bbb2c2;
          font-size: 12px;
        }

        .recommendation-item > span {
          color: #bc55ff;
          text-align: right;
        }

        .recommendation-loading {
          padding: 18px;
          color: #766d7e;
          font-size: 11px;
          border-radius: 13px;
          background: rgba(
            255,
            255,
            255,
            0.02
          );
        }

        .empty-analysis {
          padding: 55px 20px;
          text-align: center;
          border-radius: 15px;
          background: rgba(
            255,
            255,
            255,
            0.018
          );
        }

        .loading-orb {
          width: 55px;
          height: 55px;
          margin: 0 auto 16px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(
            190,
            80,
            255,
            0.1
          );
          color: #d15cff;
          animation: pulse 1.4s infinite;
        }

        .empty-analysis h3 {
          margin: 0;
          font-size: 15px;
        }

        .empty-analysis p {
          max-width: 500px;
          margin: 8px auto 0;
          color: #766d7e;
          font-size: 11px;
          line-height: 1.6;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .edit-link {
          color: #c85bff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            1fr
          );
          gap: 10px;
          margin-top: 23px;
        }

        .profile-item {
          padding: 17px;
          border-radius: 14px;
          background: rgba(
            255,
            255,
            255,
            0.02
          );
          border: 1px solid
            rgba(255, 255, 255, 0.05);
        }

        .profile-item small {
          display: block;
          color: #706777;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          margin-bottom: 8px;
        }

        .profile-item strong {
          display: block;
          color: #c9c0d0;
          font-size: 12px;
          line-height: 1.5;
          word-break: break-word;
        }

        .cta-section {
          margin-top: 18px;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          background:
            radial-gradient(
              circle at 80% 50%,
              rgba(
                191,
                71,
                255,
                0.13
              ),
              transparent 40%
            ),
            rgba(
              255,
              255,
              255,
              0.035
            );
        }

        .cta-section p {
          color: #776e7f;
          font-size: 12px;
          margin: 10px 0 0;
        }

        .cta-button {
          min-width: 210px;
          padding: 15px 18px;
          border-radius: 13px;
          text-decoration: none;
          color: white;
          background: linear-gradient(
            100deg,
            #8939d9,
            #c54eff
          );
          box-shadow: 0 12px 35px
            rgba(174, 66, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: 800;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px
            rgba(174, 66, 255, 0.3);
        }

        .cta-arrow {
          font-size: 18px;
        }

        footer {
          display: flex;
          justify-content: space-between;
          color: #514957;
          font-size: 10px;
          padding: 30px 5px 0;
        }

        footer span:first-child {
          color: #786e7e;
          font-weight: 800;
        }

        @media (max-width: 850px) {

          .score-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(
              2,
              1fr
            );
          }

          .analysis-row {
            grid-template-columns:
              1fr 70px 80px;
          }

          .skill-description {
            grid-column: 1 / -1;
          }

          .cta-section {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 600px) {

          .optimize-container {
            width: min(
              100% - 24px,
              1180px
            );
            padding-top: 15px;
          }

          .top-header {
            margin-bottom: 35px;
          }

          .ai-badge {
            display: none;
          }

          .header-spacer {
            display: none;
          }

          .hero-section h1 {
            font-size: 42px;
          }

          .target-card {
            flex-wrap: wrap;
          }

          .target-status {
            width: 100%;
            margin-left: 0;
          }

          .target-divider {
            display: none;
          }

          .score-card {
            padding: 24px;
          }

          .score-ring {
            width: 105px;
            height: 105px;
          }

          .score-number {
            font-size: 46px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .analysis-section,
          .recommendation-section,
          .profile-section,
          .cta-section {
            padding: 21px;
            border-radius: 18px;
          }

          .section-title,
          .profile-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .analysis-row {
            grid-template-columns:
              1fr 60px;
            gap: 10px;
          }

          .status-badge {
            display: none;
          }

          .skill-description {
            grid-column: 1 / -1;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .skills-summary {
            grid-template-columns: 1fr;
          }

          footer {
            flex-direction: column;
            gap: 7px;
          }
        }

      `}</style>
      <CareerChatbot
        company={company}
        role={position}
        jobType={data?.template}
        jobDescription={data?.jobDescription}
        resumeText={data?.resumeText}
        jobAnalysis={jobAnalysis || analysis}
      />
      </main>
    </AuthGuard>
  );
}

/* =====================================================
   NORMALIZE API RESPONSE
===================================================== */

function normalizeAnalysisResult(
  result: any
): AnalysisResult {

  /*
   * IMPORTANT:
   * Backend returns `items`, not `analysisItems`.
   */

  const rawItems =
    result?.items ||
    result?.analysisItems ||
    result?.analysis ||
    result?.skillsAnalysis ||
    [];

  const analysisItems: AnalysisItem[] =
    Array.isArray(rawItems)
      ? rawItems
          .map((item: any) => {

            const score =
              clampScore(
                Number(
                  item?.score ??
                    item?.match ??
                    item?.percentage ??
                    0
                )
              );

            const status =
              item?.status === "strong" ||
              item?.status === "good" ||
              item?.status === "gap"
                ? item.status
                : score >= 85
                ? "strong"
                : score >= 65
                ? "good"
                : "gap";

            return {
              name: String(
                item?.name ||
                  item?.skill ||
                  item?.keyword ||
                  "Skill"
              ).trim(),

              score,

              status,

              description: String(
                item?.description ||
                  item?.reason ||
                  item?.feedback ||
                  getDefaultDescription(
                    status
                  )
              ).trim(),
            };
          })
          .filter(
            (item: AnalysisItem) =>
              item.name.length > 0
          )
      : [];

  const fallbackScore =
    analysisItems.length > 0
      ? Math.round(
          analysisItems.reduce(
            (sum, item) =>
              sum + item.score,
            0
          ) /
            analysisItems.length
        )
      : 0;

  const overallScore =
    clampScore(
      Number(
        result?.overallScore ??
          result?.score ??
          result?.matchScore ??
          fallbackScore
      )
    );

  const keywords =
    normalizeStringArray(
      result?.keywords ||
        result?.atsKeywords ||
        result?.importantKeywords
    );

  const recommendations =
    normalizeStringArray(
      result?.recommendations ||
        result?.suggestions ||
        result?.improvements
    );

  return {
    overallScore,

    summary: String(
      result?.summary ||
        result?.message ||
        result?.overallSummary ||
        ""
    ).trim(),

    verdict: String(
      result?.verdict || ""
    ).trim(),

    analysisItems,

    keywords,

    recommendations,
  };
}

/* =====================================================
   HELPERS
===================================================== */

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
}

function normalizeStringArray(
  value: any
): string[] {

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      typeof item === "string"
        ? item.trim()
        : String(
            item?.name ||
              item?.keyword ||
              item?.text ||
              ""
          ).trim()
    )
    .filter(Boolean);
}

function getDefaultDescription(
  status: AnalysisItem["status"]
) {
  if (status === "strong") {
    return "Strong alignment with the target opportunity.";
  }

  if (status === "good") {
    return "Relevant experience detected.";
  }

  return "Consider adding stronger evidence for this requirement.";
}

function getScoreTitle(score: number) {

  if (score >= 90) {
    return "Excellent match";
  }

  if (score >= 80) {
    return "Strong match";
  }

  if (score >= 70) {
    return "Good match";
  }

  if (score >= 60) {
    return "Needs improvement";
  }

  return "More optimization needed";
}

/* =====================================================
   SMALL COMPONENTS
===================================================== */

function AnalysisStep({
  done,
  active,
  text,
}: {
  done: boolean;
  active: boolean;
  text: string;
}) {
  return (
    <div
      className={`analysis-step ${
        done ? "done" : ""
      } ${active ? "active" : ""}`}
    >
      <div className="step-icon">
        {done
          ? "✓"
          : active
          ? "•"
          : ""}
      </div>

      <span>{text}</span>
    </div>
  );
}

function StatCard({
  value,
  label,
  description,
}: {
  value: number;
  label: string;
  description: string;
}) {
  return (
    <div className="stat-card">

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-description">
        {description}
      </div>

    </div>
  );
}

function AnalysisRow({
  item,
}: {
  item: AnalysisItem;
}) {
  return (
    <div className="analysis-row">

      <div className="skill-name">
        {item.name}
      </div>

      <div className="skill-score">
        {item.score}%
      </div>

      <div
        className={`status-badge ${item.status}`}
      >
        {item.status === "strong"
          ? "STRONG"
          : item.status === "good"
          ? "GOOD"
          : "GAP"}
      </div>

      <div className="skill-description">
        {item.description}
      </div>

    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="profile-item">

      <small>{label}</small>

      <strong>{value}</strong>

    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="empty-analysis">

      <h3>
        No analysis available
      </h3>

      <p>{text}</p>

    </div>
  );
}
