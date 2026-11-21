"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import PromotionSlot from "@/components/ads/PromotionSlot";
import CareerChatbot from "@/components/chat/CareerChatbot";

/* ============================================================
   TYPES
   ============================================================ */

export type SavedResume = {
  id: string;
  title: string;
  targetCompany: string;
  targetPosition: string;
  template: string;
  score: number;
  updatedAt: string;
  profileData: Record<string, unknown>;
  analysisData?: Record<string, unknown>;
};

const STORAGE_SAVED_RESUMES = "resumeAI_saved_resumes";

/* ============================================================
   SAMPLE STARTER RESUMES (If user is new)
   ============================================================ */

const SAMPLE_STARTER: SavedResume = {
  id: "sample_tech_mahindra",
  title: "Frontend Developer Resume",
  targetCompany: "Tech Mahindra",
  targetPosition: "Frontend Developer",
  template: "modern",
  score: 87,
  updatedAt: new Date().toISOString(),
  profileData: {
    fullName: "Priyanshu Choure",
    name: "Priyanshu Choure",
    email: "priyanshu@example.com",
    phone: "+91 98765 43210",
    location: "Indore, India",
    linkedin: "linkedin.com/in/priyanshu",
    github: "github.com/priyanshu",
    targetCompany: "Tech Mahindra",
    targetPosition: "Frontend Developer",
    template: "modern",
    summary:
      "Frontend developer with strong skills in React, TypeScript, Next.js, and modern CSS. Experienced in building responsive web applications and integrating RESTful APIs.",
    skills: "React, TypeScript, Next.js, JavaScript, Tailwind CSS, Redux, REST APIs, Git",
    education: [
      {
        id: "edu_1",
        degree: "B.Tech in Computer Science",
        institution: "Technological University",
        startYear: "2020",
        endYear: "2024",
        grade: "8.5 CGPA",
        details: "Specialized in Full Stack Development and Data Structures.",
      },
    ],
    experience: [
      {
        id: "exp_1",
        role: "Frontend Developer Intern",
        company: "Innovate Tech",
        startDate: "Jan 2024",
        endDate: "Present",
        location: "Hybrid",
        details:
          "Developed core dashboard components using React and TypeScript. Improved load time by 30% through code splitting.",
      },
    ],
    projects: [
      {
        id: "proj_1",
        name: "ResumeAI Career Suite",
        role: "Lead Developer",
        link: "https://github.com/example/resume-ai",
        details:
          "Built full-stack AI career platform with resume matching, ATS optimization, and multi-template generation.",
      },
    ],
    certifications: [
      {
        id: "cert_1",
        name: "Meta Certified Frontend Developer",
        issuer: "Meta / Coursera",
        date: "2023",
        link: "https://coursera.org",
      },
    ],
    achievements: [
      "Winner of University Smart Hackathon 2023",
      "Solved 400+ algorithmic questions on LeetCode and GeeksforGeeks",
    ],
  },
  analysisData: {
    overallScore: 87,
    summary:
      "Strong alignment with Tech Mahindra's Frontend Developer profile. Excellent React and TypeScript proficiency.",
    verdict: "Ready for initial technical screening rounds.",
    keywords: ["React", "TypeScript", "Next.js", "REST APIs", "State Management", "Git"],
    recommendations: [
      "Highlight component performance optimization metrics in your experience.",
      "Add unit testing experience with Jest or React Testing Library.",
    ],
    items: [
      { name: "React", score: 95, status: "strong", description: "Demonstrated in multiple featured projects." },
      { name: "TypeScript", score: 90, status: "strong", description: "Strong type-safety across codebases." },
      { name: "Next.js", score: 85, status: "strong", description: "Experience with App Router and SSR." },
      { name: "REST APIs", score: 80, status: "good", description: "API integration documented in internship." },
      { name: "Unit Testing", score: 50, status: "gap", description: "Jest / RTL coverage could be emphasized." },
    ],
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [activeResume, setActiveResume] = useState<SavedResume | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Load saved resumes from localStorage + Cloud Database (MongoDB)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_RESUMES);
      let list: SavedResume[] = stored ? JSON.parse(stored) : [];

      // Check if current session has a live profile that isn't saved yet
      const currentSessionProfile =
        sessionStorage.getItem("resumeAI_profile") ||
        sessionStorage.getItem("resumeAIData");
      const currentSessionAnalysis =
        sessionStorage.getItem("resumeAI_analysis") ||
        sessionStorage.getItem("RESUME_AI_ANALYSIS");

      if (currentSessionProfile) {
        const profile = JSON.parse(currentSessionProfile);
        const analysis = currentSessionAnalysis ? JSON.parse(currentSessionAnalysis) : null;

        const company = profile.targetCompany || profile.selectedCompany || profile.company || "General";
        const position = profile.targetPosition || profile.position || "Software Role";

        // Check if already in list
        const exists = list.some(
          (r) => r.targetCompany === company && r.targetPosition === position
        );

        if (!exists && (profile.fullName || profile.name)) {
          const newEntry: SavedResume = {
            id: "res_" + Date.now().toString(36),
            title: `${position} Resume`,
            targetCompany: company,
            targetPosition: position,
            template: profile.template || "classic",
            score: analysis?.overallScore || 82,
            updatedAt: new Date().toISOString(),
            profileData: profile,
            analysisData: analysis,
          };
          list = [newEntry, ...list];
          localStorage.setItem(STORAGE_SAVED_RESUMES, JSON.stringify(list));

          // Also sync to Cloud API if user is logged in
          if (user?.email) {
            fetch("/api/resumes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: user.email,
                title: newEntry.title,
                targetCompany: company,
                targetRole: position,
                templateId: newEntry.template,
                matchScore: newEntry.score,
                analysis,
                resumeData: profile,
              }),
            }).catch(() => {});
          }
        }
      }

      // If list is completely empty, offer sample starter
      if (list.length === 0) {
        list = [SAMPLE_STARTER];
        localStorage.setItem(STORAGE_SAVED_RESUMES, JSON.stringify(list));
      }

      setResumes(list);
      if (list.length > 0) setActiveResume(list[0]);
    } catch {
      setResumes([SAMPLE_STARTER]);
    }

    // Fetch from MongoDB backend
    if (user?.email) {
      fetch(`/api/resumes?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.isDatabaseConnected) {
            setIsCloudSynced(true);
          }
          if (data && Array.isArray(data.resumes) && data.resumes.length > 0) {
            type ApiResume = {
              _id?: string;
              id?: string;
              title?: string;
              targetCompany?: string;
              targetRole?: string;
              templateId?: string;
              matchScore?: number;
              updatedAt?: string;
              resumeData?: Record<string, unknown>;
              analysis?: Record<string, unknown>;
            };

            const cloudResumes: SavedResume[] = data.resumes.map((r: ApiResume) => ({
              id: r._id || r.id || "res_" + Math.random().toString(36),
              title: r.title || "Resume",
              targetCompany: r.targetCompany || "General",
              targetPosition: r.targetRole || "Software Role",
              template: r.templateId || "modern",
              score: r.matchScore ?? 80,
              updatedAt: r.updatedAt || new Date().toISOString(),
              profileData: (r.resumeData as SavedResume["profileData"]) || {},
              analysisData: (r.analysis as SavedResume["analysisData"]) || null,
            }));

            setResumes((prev) => {
              const merged = [...cloudResumes];
              prev.forEach((local) => {
                if (
                  !merged.some(
                    (m) =>
                      m.targetCompany === local.targetCompany &&
                      m.targetPosition === local.targetPosition
                  )
                ) {
                  merged.push(local);
                }
              });
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleOpenResume = (resume: SavedResume, targetRoute: "/resume" | "/match" | "/create/optimize" | "/create") => {
    try {
      const serializedProfile = JSON.stringify(resume.profileData);
      sessionStorage.setItem("resumeAI_profile", serializedProfile);
      sessionStorage.setItem("resumeAIData", serializedProfile);
      sessionStorage.setItem("resumeProfile", serializedProfile);

      if (resume.analysisData) {
        const serializedAnalysis = JSON.stringify(resume.analysisData);
        sessionStorage.setItem("resumeAI_analysis", serializedAnalysis);
        sessionStorage.setItem("RESUME_AI_ANALYSIS", serializedAnalysis);
      }
    } catch {
      // storage error
    }
    router.push(targetRoute);
  };

  const handleDeleteResume = async (id: string) => {
    if (confirm("Are you sure you want to delete this saved resume?")) {
      const updated = resumes.filter((r) => r.id !== id);
      setResumes(updated);
      try {
        localStorage.setItem(STORAGE_SAVED_RESUMES, JSON.stringify(updated));
        await fetch(`/api/resumes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch {
        // error
      }
    }
  };

  const averageScore =
    resumes.length > 0
      ? Math.round(resumes.reduce((acc, r) => acc + (r.score || 0), 0) / resumes.length)
      : 0;

  return (
    <AuthGuard fallbackMessage="Please log in to access your saved resumes and career dashboard.">
      <div style={styles.page}>
        {/* TOP BAR */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <Link href="/" style={styles.brand}>
              <span style={styles.brandMark}>
                <span />
                <span />
                <span />
              </span>
              <span style={styles.brandName}>
                Resume<span style={{ color: "#a78bfa" }}>AI</span>
              </span>
            </Link>

            <nav style={styles.navLinks}>
              <Link href="/" style={styles.navLink}>Home</Link>
              <Link href="/match" style={styles.navLink}>Job Matching</Link>
              <Link href="/resume" style={styles.navLink}>Templates</Link>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: isCloudSynced ? "rgba(34, 197, 94, 0.12)" : "rgba(255, 255, 255, 0.05)",
                  border: isCloudSynced ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: isCloudSynced ? "#86efac" : "#94a3b8",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
                title={
                  isCloudSynced
                    ? "MongoDB Cloud Database Connected"
                    : "Running on Local Storage (Add MONGODB_URI to .env.local for Cloud sync)"
                }
              >
                <span>{isCloudSynced ? "🟢" : "💾"}</span>
                <span>{isCloudSynced ? "Cloud Synced" : "Local Mode"}</span>
              </span>
              <Link href="/create" style={styles.primaryBtn}>
                + Build New Resume
              </Link>
            </div>
          </div>
        </header>

        <main style={styles.main}>
          {/* WELCOME HERO */}
          <div style={styles.heroCard}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <span style={styles.kicker}>CANDIDATE WORKSPACE</span>
              <h1 style={styles.title}>
                Welcome back, {user?.name || "Candidate"}!
              </h1>
              <p style={styles.subtitle}>
                Manage your job-targeted resumes, monitor ATS match scores, and retarget for new opportunities.
              </p>
            </div>

            {/* Quick Metrics */}
            <div style={styles.metricsGrid}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Saved Resumes</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: "white" }}>{resumes.length}</span>
              </div>
              <div style={styles.metricDivider} />
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Average Match</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#22c55e" }}>
                  {averageScore}%
                </span>
              </div>
              <div style={styles.metricDivider} />
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Target Roles</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#a78bfa" }}>
                  {new Set(resumes.map((r) => r.targetCompany)).size}
                </span>
              </div>
            </div>
          </div>

          {/* SPONSOR BANNER */}
          <PromotionSlot slot="banner" />

          {/* SECTION HEADER */}
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>
                My Targeted Resumes
              </h2>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0 0" }}>
                Each resume is tailored to a specific company, role requirements, and ATS keywords.
              </p>
            </div>

            <Link href="/create" style={styles.secondaryBtn}>
              + Create Another Version
            </Link>
          </div>

          {/* RESUMES GRID */}
          {resumes.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 50, marginBottom: 14 }}>📋</div>
              <h3 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: "0 0 8px 0" }}>
                No saved resumes yet
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 420, marginBottom: 20 }}>
                Build your first job-tailored resume with Gemini AI analysis, ATS score, and 10 export templates.
              </p>
              <Link href="/create" style={styles.primaryBtn}>
                Create Your First Resume →
              </Link>
            </div>
          ) : (
            <div style={styles.grid}>
              {resumes.map((resume) => (
                <div key={resume.id} style={styles.resumeCard}>
                  {/* Top card bar */}
                  <div style={styles.cardTop}>
                    <div>
                      <span style={styles.companyBadge}>
                        🎯 {resume.targetCompany || "General Role"}
                      </span>
                      <h3 style={styles.resumeTitle}>{resume.title}</h3>
                      <div style={styles.resumePosition}>{resume.targetPosition}</div>
                    </div>

                    {/* Match Score Badge */}
                    <div style={styles.scoreBadge}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>
                        {resume.score}%
                      </span>
                      <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>
                        ATS Match
                      </span>
                    </div>
                  </div>

                  {/* Template & Date */}
                  <div style={styles.cardMeta}>
                    <span>
                      Template: <strong style={{ color: "white" }}>{resume.template.toUpperCase()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions Grid */}
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleOpenResume(resume, "/resume")}
                      style={styles.cardActionPrimary}
                    >
                      👁 View / PDF Export
                    </button>

                    <button
                      onClick={() => handleOpenResume(resume, "/match")}
                      style={styles.cardActionSecondary}
                    >
                      📊 Match Report
                    </button>

                    <button
                      onClick={() => handleOpenResume(resume, "/create/optimize")}
                      style={styles.cardActionSecondary}
                    >
                      🧭 Roadmap & Gaps
                    </button>

                    <button
                      onClick={() => handleDeleteResume(resume.id)}
                      title="Delete Resume"
                      style={styles.cardDeleteBtn}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Career Actions */}
          <div style={styles.quickActionsCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={styles.actionIcon}>💡</div>
              <div>
                <h4 style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "0 0 2px 0" }}>
                  Need Interview Preparation Advice?
                </h4>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  Open the AI Career Chatbot anytime from the bottom right corner to practice questions for your saved roles.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Global Floating Chatbot */}
        <CareerChatbot
          company={activeResume?.targetCompany || "Tech Target"}
          role={activeResume?.targetPosition || "Software Engineer"}
          jobAnalysis={activeResume?.analysisData || null}
        />
      </div>
    </AuthGuard>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #07070f 0%, #0c0818 50%, #07070f 100%)",
    color: "#e2e8f0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    paddingBottom: 60,
  },
  header: {
    background: "rgba(255, 255, 255, 0.03)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px 32px",
    position: "sticky",
    top: 0,
    zIndex: 40,
    backdropFilter: "blur(16px)",
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    display: "inline-block",
  },
  brandName: {
    fontSize: 19,
    fontWeight: 800,
    color: "white",
  },
  navLinks: {
    display: "flex",
    gap: 20,
    alignItems: "center",
  },
  navLink: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 0.2s",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
  },

  heroCard: {
    background: "radial-gradient(ellipse at 85% 30%, rgba(124, 58, 237, 0.16), transparent 60%), rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(124, 58, 237, 0.3)",
    borderRadius: 22,
    padding: "32px 36px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 28,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 800,
    color: "#a78bfa",
    display: "block",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: "white",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.5,
    margin: 0,
    maxWidth: 520,
  },

  metricsGrid: {
    display: "flex",
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  metric: {
    padding: "14px 22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 600,
  },
  metricDivider: {
    width: 1,
    background: "rgba(255, 255, 255, 0.08)",
    alignSelf: "stretch",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: 20,
  },
  resumeCard: {
    background: "rgba(255, 255, 255, 0.035)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 18,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "border-color 0.2s, transform 0.2s",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 14,
  },
  companyBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#c4b5fd",
    background: "rgba(124, 58, 237, 0.15)",
    padding: "3px 10px",
    borderRadius: 20,
    marginBottom: 8,
  },
  resumeTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "white",
    margin: "0 0 2px 0",
  },
  resumePosition: {
    fontSize: 13,
    color: "#94a3b8",
  },
  scoreBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    borderRadius: 12,
    padding: "8px 12px",
    minWidth: 64,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#64748b",
    marginBottom: 20,
    paddingTop: 12,
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  },
  cardActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  cardActionPrimary: {
    gridColumn: "1 / -1",
    padding: "10px 14px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "center",
  },
  cardActionSecondary: {
    padding: "8px 12px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
  cardDeleteBtn: {
    padding: "8px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    borderRadius: 9,
    fontSize: 13,
    cursor: "pointer",
  },

  quickActionsCard: {
    marginTop: 28,
    background: "rgba(255, 255, 255, 0.025)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: 16,
    padding: "20px 24px",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(124, 58, 237, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },

  primaryBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-block",
    cursor: "pointer",
    border: "none",
  },
  secondaryBtn: {
    padding: "9px 18px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },

  emptyState: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px dashed rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    padding: "48px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};
