"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CareerChatbot from "@/components/chat/CareerChatbot";
import AuthGuard from "@/components/auth/AuthGuard";
import PromotionSlot from "@/components/ads/PromotionSlot";

/* ============================================================
   TYPES
   ============================================================ */

type MatchItem = {
  name: string;
  score: number;
  status: "strong" | "good" | "gap";
  description: string;
};

type AnalysisResult = {
  overallScore: number;
  summary: string;
  verdict: string;
  items: MatchItem[];
  keywords: string[];
  recommendations: string[];
  optimizedResume?: {
    professionalSummary: string;
    skills: string[];
    experience: string[];
    projects: string[];
  };
};

type ResumeProfile = {
  name?: string;
  fullName?: string;
  targetCompany?: string;
  selectedCompany?: string;
  company?: string;
  targetPosition?: string;
  position?: string;
  jobDescription?: string;
  skills?: string;
  resumeText?: string;
};

/* ============================================================
   HELPERS
   ============================================================ */

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent Match";
  if (score >= 65) return "Good Match";
  if (score >= 45) return "Partial Match";
  return "Low Match";
}

function getStatusIcon(status: MatchItem["status"]) {
  if (status === "strong") return "✓";
  if (status === "good") return "●";
  return "✕";
}

function getStatusLabel(status: MatchItem["status"]) {
  if (status === "strong") return "Strong Match";
  if (status === "good") return "Partial Match";
  return "Missing Gap";
}

function getStatusBg(status: MatchItem["status"]) {
  if (status === "strong") return "rgba(34,197,94,0.12)";
  if (status === "good") return "rgba(245,158,11,0.12)";
  return "rgba(239,68,68,0.12)";
}

function getStatusBorder(status: MatchItem["status"]) {
  if (status === "strong") return "rgba(34,197,94,0.3)";
  if (status === "good") return "rgba(245,158,11,0.3)";
  return "rgba(239,68,68,0.3)";
}

function getStatusTextColor(status: MatchItem["status"]) {
  if (status === "strong") return "#86efac";
  if (status === "good") return "#fcd34d";
  return "#fca5a5";
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function MatchPage() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "keywords" | "recommendations">("overview");

  /* Load from sessionStorage */
  useEffect(() => {
    try {
      const savedProfile =
        sessionStorage.getItem("resumeAI_profile") ||
        sessionStorage.getItem("resumeAIData") ||
        sessionStorage.getItem("resumeProfile");

      const savedAnalysis =
        sessionStorage.getItem("resumeAI_analysis") ||
        sessionStorage.getItem("RESUME_AI_ANALYSIS");

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      if (savedAnalysis) {
        setAnalysis(JSON.parse(savedAnalysis));
      }
    } catch {
      // ignore
    }
  }, []);

  /* Derived values */
  const company = profile?.targetCompany || profile?.selectedCompany || profile?.company || "";
  const role = profile?.targetPosition || profile?.position || "";
  const overallScore = analysis?.overallScore ?? 0;

  const strongItems = useMemo(() => analysis?.items?.filter((i) => i.status === "strong") ?? [], [analysis]);
  const goodItems = useMemo(() => analysis?.items?.filter((i) => i.status === "good") ?? [], [analysis]);
  const gapItems = useMemo(() => analysis?.items?.filter((i) => i.status === "gap") ?? [], [analysis]);

  /* Run fresh analysis */
  async function runAnalysis() {
    if (!profile) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: profile,
          company,
          role,
          jobDescription: profile.jobDescription || "",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data = await res.json();
      setAnalysis(data);

      try {
        sessionStorage.setItem("resumeAI_analysis", JSON.stringify(data));
        sessionStorage.setItem("RESUME_AI_ANALYSIS", JSON.stringify(data));
      } catch {
        // ignore storage errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  /* --- NO PROFILE --- */
  if (!profile) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyState}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
          <h2 style={{ color: "white", marginBottom: 10, fontSize: 24, fontWeight: 700 }}>No Candidate Profile Found</h2>
          <p style={{ color: "#a78bfa", marginBottom: 24, maxWidth: 440, lineHeight: 1.6 }}>
            Please create your resume or enter your target company and skills first to generate a full job match report.
          </p>
          <Link href="/create" style={styles.primaryBtn}>
            Build Resume Now →
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor = getScoreColor(overallScore);
  const scoreLabel = getScoreLabel(overallScore);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <div style={styles.breadcrumb}>
              <Link href="/create" style={styles.breadcrumbLink}>Resume Builder</Link>
              <span style={{ color: "#6b7280" }}> / </span>
              <Link href="/create/optimize" style={styles.breadcrumbLink}>AI Optimization</Link>
              <span style={{ color: "#6b7280" }}> / </span>
              <span style={{ color: "#a78bfa" }}>Job Matching</span>
            </div>
            <h1 style={styles.pageTitle}>Resume–Job Matching Report</h1>
            {(company || role) && (
              <p style={styles.targetText}>
                Target: <strong>{[role, company].filter(Boolean).join(" at ")}</strong>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={runAnalysis}
              disabled={loading}
              style={loading ? styles.btnDisabled : styles.primaryBtn}
            >
              {loading ? "Analyzing..." : "Re-analyze Match"}
            </button>
            <Link href="/resume" style={styles.secondaryBtn}>
              Preview Resume →
            </Link>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {analysis ? (
          <>
            {/* SCORE HERO */}
            <div style={styles.scoreHero}>
              <div style={styles.scoreRingWrap}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 68}`}
                    strokeDashoffset={`${2 * Math.PI * 68 * (1 - overallScore / 100)}`}
                    transform="rotate(-90 80 80)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div style={styles.scoreRingLabel}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: scoreColor }}>{overallScore}</span>
                  <span style={{ fontSize: 18, color: "#9ca3af" }}>%</span>
                </div>
              </div>

              <div style={styles.scoreInfo}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "#94a3b8", fontWeight: 700, marginBottom: 6 }}>
                  EXPLAINABLE MATCH SCORE
                </div>
                <h2 style={{ color: scoreColor, fontSize: 26, fontWeight: 800, margin: 0 }}>{scoreLabel}</h2>
                <p style={{ color: "#cbd5e1", marginTop: 10, lineHeight: 1.6, maxWidth: 540 }}>
                  {analysis.summary}
                </p>
                {analysis.verdict && (
                  <div style={styles.verdictBox}>
                    <strong>AI Verdict:</strong> {analysis.verdict}
                  </div>
                )}

                <div style={styles.miniStats}>
                  <div style={styles.miniStat}>
                    <span style={{ color: "#22c55e", fontSize: 22, fontWeight: 800 }}>{strongItems.length}</span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>Strong</span>
                  </div>
                  <div style={styles.miniStatDivider} />
                  <div style={styles.miniStat}>
                    <span style={{ color: "#f59e0b", fontSize: 22, fontWeight: 800 }}>{goodItems.length}</span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>Partial</span>
                  </div>
                  <div style={styles.miniStatDivider} />
                  <div style={styles.miniStat}>
                    <span style={{ color: "#ef4444", fontSize: 22, fontWeight: 800 }}>{gapItems.length}</span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>Missing Gaps</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div style={styles.tabs}>
              {(["overview", "skills", "keywords", "recommendations"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={activeTab === tab ? styles.tabActive : styles.tabInactive}
                >
                  {tab === "overview" && "Overview Comparison"}
                  {tab === "skills" && "Detailed Skills Breakdown"}
                  {tab === "keywords" && "ATS Keywords"}
                  {tab === "recommendations" && "Actionable Improvements"}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div style={styles.grid3}>
                {strongItems.length > 0 && (
                  <div style={styles.groupCard}>
                    <div style={styles.groupHeader}>
                      <span style={{ color: "#22c55e" }}>✓ Matched Skills</span>
                      <span style={styles.badge}>{strongItems.length}</span>
                    </div>
                    {strongItems.map((item) => (
                      <MatchCard key={item.name} item={item} />
                    ))}
                  </div>
                )}

                {goodItems.length > 0 && (
                  <div style={styles.groupCard}>
                    <div style={styles.groupHeader}>
                      <span style={{ color: "#f59e0b" }}>● Partial Match</span>
                      <span style={styles.badge}>{goodItems.length}</span>
                    </div>
                    {goodItems.map((item) => (
                      <MatchCard key={item.name} item={item} />
                    ))}
                  </div>
                )}

                {gapItems.length > 0 && (
                  <div style={styles.groupCard}>
                    <div style={styles.groupHeader}>
                      <span style={{ color: "#ef4444" }}>✕ Missing Skills</span>
                      <span style={styles.badge}>{gapItems.length}</span>
                    </div>
                    {gapItems.map((item) => (
                      <MatchCard key={item.name} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === "skills" && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Skill-by-Skill Requirement Analysis</h3>
                <p style={{ color: "#94a3b8", marginBottom: 20, fontSize: 14 }}>
                  Compare what the role expects against what your actual profile demonstrates.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {analysis.items.map((item) => (
                    <div
                      key={item.name}
                      style={{
                        background: getStatusBg(item.status),
                        border: `1px solid ${getStatusBorder(item.status)}`,
                        borderRadius: 12,
                        padding: "16px 20px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16 }}>{getStatusIcon(item.status)}</span>
                          <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{item.name}</span>
                          <span
                            style={{
                              background: getStatusBorder(item.status),
                              color: getStatusTextColor(item.status),
                              padding: "2px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                        <span style={{ color: getStatusTextColor(item.status), fontWeight: 800, fontSize: 18 }}>
                          {item.score}%
                        </span>
                      </div>

                      <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, marginBottom: 10 }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${item.score}%`,
                            background:
                              item.status === "strong" ? "#22c55e" : item.status === "good" ? "#f59e0b" : "#ef4444",
                            borderRadius: 3,
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>

                      <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KEYWORDS TAB */}
            {activeTab === "keywords" && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>ATS Optimization Keywords</h3>
                <p style={{ color: "#94a3b8", marginBottom: 20, fontSize: 14 }}>
                  Include these critical keywords naturally in your work experience, projects, or skills section.
                </p>
                {analysis.keywords.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {analysis.keywords.map((kw) => (
                      <span key={kw} style={styles.keyword}>
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280" }}>No ATS keywords found. Re-run analysis.</p>
                )}

                <div
                  style={{
                    marginTop: 24,
                    padding: "16px 20px",
                    background: "rgba(99,102,241,0.1)",
                    borderRadius: 12,
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  <p style={{ color: "#c7d2fe", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                    <strong>Honest AI Principle:</strong> Only include keywords for technologies and responsibilities you have actually worked on. Never fabricate qualifications.
                  </p>
                </div>
              </div>
            )}

            {/* RECOMMENDATIONS TAB */}
            {activeTab === "recommendations" && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>AI Recommendations for Next Application</h3>
                <p style={{ color: "#94a3b8", marginBottom: 20, fontSize: 14 }}>
                  Tailored suggestions based on your real experience and the job expectations:
                </p>
                {analysis.recommendations.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} style={styles.recCard}>
                        <span style={styles.recNumber}>{i + 1}</span>
                        <p style={{ color: "#e2e8f0", margin: 0, fontSize: 14, lineHeight: 1.6 }}>{rec}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280" }}>No recommendations available.</p>
                )}

                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/resume" style={styles.primaryBtn}>
                    View Tailored Resume →
                  </Link>
                  <Link href="/create/optimize" style={styles.secondaryBtn}>
                    Learning Roadmap & Gaps →
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          /* NO ANALYSIS YET */
          <div style={styles.noAnalysis}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h2 style={{ color: "white", marginBottom: 10, fontSize: 22, fontWeight: 700 }}>Analysis Ready to Generate</h2>
            <p style={{ color: "#94a3b8", marginBottom: 24, maxWidth: 440, textAlign: "center", lineHeight: 1.6 }}>
              {error
                ? `Error: ${error}`
                : "Compare your resume profile with the job description to get your match score, ATS keywords, and missing gaps."}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={runAnalysis}
                disabled={loading}
                style={loading ? styles.btnDisabled : styles.primaryBtn}
              >
                {loading ? "Analyzing..." : "Generate Match Report"}
              </button>
              <Link href="/create" style={styles.secondaryBtn}>
                Edit Job Details →
              </Link>
            </div>
          </div>
        )}
        <PromotionSlot slot="banner" />
      </main>

      {/* Context-aware Chatbot */}
      <CareerChatbot
        company={company}
        role={role}
        jobDescription={profile?.jobDescription}
        resumeText={profile?.resumeText}
        jobAnalysis={analysis as unknown as Record<string, unknown>}
      />
    </div>
  );
}

/* ============================================================
   MATCH CARD COMPONENT
   ============================================================ */

function MatchCard({ item }: { item: MatchItem }) {
  return (
    <div
      style={{
        background: getStatusBg(item.status),
        border: `1px solid ${getStatusBorder(item.status)}`,
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
          {getStatusIcon(item.status)} {item.name}
        </span>
        <span style={{ color: getStatusTextColor(item.status), fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
          {item.score}%
        </span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 8 }}>
        <div
          style={{
            height: "100%",
            width: `${item.score}%`,
            background: item.status === "strong" ? "#22c55e" : item.status === "good" ? "#f59e0b" : "#ef4444",
            borderRadius: 2,
          }}
        />
      </div>
      <p style={{ color: "#cbd5e1", fontSize: 12, margin: 0, lineHeight: 1.4 }}>{item.description}</p>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a1a 0%, #0f0820 50%, #0a0a1a 100%)",
    color: "#e2e8f0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    paddingBottom: 60,
  },
  header: {
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    padding: "20px 32px",
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  breadcrumb: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  breadcrumbLink: { color: "#a78bfa", textDecoration: "none" },
  pageTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "white",
    background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  targetText: { color: "#cbd5e1", fontSize: 14, marginTop: 4 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },

  scoreHero: {
    display: "flex",
    gap: 36,
    alignItems: "center",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "32px 36px",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  scoreRingWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scoreRingLabel: {
    position: "absolute",
    display: "flex",
    alignItems: "baseline",
    gap: 2,
  },
  scoreInfo: { flex: 1, minWidth: 260 },
  verdictBox: {
    marginTop: 14,
    padding: "10px 16px",
    background: "rgba(99,102,241,0.1)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 10,
    color: "#c7d2fe",
    fontSize: 14,
    lineHeight: 1.6,
  },
  miniStats: {
    display: "flex",
    gap: 0,
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
    width: "fit-content",
  },
  miniStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 20px",
    gap: 4,
  },
  miniStatDivider: {
    width: 1,
    background: "rgba(255,255,255,0.07)",
    alignSelf: "stretch",
  },

  tabs: {
    display: "flex",
    gap: 6,
    marginBottom: 20,
    background: "rgba(255,255,255,0.03)",
    padding: 6,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.07)",
    flexWrap: "wrap",
  },
  tabActive: {
    padding: "10px 18px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  tabInactive: {
    padding: "10px 18px",
    borderRadius: 10,
    background: "transparent",
    color: "#94a3b8",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13,
  },

  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "26px 30px",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: 700,
    marginTop: 0,
    marginBottom: 6,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18,
  },
  groupCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
  },
  groupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    fontWeight: 700,
    fontSize: 14,
  },
  badge: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "2px 8px",
    fontSize: 12,
    color: "#94a3b8",
  },

  keyword: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    color: "#c7d2fe",
    fontWeight: 500,
  },

  recCard: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "14px 18px",
  },
  recNumber: {
    minWidth: 26,
    height: 26,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  primaryBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  secondaryBtn: {
    padding: "10px 20px",
    background: "rgba(255,255,255,0.07)",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  btnDisabled: {
    padding: "10px 20px",
    background: "rgba(124,58,237,0.3)",
    color: "#94a3b8",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "not-allowed",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "75vh",
    textAlign: "center",
    padding: 24,
  },
  noAnalysis: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "45vh",
    textAlign: "center",
    padding: 24,
  },
};
