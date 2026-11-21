"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CareerChatbot from "@/components/chat/CareerChatbot";
import ResumeRenderer from "@/components/resume/ResumeRenderer";
import AuthGuard from "@/components/auth/AuthGuard";
import PromotionSlot from "@/components/ads/PromotionSlot";

type Education = {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
  grade: string;
  details: string;
};

type Experience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  details: string;
};

type Internship = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  details: string;
};

type Project = {
  id: string;
  name: string;
  role: string;
  link: string;
  details: string;
};

type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
};

type ResumeProfile = {
  selectedCompany?: string;
  company?: string;
  position?: string;
  experience?: string | Experience[];
  skills?: string;
  resumeText?: string;
  fileName?: string;
  profileImage?: string;

  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  targetCompany?: string;
  targetPosition?: string;
  jobDescription?: string;
  summary?: string;
  technicalSkills?: string;
  softSkills?: string;
  languages?: string;
  existingResumeName?: string;
  education?: Education[];
  experienceItems?: Experience[];
  experienceList?: Experience[];
  internships?: Internship[];
  projects?: Project[];
  certifications?: Certification[];
  achievements?: string[];

  templateId?: string;
  template?: string;
};

type OptimizedResume = {
  professionalSummary?: string;
  skills?: string[];
  experience?: string[];
  projects?: string[];
};

type AnalysisResult = {
  overallScore?: number;
  summary?: string;
  verdict?: string;
  keywords?: string[];
  recommendations?: string[];
  optimizedResume?: OptimizedResume;
};

const PROFILE_STORAGE_KEY = "resumeAI_profile";
const DRAFT_STORAGE_KEY = "resumeAI_create_draft";
const ANALYSIS_STORAGE_KEY = "resumeAI_analysis";

const templateNames: Record<string, string> = {
  classic: "Classic",
  modern: "Modern",
  executive: "Executive",
  minimal: "Minimal",
  professional: "Professional",
  tech: "Tech",
  creative: "Creative",
  student: "Student",
  "two-column": "Two Column",
  elegant: "Elegant",
};

const normalizeTemplate = (value?: string) =>
  value && templateNames[value] ? value : "classic";

function clean(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

function splitValues(value?: string) {
  return clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ListSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`resume-section ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function ResumePage() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedProfile =
        sessionStorage.getItem(PROFILE_STORAGE_KEY) ||
        sessionStorage.getItem(DRAFT_STORAGE_KEY);

      const savedAnalysis = sessionStorage.getItem(ANALYSIS_STORAGE_KEY);

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      if (savedAnalysis) {
        setAnalysis(JSON.parse(savedAnalysis));
      }
    } catch (error) {
      console.error("Unable to load resume data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

 const template = normalizeTemplate(
  profile?.templateId || profile?.template
);
  const templateName = templateNames[template];

  const name =
    clean(profile?.name || profile?.fullName) || "Candidate";

  const position = clean(
    profile?.targetPosition || profile?.position
  );

  const company = clean(
    profile?.targetCompany ||
      profile?.selectedCompany ||
      profile?.company
  );

  const email = clean(profile?.email);
  const phone = clean(profile?.phone);
  const location = clean(profile?.location);
  const portfolio = clean(profile?.portfolio);
  const linkedin = clean(profile?.linkedin);
  const github = clean(profile?.github);

  const skills = useMemo(() => {
    const optimized =
      analysis?.optimizedResume?.skills || [];

    const raw = splitValues(
      profile?.technicalSkills || profile?.skills
    );

    return Array.from(
      new Set(
        [...optimized, ...raw]
          .map(clean)
          .filter(Boolean)
      )
    );
  }, [profile, analysis]);

  const softSkills = useMemo(
    () => splitValues(profile?.softSkills),
    [profile]
  );

  const languages = useMemo(
    () => splitValues(profile?.languages),
    [profile]
  );

  const education = profile?.education || [];

  const experience = Array.isArray(profile?.experience)
    ? profile.experience
    : profile?.experienceItems ||
      profile?.experienceList ||
      [];

  const internships = profile?.internships || [];
  const projects = profile?.projects || [];
  const certifications = profile?.certifications || [];
  const achievements = profile?.achievements || [];

  const optimizedExperience =
    analysis?.optimizedResume?.experience || [];

  const optimizedProjects =
    analysis?.optimizedResume?.projects || [];

  const summary =
    clean(
      analysis?.optimizedResume?.professionalSummary
    ) || clean(profile?.summary);

  const plainExperience =
    typeof profile?.experience === "string"
      ? profile.experience.trim()
      : "";

  const score =
    typeof analysis?.overallScore === "number"
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(analysis.overallScore)
          )
        )
      : null;

  const contactItems = [
    email,
    phone,
    location,
    portfolio,
    linkedin,
    github,
  ].filter(Boolean);

  const hasAnyResumeContent = Boolean(
    summary ||
      skills.length ||
      experience.length ||
      internships.length ||
      projects.length ||
      education.length ||
      certifications.length ||
      achievements.length ||
      plainExperience
  );

  if (loading) {
    return (
      <main className="loading-page">
        <div>Loading your resume...</div>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #08030d;
            color: white;
            font-family: Arial, sans-serif;
          }
        `}</style>
    </main>
    );
  }

  if (!profile) {
    return (
      <main className="empty-page">
        <div className="empty-box">
          <h1>No resume data found</h1>

          <p>
            Please create your resume profile before
            opening the final resume.
          </p>

          <Link href="/create">
            ← Create your resume
          </Link>
        </div>

        <style jsx>{`
          .empty-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #08030d;
            color: white;
          }

          .empty-box {
            text-align: center;
            max-width: 500px;
            padding: 40px;
          }

          .empty-box p {
            color: #aaa;
            margin: 12px 0 25px;
          }

          .empty-box a {
            color: #d946ef;
            text-decoration: none;
            font-weight: 700;
          }
        `}</style>
    </main>
    );
  }

  return (
    <AuthGuard fallbackMessage="Please log in to preview, customize, and export your tailored resume.">
      <main className="resume-page">
      {/* TOP BAR */}
      <header className="topbar no-print">
        <Link href="/create" className="brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-name">
            Resume<span>AI</span>
          </span>
        </Link>

        <div className="top-actions">
          <Link href="/dashboard" className="back-btn">
            Dashboard
          </Link>
          <Link href="/match" className="back-btn">
            Match Report
          </Link>
          <Link href="/create" className="back-btn">
            ← Change template
          </Link>

          <button
            className="download-btn"
            type="button"
            onClick={() => window.print()}
          >
            Download / Print
          </button>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="resume-container">
        <div className="page-heading no-print">
          <div>
            <span className="eyebrow">
              FINAL RESUME · {templateName.toUpperCase()}
            </span>

            <h1>Your resume is ready.</h1>

            <p>
              {position
                ? `Built from your information${
                    company
                      ? ` for ${position} at ${company}.`
                      : ` for ${position}.`
                  }`
                : "Built from the information you provided."}
            </p>
          </div>

          {score !== null && (
            <div className="match-badge">
              <span>AI MATCH</span>
              <strong>{score}%</strong>
            </div>
          )}
        </div>

        {!analysis && (
          <div className="notice no-print">
            <strong>
              AI analysis is not available.
            </strong>

            <span>
              The resume below contains only information
              supplied in your profile.
            </span>
          </div>
        )}

        {!hasAnyResumeContent && (
          <div className="notice no-print">
            <strong>
              Your profile does not contain enough
              resume content yet.
            </strong>

            <span>
              Add experience, skills, education or
              projects before generating the final resume.
            </span>
          </div>
        )}

        {/* ACTUAL TEMPLATE */}
        <div className="resume-layout">
          <article
            className={`resume-paper template-${template}`}
          >
            <ResumeRenderer
              template={template}
              profile={profile}
              name={name}
              position={position}
              company={company}
              contactItems={contactItems}
              summary={summary}
              skills={skills}
              softSkills={softSkills}
              languages={languages}
              experience={experience}
              internships={internships}
              projects={projects}
              education={education}
              certifications={certifications}
              achievements={achievements}
              optimizedExperience={optimizedExperience}
              optimizedProjects={optimizedProjects}
              plainExperience={plainExperience}
            />
          </article>

          {/* RIGHT PANEL */}
          <aside className="side-panel no-print">
            <div className="side-card template-status">
              <span className="card-label">
                SELECTED TEMPLATE
              </span>

              <h3>{templateName}</h3>

              <p>
                This resume is rendered using the actual
                {` ${templateName}`} layout.
              </p>
            </div>

            {analysis && (
              <>
                <div className="side-card">
                  <span className="card-label">
                    AI ANALYSIS
                  </span>

                  <h3>Resume strength</h3>

                  {score !== null && (
                    <>
                      <div className="strength-score">
                        <strong>{score}</strong>
                        <span>/100</span>
                      </div>

                      <div className="strength-bar">
                        <div
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>
                    </>
                  )}

                  {analysis.verdict && (
                    <p>{analysis.verdict}</p>
                  )}
                </div>

                {analysis.keywords &&
                  analysis.keywords.length > 0 && (
                    <div className="side-card">
                      <span className="card-label">
                        ATS KEYWORDS
                      </span>

                      <div className="keyword-list">
                        {analysis.keywords.map(
                          (keyword, index) => (
                            <span
                              key={`${keyword}-${index}`}
                            >
                              {keyword}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {analysis.recommendations &&
                  analysis.recommendations.length >
                    0 && (
                    <div className="side-card">
                      <span className="card-label">
                        RECOMMENDATIONS
                      </span>

                      <ul className="recommendations">
                        {analysis.recommendations.map(
                          (item, index) => (
                            <li
                              key={`recommendation-${index}`}
                            >
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </>
            )}

            <PromotionSlot slot="sidebar" />

            <button
              type="button"
              className="print-side-btn"
              onClick={() => window.print()}
            >
              Print / Save as PDF
            </button>
          </aside>
        </div>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .resume-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top,
              #26043b 0,
              #0b0410 45%,
              #050207 100%
            );
          color: #f5eff8;
          padding-bottom: 80px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .topbar {
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          text-decoration: none;
        }

        .brand-mark {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: flex-end;
          gap: 3px;
        }

        .brand-mark span {
          width: 6px;
          border-radius: 4px;
          background: #d946ef;
        }

        .brand-mark span:nth-child(1) {
          height: 12px;
        }

        .brand-mark span:nth-child(2) {
          height: 20px;
        }

        .brand-mark span:nth-child(3) {
          height: 28px;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 800;
        }

        .brand-name span {
          color: #d946ef;
        }

        .top-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .back-btn,
        .download-btn,
        .print-side-btn {
          border: 1px solid
            rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: white;
          border-radius: 10px;
          padding: 11px 16px;
          text-decoration: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .download-btn,
        .print-side-btn {
          background: #a21caf;
          border-color: #c026d3;
        }

        .resume-container {
          width: min(1180px, 92%);
          margin: 0 auto;
          padding-top: 60px;
        }

        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 28px;
        }

        .eyebrow,
        .card-label {
          color: #d946ef;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .page-heading h1 {
          margin: 8px 0;
          font-size: clamp(30px, 4vw, 48px);
        }

        .page-heading p {
          margin: 0;
          color: #aaa1b0;
          max-width: 700px;
          line-height: 1.6;
        }

        .match-badge {
          min-width: 130px;
          padding: 18px;
          border: 1px solid
            rgba(217, 70, 239, 0.35);
          border-radius: 16px;
          background: rgba(217, 70, 239, 0.08);
          text-align: center;
        }

        .match-badge span {
          display: block;
          color: #aaa1b0;
          font-size: 10px;
          letter-spacing: 0.14em;
        }

        .match-badge strong {
          display: block;
          margin-top: 5px;
          font-size: 34px;
          color: #e879f9;
        }

        .notice {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 22px;
          padding: 16px 18px;
          border: 1px solid
            rgba(217, 70, 239, 0.25);
          border-radius: 12px;
          background: rgba(217, 70, 239, 0.06);
        }

        .notice span {
          color: #aaa1b0;
          font-size: 13px;
        }

        .resume-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 310px;
          gap: 24px;
          align-items: start;
        }

        .resume-paper {
          background: white;
          color: #17131a;
          border-radius: 4px;
          min-height: 1120px;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.35);
          overflow: hidden;
        }

        .resume-inner {
          padding: 52px;
        }

        .resume-header {
          display: flex;
          justify-content: space-between;
          gap: 30px;
        }

        .identity {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .identity h2 {
          margin: 0;
          font-size: 30px;
        }

        .identity p {
          margin: 6px 0 0;
          color: #5e5662;
          font-size: 14px;
        }

        .identity small {
          display: block;
          margin-top: 4px;
          color: #756d79;
          font-size: 11px;
        }

        .profile-image {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          object-fit: cover;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          color: #5e5662;
          font-size: 11px;
          text-align: right;
          max-width: 280px;
          overflow-wrap: anywhere;
        }

        .resume-divider {
          height: 1px;
          background: #ddd7df;
          margin: 25px 0;
        }

        .resume-section {
          margin-bottom: 27px;
        }

        .resume-section h3 {
          margin: 0 0 11px;
          font-size: 12px;
          letter-spacing: 0.12em;
        }

        .resume-section > p {
          margin: 0;
          color: #403944;
          line-height: 1.7;
          font-size: 13px;
          white-space: pre-line;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skills-grid span {
          border: 1px solid #d8d1db;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          color: #39313e;
        }

        .text-list p {
          margin: 0 0 10px;
          color: #403944;
          line-height: 1.7;
          font-size: 13px;
          white-space: pre-line;
        }

        .timeline-item {
          margin-bottom: 18px;
        }

        .timeline-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .timeline-title {
          font-size: 14px;
          font-weight: 800;
          color: #1d1720;
        }

        .timeline-company {
          font-size: 12px;
          color: #6b626e;
          margin-top: 3px;
        }

        .timeline-date {
          font-size: 11px;
          color: #756d79;
          white-space: nowrap;
        }

        .timeline-details {
          margin-top: 7px;
          color: #403944;
          line-height: 1.65;
          font-size: 12.5px;
          white-space: pre-line;
        }

        .timeline-link {
          color: #8b159d;
          text-decoration: none;
          font-size: 11px;
        }

        .truth-note {
          margin-top: 45px;
          padding-top: 15px;
          border-top: 1px solid #e1dce3;
          color: #77707a;
          font-size: 10px;
          line-height: 1.5;
        }

        /* ======================================================
           01 CLASSIC
        ====================================================== */

        .template-classic {
          font-family: Arial, Helvetica, sans-serif;
        }

        .template-classic .resume-inner {
          padding: 54px;
        }

        .template-classic .resume-section h3 {
          color: #211b24;
        }

        .template-classic
          .resume-section
          h3::after {
          content: "";
          display: block;
          width: 42px;
          height: 2px;
          background: #222;
          margin-top: 6px;
        }

        /* ======================================================
           02 MODERN
        ====================================================== */

        .template-modern {
          font-family: Arial, Helvetica, sans-serif;
          border-top: 12px solid #a21caf;
        }

        .template-modern .resume-inner {
          padding: 50px;
        }

        .template-modern .modern-header {
          padding-bottom: 28px;
          border-bottom: 5px solid #a21caf;
        }

        .template-modern .identity h2 {
          font-size: 42px;
          letter-spacing: -0.04em;
        }

        .template-modern .resume-section h3 {
          color: #a21caf;
        }

        .template-modern .skills-grid span {
          border-radius: 6px;
        }

        /* ======================================================
           03 EXECUTIVE
        ====================================================== */

        .template-executive {
          font-family: Georgia,
            "Times New Roman", serif;
        }

        .template-executive .resume-inner {
          padding: 62px;
        }

        .template-executive
          .executive-header {
          text-align: center;
          padding-bottom: 25px;
          border-bottom: 2px solid #201b22;
        }

        .template-executive
          .executive-header
          .identity {
          display: block;
        }

        .template-executive
          .executive-header
          .identity
          h2 {
          font-size: 38px;
        }

        .template-executive
          .executive-header
          .contact-info {
          margin: 15px auto 0;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          max-width: 100%;
        }

        .template-executive .resume-section h3 {
          font-family: Arial, sans-serif;
          font-size: 10px;
          color: #7c1d91;
          letter-spacing: 0.2em;
        }

        .template-executive .skills-grid span {
          border: 0;
          border-bottom: 1px solid #d7d0d9;
          border-radius: 0;
          padding: 5px 0;
          width: 31%;
        }

        /* ======================================================
           04 MINIMAL
        ====================================================== */

        .template-minimal {
          font-family: Arial, sans-serif;
        }

        .template-minimal .resume-inner {
          padding: 66px;
        }

        .template-minimal
          .minimal-header {
          padding-bottom: 35px;
        }

        .template-minimal
          .minimal-header
          .identity {
          display: block;
        }

        .template-minimal
          .minimal-header
          .identity
          h2 {
          font-size: 42px;
          font-weight: 500;
        }

        .template-minimal
          .minimal-header
          .contact-info {
          margin-top: 18px;
          align-items: flex-start;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 6px 18px;
          max-width: 100%;
        }

        .template-minimal .resume-divider {
          background: #1e1820;
        }

        .template-minimal .resume-section {
          margin-bottom: 31px;
        }

        .template-minimal .resume-section h3 {
          color: #777;
          font-size: 10px;
          letter-spacing: 0.22em;
        }

        .template-minimal .skills-grid span {
          border: 0;
          border-bottom: 1px solid #bbb;
          padding: 4px 0;
          border-radius: 0;
        }

        /* ======================================================
           05 PROFESSIONAL
        ====================================================== */

        .template-professional {
          font-family: Arial, sans-serif;
        }

        .template-professional
          .professional-header {
          background: #f4eff6;
          padding: 34px 52px;
          margin-bottom: 30px;
        }

        .template-professional
          .professional-header
          .resume-header {
          align-items: center;
        }

        .template-professional
          .resume-section
          h3 {
          color: #7c1d91;
          border-bottom: 1px solid #ddd4e0;
          padding-bottom: 7px;
        }

        .template-professional
          .professional-columns {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 220px;
          gap: 32px;
        }

        .template-professional
          .professional-side {
          border-left: 1px solid #ddd4e0;
          padding-left: 22px;
        }

        .template-professional
          .timeline-item {
          padding-left: 15px;
          border-left: 3px solid #d946ef;
        }

        /* ======================================================
           06 TECH
        ====================================================== */

        .template-tech {
          font-family: "Courier New", monospace;
          background: #fbfbfc;
          border-top: 8px solid #151018;
        }

        .template-tech .resume-inner {
          padding: 48px;
        }

        .template-tech .tech-header {
          background: #151018;
          color: white;
          padding: 28px;
          margin-bottom: 30px;
        }

        .template-tech .tech-header .identity {
          display: block;
        }

        .template-tech
          .tech-header
          .identity
          h2 {
          font-family: "Courier New", monospace;
          color: white;
          font-size: 31px;
        }

        .template-tech
          .tech-header
          .identity
          h2::before {
          content: "> ";
          color: #e879f9;
        }

        .template-tech
          .tech-header
          .identity
          p {
          color: #d8cadc;
        }

        .template-tech
          .tech-header
          .contact-info {
          margin-top: 16px;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: flex-start;
          color: #ddd;
          max-width: 100%;
          gap: 6px 16px;
        }

        .template-tech .resume-section h3 {
          font-family: Arial, sans-serif;
          color: #a21caf;
        }

        .template-tech .skills-grid span {
          border: 1px solid #a21caf;
          border-radius: 3px;
          font-family: "Courier New", monospace;
        }

        .template-tech .resume-divider {
          background: #a21caf;
        }

        /* ======================================================
           07 CREATIVE
        ====================================================== */

        .template-creative {
          font-family: Arial, sans-serif;
        }

        .template-creative .creative-top {
          background:
            linear-gradient(
              135deg,
              #24102d,
              #8b1fa1
            );
          color: white;
          padding: 48px 52px;
          position: relative;
          overflow: hidden;
        }

        .template-creative
          .creative-top::after {
          content: "";
          position: absolute;
          width: 230px;
          height: 230px;
          right: -70px;
          top: -90px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.12
          );
        }

        .template-creative
          .creative-top
          .identity {
          position: relative;
          z-index: 2;
          display: block;
        }

        .template-creative
          .creative-top
          .identity
          h2 {
          color: white;
          font-size: 42px;
        }

        .template-creative
          .creative-top
          .identity
          p {
          color: #f2dff5;
        }

        .template-creative
          .creative-top
          .contact-info {
          margin-top: 18px;
          position: relative;
          z-index: 2;
          align-items: flex-start;
          text-align: left;
          flex-direction: row;
          flex-wrap: wrap;
          max-width: 100%;
          color: #fff;
          gap: 6px 15px;
        }

        .template-creative
          .creative-content {
          padding: 45px 52px;
        }

        .template-creative
          .resume-section
          h3 {
          color: #a21caf;
        }

        .template-creative
          .skills-grid
          span {
          background: #211526;
          color: white;
          border-color: #211526;
        }

        /* ======================================================
           08 STUDENT
        ====================================================== */

        .template-student {
          font-family: Arial, sans-serif;
        }

        .template-student .student-header {
          padding: 42px;
          background: #f8f2fa;
          border-bottom: 5px solid #a21caf;
        }

        .template-student
          .student-header
          .resume-header {
          align-items: center;
        }

        .template-student
          .identity
          h2 {
          font-size: 34px;
        }

        .template-student
          .resume-section
          h3 {
          color: #a21caf;
          border-bottom: 2px solid #eee;
          padding-bottom: 6px;
        }

        .template-student
          .student-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 30px;
        }

        .template-student
          .skills-grid
          span {
          background: #f7effa;
          border-color: #e7c9ef;
        }

        /* ======================================================
           09 TWO COLUMN
        ====================================================== */

        .template-two-column {
          padding: 0;
        }

        .two-column-shell {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          min-height: 1120px;
        }

        .template-sidebar {
          background:
            linear-gradient(
              180deg,
              #211526,
              #120b17
            );
          color: white;
          padding: 45px 28px;
        }

        .sidebar-avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: #d946ef;
          display: grid;
          place-items: center;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .sidebar-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-avatar span {
          font-size: 30px;
          font-weight: 800;
        }

        .template-sidebar h2 {
          font-size: 24px;
          margin: 0;
        }

        .sidebar-role {
          color: #d9bfe0;
          font-size: 12px;
          line-height: 1.5;
        }

        .sidebar-block {
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-block b {
          font-size: 9px;
          letter-spacing: 0.16em;
          color: #e879f9;
          margin-bottom: 3px;
        }

        .sidebar-block span {
          font-size: 10px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .template-main {
          padding: 48px 42px;
        }

        .template-main
          .resume-section
          h3 {
          color: #7c1d91;
        }

        /* ======================================================
           10 ELEGANT
        ====================================================== */

        .template-elegant {
          font-family: Georgia,
            "Times New Roman", serif;
        }

        .template-elegant
          .elegant-header {
          text-align: center;
          padding: 58px 60px 35px;
        }

        .template-elegant
          .elegant-header
          .identity {
          display: block;
        }

        .template-elegant
          .elegant-header
          .identity
          h2 {
          font-size: 42px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .template-elegant
          .elegant-header
          .identity
          p {
          font-style: italic;
        }

        .template-elegant
          .elegant-header
          .contact-info {
          margin: 15px auto 0;
          align-items: center;
          text-align: center;
          flex-direction: row;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 100%;
          gap: 5px 14px;
        }

        .template-elegant
          .elegant-divider {
          width: 80%;
          height: 2px;
          background: #211b22;
          margin: 0 auto 35px;
        }

        .template-elegant
          .elegant-content {
          padding: 0 60px 60px;
        }

        .template-elegant
          .resume-section
          h3 {
          text-align: center;
          font-weight: 500;
          letter-spacing: 0.2em;
        }

        .template-elegant
          .skills-grid {
          justify-content: center;
        }

        .template-elegant
          .skills-grid
          span {
          border: 0;
          padding: 5px 9px;
          font-style: italic;
        }

        /* SIDE PANEL */

        .side-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .side-card {
          padding: 22px;
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(
            255,
            255,
            255,
            0.035
          );
        }

        .side-card h3 {
          margin: 10px 0;
          font-size: 18px;
        }

        .side-card p {
          color: #aaa1b0;
          font-size: 13px;
          line-height: 1.55;
        }

        .strength-score {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .strength-score strong {
          font-size: 48px;
        }

        .strength-score span {
          color: #8e8593;
        }

        .strength-bar {
          height: 7px;
          margin: 12px 0 16px;
          border-radius: 10px;
          overflow: hidden;
          background: #291d30;
        }

        .strength-bar div {
          height: 100%;
          background: #d946ef;
        }

        .keyword-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 12px;
        }

        .keyword-list span {
          border: 1px solid
            rgba(217, 70, 239, 0.25);
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          color: #e9d5ff;
          background: rgba(
            217,
            70,
            239,
            0.06
          );
        }

        .recommendations {
          margin: 12px 0 0;
          padding-left: 18px;
          color: #b8aebd;
          font-size: 13px;
          line-height: 1.6;
        }

        .recommendations li {
          margin-bottom: 10px;
        }

        .print-side-btn {
          width: 100%;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .resume-layout {
            grid-template-columns: 1fr;
          }

          .side-panel {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .professional-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .topbar {
            padding: 0 4%;
          }

          .back-btn {
            display: none;
          }

          .resume-container {
            width: 94%;
            padding-top: 35px;
          }

          .page-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .match-badge {
            width: 100%;
          }

          .resume-paper {
            min-height: auto;
          }

          .resume-inner {
            padding: 30px 22px !important;
          }

          .resume-header {
            flex-direction: column;
          }

          .contact-info {
            align-items: flex-start;
            text-align: left;
          }

          .side-panel {
            display: flex;
          }

          .two-column-shell {
            grid-template-columns: 1fr;
          }

          .template-sidebar {
            padding: 30px;
          }

          .template-main {
            padding: 30px 22px;
          }

          .professional-columns,
          .student-grid {
            grid-template-columns: 1fr;
          }

          .professional-side {
            border-left: 0 !important;
            border-top: 1px solid #ddd4e0;
            padding-left: 0 !important;
            padding-top: 25px;
          }

          .timeline-top {
            flex-direction: column;
            gap: 4px;
          }

          .timeline-date {
            white-space: normal;
          }

          .template-elegant
            .elegant-header {
            padding: 35px 22px 25px;
          }

          .template-elegant
            .elegant-content {
            padding: 0 22px 30px;
          }

          .template-executive
            .resume-inner {
            padding: 30px 22px !important;
          }

          .template-minimal
            .resume-inner {
            padding: 35px 22px !important;
          }

          .template-professional
            .professional-header {
            padding: 30px 22px;
          }

          .template-creative
            .creative-top {
            padding: 35px 22px;
          }

          .template-creative
            .creative-content {
            padding: 30px 22px;
          }

          .template-student
            .student-header {
            padding: 30px 22px;
          }

          .template-tech .resume-inner {
            padding: 25px 20px !important;
          }

          .template-modern .resume-inner {
            padding: 30px 22px !important;
          }

          .template-modern
            .identity
            h2 {
            font-size: 32px;
          }

          .template-creative
            .identity
            h2 {
            font-size: 34px;
          }

          .template-elegant
            .identity
            h2 {
            font-size: 32px;
          }
        }

        /* PRINT */

        @media print {
          body {
            margin: 0;
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .resume-page {
            background: white;
            color: #111;
            padding: 0;
          }

          .resume-container {
            width: 100%;
            padding: 0;
            margin: 0;
          }

          .resume-layout {
            display: block;
          }

          .resume-paper {
            box-shadow: none;
            border-radius: 0;
            width: 100%;
            min-height: auto;
            overflow: visible;
          }

          .resume-inner {
            min-height: auto;
          }

          .template-sidebar {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .creative-top,
          .student-header,
          .professional-header,
          .tech-header {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .resume-section {
            break-inside: avoid;
          }

          .timeline-item {
            break-inside: avoid;
          }

          .skills-grid {
            break-inside: avoid;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
      <CareerChatbot
        company={company}
        role={position}
        jobType={template}
        jobDescription={profile?.jobDescription}
        resumeText={profile?.resumeText}
        jobAnalysis={analysis}
      />
      </main>
    </AuthGuard>
  );
}
