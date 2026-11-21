"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CSSProperties } from "react";
import type { TargetMode } from "../../types/resume";
import AuthGuard from "@/components/auth/AuthGuard";
import PromotionSlot from "@/components/ads/PromotionSlot";

type TemplateId =
  | "classic"
  | "modern"
  | "executive"
  | "minimal"
  | "professional"
  | "tech"
  | "creative"
  | "student"
  | "two-column"
  | "elegant";

type Company = {
  name: string;
  logo: string;
  color: string;
};

type EducationItem = {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  grade: string;
};

type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type InternshipItem = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type ProjectItem = {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
};

type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
};

type ResumeTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
};

type ResumeProfilePayload = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  targetMode: TargetMode;
  templateId: TemplateId;
  selectedCompany: string;
  position: string;
  jobDescription: string;
  summary: string;
  experience: string;
  skills: string;
  softSkills: string;
  languages: string;
  resumeText: string;
  fileName: string;
  profileImage: string;
  education: EducationItem[];
  experienceItems: ExperienceItem[];
  internships: InternshipItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: string[];
  updatedAt: string;
};
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

const companies: Company[] = [
  { name: "Google", logo: "G", color: "#4285F4" },
  { name: "Microsoft", logo: "M", color: "#00A4EF" },
  { name: "Amazon", logo: "a", color: "#FF9900" },
  { name: "Meta", logo: "∞", color: "#1877F2" },
  { name: "TCS", logo: "tcs", color: "#E31C79" },
  { name: "Infosys", logo: "i", color: "#007CC3" },
  { name: "Accenture", logo: ">", color: "#A100FF" },
  { name: "Deloitte", logo: "D", color: "#86BC25" },
  { name: "Wipro", logo: "w", color: "#7F3F98" },
  { name: "Tech Mahindra", logo: "T", color: "#E31837" },
];

const suggestedSkills = [
  "React",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "Node.js",
  "REST APIs",
  "Git",
  "SQL",
];

const resumeTemplates: ResumeTemplate[] = [
  { id: "classic", name: "Classic", description: "Clean, traditional and ATS-friendly.", accent: "#a855f7" },
  { id: "modern", name: "Modern", description: "Minimal layout with strong visual hierarchy.", accent: "#c026d3" },
  { id: "executive", name: "Executive", description: "Premium structure for experienced professionals.", accent: "#7c3aed" },
  { id: "minimal", name: "Minimal", description: "Simple, clean and distraction-free.", accent: "#334155" },
  { id: "professional", name: "Professional", description: "Balanced structure for corporate applications.", accent: "#2563eb" },
  { id: "tech", name: "Tech", description: "Developer-focused layout for technical careers.", accent: "#22c55e" },
  { id: "creative", name: "Creative", description: "Modern visual style for creative professionals.", accent: "#f97316" },
  { id: "student", name: "Student", description: "Designed for students and freshers.", accent: "#06b6d4" },
  { id: "two-column", name: "Two Column", description: "Compact two-column professional layout.", accent: "#8b5cf6" },
  { id: "elegant", name: "Elegant", description: "Refined typography with a premium editorial feel.", accent: "#0f766e" },
];

const PROFILE_STORAGE_KEY = "resumeAI_profile";
const OPTIMIZE_STORAGE_KEY = "resumeAIData";
const DRAFT_STORAGE_KEY = "resumeAI_create_draft";

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyEducation = (): EducationItem => ({
  id: makeId(),
  degree: "",
  institution: "",
  startDate: "",
  endDate: "",
  grade: "",
});

const emptyExperience = (): ExperienceItem => ({
  id: makeId(),
  role: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});

const emptyInternship = (): InternshipItem => ({
  id: makeId(),
  role: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});

const emptyProject = (): ProjectItem => ({
  id: makeId(),
  name: "",
  technologies: "",
  link: "",
  description: "",
});

const emptyCertification = (): CertificationItem => ({
  id: makeId(),
  name: "",
  issuer: "",
  date: "",
  link: "",
});

function TemplateResumeCanvas({
  template,
  name,
  role,
  company,
  skills,
  image,
  compact = false,
}: {
  template: ResumeTemplate;
  name: string;
  role: string;
  company: string;
  skills: string[];
  image: string;
  compact?: boolean;
}) {
  const displayName = name.trim() || "PRIYANSHU CHOURE";
  const displayRole = role.trim() || "SOFTWARE ENGINEER";
  const displayCompany = company.trim() || "Target Company";
  const displaySkills = skills.length ? skills.slice(0, 5) : ["React", "JavaScript", "Git"];

  const line = (className = "") => <span className={`cv-line ${className}`} />;

  if (template.id === "two-column") {
    return (
      <div className={`cv-paper cv-${template.id} ${compact ? "cv-compact" : ""}`} style={{ "--cv-accent": template.accent } as CSSProperties}>
        <aside className="cv-side">
          {image ? <img src={image} alt="" className="cv-photo" /> : <span className="cv-photo-placeholder">AM</span>}
          <div className="cv-side-title">CONTACT</div>
          {line("short")}{line("tiny")}{line("medium")}
          <div className="cv-side-title">SKILLS</div>
          {displaySkills.slice(0, 4).map((skill) => <span className="cv-skill" key={skill}>{skill}</span>)}
          <div className="cv-side-title">EDUCATION</div>
          {line("medium")}{line("short")}
        </aside>
        <div className="cv-main">
          <h3>{displayName}</h3>
          <div className="cv-role">{displayRole}</div>
          <div className="cv-rule" />
          <div className="cv-heading">PROFILE</div>
          {line("long")}{line("long")}{line("medium")}
          <div className="cv-heading">EXPERIENCE</div>
          <strong className="cv-entry">{displayCompany}</strong>
          {line("long")}{line("medium")}{line("short")}
          <div className="cv-heading">PROJECTS</div>
          {line("long")}{line("medium")}{line("short")}
        </div>
      </div>
    );
  }

  return (
    <div className={`cv-paper cv-${template.id} ${compact ? "cv-compact" : ""}`} style={{ "--cv-accent": template.accent } as CSSProperties}>
      <header className="cv-header">
        <div>
          <h3>{displayName}</h3>
          <div className="cv-role">{displayRole}</div>
        </div>
        {template.id === "creative" && <span className="cv-creative-dot" />}
        {template.id === "student" && <span className="cv-badge">FRESHER</span>}
        {template.id === "executive" && <span className="cv-exec-mark" />}
        {template.id === "modern" && image && <img src={image} alt="" className="cv-photo" />}
      </header>

      {template.id !== "minimal" && <div className="cv-rule" />}

      <div className="cv-contact">{displayCompany} · {displayRole} · email@example.com · +91 00000 00000</div>

      <div className="cv-heading">PROFILE</div>
      {line("long")}{line("long")}{line("medium")}{line("short")}

      <div className="cv-heading">EXPERIENCE</div>
      <strong className="cv-entry">{displayCompany}</strong>
      {line("long")}{line("medium")}{line("medium")}{line("short")}

      <div className="cv-heading">SKILLS</div>
      <div className="cv-skill-row">
        {displaySkills.map((skill) => <span className="cv-skill" key={skill}>{skill}</span>)}
      </div>

      <div className="cv-heading">EDUCATION</div>
      {line("long")}{line("medium")}
    </div>
  );
}

function TemplateMiniPreview({
  template,
  active,
  name,
  role,
  company,
  skills,
  image,
}: {
  template: ResumeTemplate;
  active: boolean;
  name: string;
  role: string;
  company: string;
  skills: string[];
  image: string;
}) {
  return (
    <div className="template-preview-wrap">
      <TemplateResumeCanvas
        template={template}
        name={name}
        role={role}
        company={company}
        skills={skills}
        image={image}
        compact
      />
      {active && <span className="template-check">✓</span>}
    </div>
  );
}

export default function CreatePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [targetMode, setTargetMode] = useState<TargetMode>("specific");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [position, setPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [languages, setLanguages] = useState("");

  const [education, setEducation] = useState<EducationItem[]>([emptyEducation()]);
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([emptyProject()]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [achievementsText, setAchievementsText] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [jobAnalysisError, setJobAnalysisError] = useState("");
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const skillList = useMemo(
    () => skills.split(",").map((item) => item.trim()).filter(Boolean),
    [skills]
  );

  const softSkillList = useMemo(
    () => softSkills.split(",").map((item) => item.trim()).filter(Boolean),
    [softSkills]
  );

  const selectedTemplate = useMemo(
    () => resumeTemplates.find((item) => item.id === templateId) ?? resumeTemplates[0],
    [templateId]
  );

  const selectedCompanyData = useMemo(
    () => companies.find((item) => item.name === selectedCompany) ?? null,
    [selectedCompany]
  );

  const visibleCompanies = showAllCompanies ? companies : companies.slice(0, 6);
  const visibleTemplates = showAllTemplates ? resumeTemplates : resumeTemplates.slice(0, 6);

  const readiness = useMemo(() => {
    const checks = [
      Boolean(fullName.trim()),
      Boolean(email.trim()),
      targetMode === "general" || Boolean(selectedCompany.trim() || position.trim()),
      Boolean(summary.trim() || experience.trim() || resumeText.trim()),
      skillList.length > 0 || Boolean(resumeText.trim()),
      education.some((item) => item.degree.trim() || item.institution.trim()),
      projects.some((item) => item.name.trim() || item.description.trim()),
      internships.length > 0 || experienceItems.length > 0 || Boolean(experience.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [fullName, email, targetMode, selectedCompany, position, summary, experience, resumeText, skillList.length, education, projects, internships.length, experienceItems.length]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) {
        setIsDraftLoaded(true);
        return;
      }

      const draft = JSON.parse(saved) as Partial<ResumeProfilePayload>;
      setFullName(draft.fullName || "");
      setEmail(draft.email || "");
      setPhone(draft.phone || "");
      setLocation(draft.location || "");
      setLinkedin(draft.linkedin || "");
      setGithub(draft.github || "");
      setPortfolio(draft.portfolio || "");
      setTargetMode(draft.targetMode || "specific");
      setTemplateId(draft.templateId || "classic");
      setSelectedCompany(draft.selectedCompany || "");
      setPosition(draft.position || "");
      setJobDescription(draft.jobDescription || "");
      setSummary(draft.summary || "");
      setExperience(draft.experience || "");
      setSkills(draft.skills || "");
      setSoftSkills(draft.softSkills || "");
      setLanguages(draft.languages || "");
      setResumeText(draft.resumeText || "");
      setFileName(draft.fileName || "");
      setProfileImage(draft.profileImage || "");
      setEducation(draft.education?.length ? draft.education : [emptyEducation()]);
      setExperienceItems(draft.experienceItems || []);
      setInternships(draft.internships || []);
      setProjects(draft.projects?.length ? draft.projects : [emptyProject()]);
      setCertifications(draft.certifications || []);
      setAchievementsText((draft.achievements || []).join("\n"));
    } catch {
      console.warn("Unable to restore ResumeAI draft.");
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) return;
    const timer = window.setTimeout(() => {
      try {
        const draft: ResumeProfilePayload = {
          fullName,
          email,
          phone,
          linkedin,
          github,
          portfolio,
          location,
          targetMode,
          templateId,
          selectedCompany,
          position,
          jobDescription,
          summary,
          experience,
          skills,
          softSkills,
          languages,
          resumeText,
          fileName,
          profileImage,
          education,
          experienceItems,
          internships,
          projects,
          certifications,
          achievements: achievementsText.split("\n").map((item) => item.trim()).filter(Boolean),
          updatedAt: new Date().toISOString(),
        };
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        console.warn("Unable to save ResumeAI draft.");
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    isDraftLoaded,
    fullName,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    location,
    targetMode,
    templateId,
    selectedCompany,
    position,
    jobDescription,
    summary,
    experience,
    skills,
    softSkills,
    languages,
    resumeText,
    fileName,
    profileImage,
    education,
    experienceItems,
    internships,
    projects,
    certifications,
    achievementsText,
  ]);

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const addSkill = (skill: string) => {
    if (skillList.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    setSkills((current) => current.trim() ? `${current}, ${skill}` : skill);
    clearError("skills");
  };

  const removeSkill = (skill: string) => {
    setSkills(skillList.filter((item) => item.toLowerCase() !== skill.toLowerCase()).join(", "));
  };

  const updateEducation = (id: string, key: keyof EducationItem, value: string) => {
    setEducation((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const updateExperienceItem = (id: string, key: keyof ExperienceItem, value: string) => {
    setExperienceItems((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const updateInternship = (id: string, key: keyof InternshipItem, value: string) => {
    setInternships((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const updateProject = (id: string, key: keyof ProjectItem, value: string) => {
    setProjects((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const updateCertification = (id: string, key: keyof CertificationItem, value: string) => {
    setCertifications((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const handleTargetModeChange = (mode: TargetMode) => {
    setTargetMode(mode);
    clearError("company");
    clearError("position");
  };
  /* ---------------------------------------------------------
   JOB / INTERNSHIP ANALYZER
--------------------------------------------------------- */

  const handleAnalyzeJob = async () => {
    setJobAnalysisError("");

    if (targetMode === "general") {
      setJobAnalysisError(
        "Job analysis is available for specific jobs and internships."
      );
      return;
    }

    if (!selectedCompany.trim() && !position.trim() && !jobDescription.trim()) {
      setJobAnalysisError(
        "Please provide a company, position, or job description first."
      );
      return;
    }

    setIsAnalyzingJob(true);

    try {
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: selectedCompany.trim(),
          role: position.trim(),
          jobType:
            targetMode === "internship"
              ? "internship"
              : "job",
          jobDescription: jobDescription.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error ||
          "Unable to analyze this opportunity right now."
        );
      }

      if (!result.analysis) {
        throw new Error(
          "The AI returned an empty job analysis."
        );
      }

      setJobAnalysis(result.analysis);

      // Save the real analysis so Optimize/Chatbot can
      // use the same information later.
      try {
        sessionStorage.setItem(
          "resumeAI_job_analysis",
          JSON.stringify(result.analysis)
        );
      } catch {
        console.warn(
          "Unable to save job analysis."
        );
      }
    } catch (error) {
      console.error(
        "CREATE_JOB_ANALYSIS_ERROR:",
        error
      );

      setJobAnalysis(null);

      setJobAnalysisError(
        error instanceof Error
          ? error.message
          : "Unable to analyze this opportunity."
      );
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  const handleResume = async (file?: File) => {
    if (!file) return;
    const extension = file.name.toLowerCase().split(".").pop();
    if (!extension || !["pdf", "docx"].includes(extension)) {
      setErrors((current) => ({ ...current, resume: "Please upload a PDF or DOCX file." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, resume: "File size must be under 10MB." }));
      return;
    }

    setIsExtractingResume(true);
    clearError("resume");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/extract-resume", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Unable to read this resume.");
      const text = typeof result?.text === "string" ? result.text.trim() : "";
      if (!text) throw new Error("No readable text was found in this resume.");
      setFileName(file.name);
      setResumeText(text);
      clearError("experience");
      clearError("skills");
    } catch (error) {
      setFileName("");
      setResumeText("");
      setErrors((current) => ({
        ...current,
        resume: error instanceof Error ? error.message : "Unable to read this resume.",
      }));
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleResumeInput = (event: ChangeEvent<HTMLInputElement>) => {
    void handleResume(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleResumeDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingResume(false);
    void handleResume(event.dataTransfer.files?.[0]);
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, image: "Please select a valid image." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, image: "Image size must be under 5MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(String(reader.result));
      clearError("image");
    };
    reader.onerror = () => setErrors((current) => ({ ...current, image: "Unable to read this image." }));
    reader.readAsDataURL(file);
  };

  const handleImageInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleImage(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleImageDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    handleImage(event.dataTransfer.files?.[0]);
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Please enter your full name.";
    if (!email.trim()) next.email = "Please enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Please enter a valid email address.";
    if (targetMode === "specific" && !selectedCompany.trim()) next.company = "Select a company or enter a company name.";
    if (targetMode === "specific" && !position.trim()) next.position = "Please enter the target position.";
    if (!experience.trim() && !resumeText.trim() && experienceItems.length === 0) next.experience = "Add experience or upload an existing resume.";
    if (!skills.trim() && !resumeText.trim()) next.skills = "Add at least a few relevant skills.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (): ResumeProfilePayload => ({
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    linkedin: linkedin.trim(),
    github: github.trim(),
    portfolio: portfolio.trim(),
    location: location.trim(),
    targetMode,
    templateId,
    selectedCompany: selectedCompany.trim(),
    position: position.trim(),
    jobDescription: jobDescription.trim(),
    summary: summary.trim(),
    experience: experience.trim(),
    skills: skillList.join(", "),
    softSkills: softSkillList.join(", "),
    languages: languages.trim(),
    resumeText: resumeText.trim(),
    fileName,
    profileImage,
    education,
    experienceItems,
    internships,
    projects,
    certifications,
    achievements: achievementsText.split("\n").map((item) => item.trim()).filter(Boolean),
    updatedAt: new Date().toISOString(),
  });

  const validateAndContinue = () => {
    if (!validateForm()) {
      window.setTimeout(() => {
        document.querySelector(".field-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setIsGenerating(true);
    const payload = buildPayload();
    const serialized = JSON.stringify(payload);

    try {
      sessionStorage.setItem(PROFILE_STORAGE_KEY, serialized);
      sessionStorage.setItem(OPTIMIZE_STORAGE_KEY, serialized);
      sessionStorage.setItem("RESUME_AI_PROFILE", serialized);
      sessionStorage.setItem("resumeProfile", serialized);
      sessionStorage.setItem(DRAFT_STORAGE_KEY, serialized);
    } catch {
      console.warn("Unable to save ResumeAI profile.");
    }

    window.setTimeout(() => {
      window.location.href = "/create/optimize";
    }, 450);
  };

  const handleSaveExit = () => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(buildPayload()));
    } catch {
      console.warn("Unable to save ResumeAI draft.");
    }
    window.location.href = "/";
  };

  const companyStyle = (company: Company): CSSProperties => ({
    "--company-color": company.color,
  } as CSSProperties);

  const removeEducation = (id: string) => setEducation((items) => items.length === 1 ? items : items.filter((item) => item.id !== id));
  const removeExperience = (id: string) => setExperienceItems((items) => items.filter((item) => item.id !== id));
  const removeInternship = (id: string) => setInternships((items) => items.filter((item) => item.id !== id));
  const removeProject = (id: string) => setProjects((items) => items.length === 1 ? items : items.filter((item) => item.id !== id));
  const removeCertification = (id: string) => setCertifications((items) => items.filter((item) => item.id !== id));

  return (
    <AuthGuard fallbackMessage="Please sign in to build your tailored resume and generate AI job analysis.">
      <main className="create-page">
      <header className="create-header">
        <a href="/" className="brand">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>Resume<span className="brand-accent">AI</span></span>
        </a>

        <div className="progress">
          <div className="progress-item active"><b>01</b><span>Build profile</span></div>
          <div className="progress-line active" />
          <div className="progress-item"><b>02</b><span>AI optimization</span></div>
          <div className="progress-line" />
          <div className="progress-item"><b>03</b><span>Final resume</span></div>
        </div>

        <button type="button" className="save-exit" onClick={handleSaveExit}>Save & Exit</button>
      </header>

      <div className="page-shell">
        <section className="intro">
          <div className="eyebrow"><span /> RESUME BUILDER</div>
          <h1>Build a resume <strong>for the opportunity you want.</strong></h1>
          <p>Tell ResumeAI about your target job or internship and your real experience. Gemini will use this information later to analyze the opportunity and tailor your resume without inventing qualifications.</p>
          <div className="intro-pills"><span>✓ ATS focused</span><span>✦ Gemini powered</span><span>⚡ Job & internship ready</span></div>
        </section>

        <div className="layout">
          <div className="main-column">
            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 01</span><h2>Target opportunity</h2><p>Tell us what you are applying for.</p></div><span className="section-number">01</span></div>

              <div className="mode-grid">
                {([
                  ["specific", "⌁", "Specific job", "Company + position specific resume"],
                  ["internship", "↗", "Internship", "Internship, trainee or fresher application"],
                  ["general", "✦", "General resume", "No target company or role required"],
                ] as const).map(([id, icon, title, text]) => (
                  <button key={id} type="button" className={`mode-card ${targetMode === id ? "selected" : ""}`} onClick={() => handleTargetModeChange(id)}>
                    <span className="mode-icon">{icon}</span><span><strong>{title}</strong><small>{text}</small></span>{targetMode === id && <b>✓</b>}
                  </button>
                ))}
              </div>

              {targetMode !== "general" && (
                <>
                  <div className="subhead"><strong>{targetMode === "internship" ? "Internship target" : "Job target"}</strong><span>Use the exact role title when possible.</span></div>
                  <div className="company-grid">
                    {visibleCompanies.map((company) => (
                      <button key={company.name} type="button" className={`company-card ${selectedCompany === company.name ? "selected" : ""}`} style={companyStyle(company)} onClick={() => { setSelectedCompany(company.name); clearError("company"); }}>
                        <span className="company-logo">{company.logo}</span><span><strong>{company.name}</strong><small>{selectedCompany === company.name ? "Selected" : "Use company"}</small></span>{selectedCompany === company.name && <b>✓</b>}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="text-button" onClick={() => setShowAllCompanies((value) => !value)}>{showAllCompanies ? "Show fewer companies ↑" : "View more companies ↓"}</button>

                  <div className="field">
                    <label htmlFor="company">Company <em>{targetMode === "specific" ? "Required" : "Optional"}</em></label>
                    <input id="company" value={selectedCompany} onChange={(event) => { setSelectedCompany(event.target.value); clearError("company"); }} placeholder="e.g. TCS, Google, a startup or any organization" />
                    {errors.company && <div className="field-error">{errors.company}</div>}
                  </div>

                  <div className="field">
                    <label htmlFor="position">{targetMode === "internship" ? "Internship position" : "Target position"} <em>{targetMode === "specific" ? "Required" : "Optional"}</em></label>
                    <input id="position" value={position} onChange={(event) => { setPosition(event.target.value); clearError("position"); }} placeholder={targetMode === "internship" ? "e.g. Software Engineering Intern" : "e.g. Frontend Developer"} />
                    {errors.position && <div className="field-error">{errors.position}</div>}
                  </div>

                  {targetMode === "specific" && (
                    <div className="field"><label htmlFor="job-description">Job description <em>Recommended</em></label><textarea id="job-description" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} rows={6} placeholder="Paste the job description here. Gemini will later use it to identify required skills, ATS keywords and role expectations." /><div className="field-meta"><span>{jobDescription.length} characters</span><span>More context gives better analysis.</span></div></div>

                  )}

                  <div className="job-analyzer-box">
                    <div className="job-analyzer-copy">
                      <div className="job-analyzer-icon">✦</div>

                      <div>
                        <strong>
                          Analyze this opportunity with AI
                        </strong>

                        <p>
                          ResumeAI will identify the skills,
                          keywords, responsibilities and
                          preparation areas relevant to this
                          opportunity.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="job-analyze-button"
                      onClick={handleAnalyzeJob}
                      disabled={isAnalyzingJob}
                    >
                      {isAnalyzingJob ? (
                        <>
                          <span className="analyze-spinner" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze with AI
                          <span>→</span>
                        </>
                      )}
                    </button>

                    {jobAnalysisError && (
                      <div className="job-analysis-error">
                        {jobAnalysisError}
                      </div>
                    )}
                  </div>

                  {jobAnalysis && (
  <div className="job-analysis-result">
    <div className="job-analysis-header">
      <div>
        <span className="analysis-eyebrow">
          RESUMEAI ANALYSIS
        </span>

        <h3>
          {jobAnalysis.company || selectedCompany || "Target opportunity"}
        </h3>

        <p>
          {jobAnalysis.role ||
            position ||
            "Target role"}
        </p>
      </div>

      <span className="analysis-status">
        ✓ Analyzed
      </span>
    </div>

    {jobAnalysis.summary && (
      <div className="analysis-summary">
        <strong>Role overview</strong>
        <p>{jobAnalysis.summary}</p>
      </div>
    )}

    <div className="analysis-grid">
      <div className="analysis-section">
        <span className="analysis-section-title">
          REQUIRED SKILLS
        </span>

        <div className="analysis-tags">
          {jobAnalysis.requiredSkills.map(
            (skill) => (
              <span key={skill}>
                {skill}
              </span>
            )
          )}
        </div>
      </div>

      <div className="analysis-section">
        <span className="analysis-section-title">
          PREFERRED SKILLS
        </span>

        <div className="analysis-tags muted">
          {jobAnalysis.preferredSkills.map(
            (skill) => (
              <span key={skill}>
                {skill}
              </span>
            )
          )}
        </div>
      </div>

      <div className="analysis-section">
        <span className="analysis-section-title">
          TECHNICAL SKILLS
        </span>

        <div className="analysis-tags">
          {jobAnalysis.technicalSkills.map(
            (skill) => (
              <span key={skill}>
                {skill}
              </span>
            )
          )}
        </div>
      </div>

      <div className="analysis-section">
        <span className="analysis-section-title">
          SOFT SKILLS
        </span>

        <div className="analysis-tags muted">
          {jobAnalysis.softSkills.map(
            (skill) => (
              <span key={skill}>
                {skill}
              </span>
            )
          )}
        </div>
      </div>
    </div>

    {jobAnalysis.keywords.length > 0 && (
      <div className="analysis-section full">
        <span className="analysis-section-title">
          ATS KEYWORDS
        </span>

        <div className="analysis-tags keyword-tags">
          {jobAnalysis.keywords.map(
            (keyword) => (
              <span key={keyword}>
                {keyword}
              </span>
            )
          )}
        </div>
      </div>
    )}

    {jobAnalysis.skillGapGuidance.length > 0 && (
      <div className="analysis-guidance">
        <div className="guidance-icon">⚡</div>

        <div>
          <strong>
            Skill preparation
          </strong>

          <ul>
            {jobAnalysis.skillGapGuidance.map(
              (item) => (
                <li key={item}>{item}</li>
              )
            )}
          </ul>
        </div>
      </div>
    )}

    {jobAnalysis.learningRoadmap.length > 0 && (
      <div className="analysis-roadmap">
        <div className="analysis-section-title">
          LEARNING ROADMAP
        </div>

        <div className="roadmap-list">
          {jobAnalysis.learningRoadmap.map(
            (step, index) => (
              <div
                className="roadmap-item"
                key={`${index}-${step}`}
              >
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            )
          )}
        </div>
      </div>
    )}

    <button
      type="button"
      className="reanalyze-button"
      onClick={handleAnalyzeJob}
      disabled={isAnalyzingJob}
    >
      {isAnalyzingJob
        ? "Analyzing..."
        : "↻ Analyze again"}
    </button>
  </div>
)}

                 

                </>
              )}
              

              {targetMode === "general" && <div className="info-box"><span>✦</span><div><strong>General resume mode</strong><p>Your resume will focus on your real profile, transferable skills, projects and ATS-friendly structure.</p></div></div>}
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 02</span><h2>Your profile</h2><p>These details become the foundation of your resume.</p></div><span className="section-number">02</span></div>

              <div className="form-grid two">
                <div className="field"><label htmlFor="full-name">Full name <b>*</b></label><input id="full-name" value={fullName} onChange={(event) => { setFullName(event.target.value); clearError("fullName"); }} placeholder="e.g. PRIYANSHU CHOURE" autoComplete="name" />{errors.fullName && <div className="field-error">{errors.fullName}</div>}</div>
                <div className="field"><label htmlFor="email">Email <b>*</b></label><input id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearError("email"); }} placeholder="you@example.com" autoComplete="email" />{errors.email && <div className="field-error">{errors.email}</div>}</div>
                <div className="field"><label htmlFor="phone">Phone <em>Optional</em></label><input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" autoComplete="tel" /></div>
                <div className="field"><label htmlFor="location">Location <em>Optional</em></label><input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Bhopal, Madhya Pradesh" /></div>
                <div className="field"><label htmlFor="linkedin">LinkedIn <em>Optional</em></label><input id="linkedin" value={linkedin} onChange={(event) => setLinkedin(event.target.value)} placeholder="linkedin.com/in/yourname" /></div>
                <div className="field"><label htmlFor="github">GitHub <em>Optional</em></label><input id="github" value={github} onChange={(event) => setGithub(event.target.value)} placeholder="github.com/yourname" /></div>
                <div className="field full"><label htmlFor="portfolio">Portfolio / website <em>Optional</em></label><input id="portfolio" value={portfolio} onChange={(event) => setPortfolio(event.target.value)} placeholder="yourportfolio.com" /></div>
              </div>

              <div className="divider" />

              <div className="upload-row">
                <div><label>Profile photo</label><p>Optional. Only templates that support a photo will show it in the final design.</p></div>
                <label className={`photo-drop ${isDraggingImage ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }} onDragLeave={() => setIsDraggingImage(false)} onDrop={handleImageDrop}>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageInput} />
                  {profileImage ? <img src={profileImage} alt="Profile preview" /> : <span>+<small>Add photo</small></span>}
                </label>
                {profileImage && <button type="button" className="remove-small" onClick={() => setProfileImage("")}>Remove</button>}
              </div>
              {errors.image && <div className="field-error">{errors.image}</div>}
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 03</span><h2>Experience & skills</h2><p>Add your real experience. We will not invent qualifications.</p></div><span className="section-number">03</span></div>

              <div className="field"><label htmlFor="summary">Professional summary <em>Optional</em></label><textarea id="summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} placeholder="A short summary of your background, strengths and career direction." /></div>
              <div className="field"><label htmlFor="experience">Experience overview <em>Optional if structured experience is added or resume uploaded</em></label><textarea id="experience" value={experience} onChange={(event) => { setExperience(event.target.value); clearError("experience"); }} rows={5} placeholder="Example: Built React and Next.js dashboards, integrated REST APIs, improved page performance..." />{errors.experience && <div className="field-error">{errors.experience}</div>}</div>

              <div className="field"><label htmlFor="skills">Technical skills <em>Separate with commas</em></label><input id="skills" value={skills} onChange={(event) => { setSkills(event.target.value); clearError("skills"); }} placeholder="React, JavaScript, TypeScript, Next.js, Node.js..." />{skillList.length > 0 && <div className="chips">{skillList.map((skill) => <button type="button" key={skill} onClick={() => removeSkill(skill)}>{skill}<span>×</span></button>)}</div>}{errors.skills && <div className="field-error">{errors.skills}</div>}<div className="suggested"><span>Suggested</span>{suggestedSkills.map((skill) => <button type="button" key={skill} onClick={() => addSkill(skill)}>{skillList.some((item) => item.toLowerCase() === skill.toLowerCase()) ? "✓" : "+"} {skill}</button>)}</div></div>
              <div className="form-grid two"><div className="field"><label htmlFor="soft-skills">Soft skills <em>Optional</em></label><input id="soft-skills" value={softSkills} onChange={(event) => setSoftSkills(event.target.value)} placeholder="Communication, leadership, teamwork" /></div><div className="field"><label htmlFor="languages">Languages <em>Optional</em></label><input id="languages" value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="English, Hindi" /></div></div>
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 04</span><h2>Education</h2><p>Add your academic background.</p></div><span className="section-number">04</span></div>
              <div className="repeat-list">
                {education.map((item, index) => <div className="repeat-item" key={item.id}><div className="repeat-title"><strong>Education {index + 1}</strong>{education.length > 1 && <button type="button" onClick={() => removeEducation(item.id)}>Remove</button>}</div><div className="form-grid two"><div className="field"><label>Degree / course</label><input value={item.degree} onChange={(event) => updateEducation(item.id, "degree", event.target.value)} placeholder="B.Tech Computer Science" /></div><div className="field"><label>Institution</label><input value={item.institution} onChange={(event) => updateEducation(item.id, "institution", event.target.value)} placeholder="University / College" /></div><div className="field"><label>Start date</label><input value={item.startDate} onChange={(event) => updateEducation(item.id, "startDate", event.target.value)} placeholder="2022" /></div><div className="field"><label>End date</label><input value={item.endDate} onChange={(event) => updateEducation(item.id, "endDate", event.target.value)} placeholder="2026" /></div><div className="field full"><label>CGPA / percentage</label><input value={item.grade} onChange={(event) => updateEducation(item.id, "grade", event.target.value)} placeholder="8.2 CGPA" /></div></div></div>)}
              </div>
              <button type="button" className="add-button" onClick={() => setEducation((items) => [...items, emptyEducation()])}>+ Add education</button>
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 05</span><h2>Work experience</h2><p>Optional for students and freshers.</p></div><span className="section-number">05</span></div>
              {experienceItems.length === 0 && <div className="empty-repeat">No structured experience added yet. You can add it or use the experience overview above.</div>}
              <div className="repeat-list">{experienceItems.map((item, index) => <div className="repeat-item" key={item.id}><div className="repeat-title"><strong>Experience {index + 1}</strong><button type="button" onClick={() => removeExperience(item.id)}>Remove</button></div><div className="form-grid two"><div className="field"><label>Role</label><input value={item.role} onChange={(event) => updateExperienceItem(item.id, "role", event.target.value)} placeholder="Software Engineer" /></div><div className="field"><label>Company</label><input value={item.company} onChange={(event) => updateExperienceItem(item.id, "company", event.target.value)} placeholder="Company name" /></div><div className="field"><label>Start date</label><input value={item.startDate} onChange={(event) => updateExperienceItem(item.id, "startDate", event.target.value)} placeholder="Jun 2024" /></div><div className="field"><label>End date</label><input value={item.endDate} onChange={(event) => updateExperienceItem(item.id, "endDate", event.target.value)} placeholder="Present" /></div><div className="field full"><label>What did you do?</label><textarea value={item.description} onChange={(event) => updateExperienceItem(item.id, "description", event.target.value)} rows={4} placeholder="Responsibilities, impact, measurable results..." /></div></div></div>)}</div>
              <button type="button" className="add-button" onClick={() => setExperienceItems((items) => [...items, emptyExperience()])}>+ Add work experience</button>
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 06</span><h2>Internships</h2><p>Important for fresher and internship applications.</p></div><span className="section-number">06</span></div>
              {internships.length === 0 && <div className="empty-repeat">No internship added. Add internships if you have them.</div>}
              <div className="repeat-list">{internships.map((item, index) => <div className="repeat-item" key={item.id}><div className="repeat-title"><strong>Internship {index + 1}</strong><button type="button" onClick={() => removeInternship(item.id)}>Remove</button></div><div className="form-grid two"><div className="field"><label>Role</label><input value={item.role} onChange={(event) => updateInternship(item.id, "role", event.target.value)} placeholder="Frontend Developer Intern" /></div><div className="field"><label>Company</label><input value={item.company} onChange={(event) => updateInternship(item.id, "company", event.target.value)} placeholder="Company / startup" /></div><div className="field"><label>Start date</label><input value={item.startDate} onChange={(event) => updateInternship(item.id, "startDate", event.target.value)} placeholder="May 2025" /></div><div className="field"><label>End date</label><input value={item.endDate} onChange={(event) => updateInternship(item.id, "endDate", event.target.value)} placeholder="Jul 2025" /></div><div className="field full"><label>What did you learn or build?</label><textarea value={item.description} onChange={(event) => updateInternship(item.id, "description", event.target.value)} rows={4} placeholder="Work performed, technologies used, results..." /></div></div></div>)}</div>
              <button type="button" className="add-button" onClick={() => setInternships((items) => [...items, emptyInternship()])}>+ Add internship</button>
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 07</span><h2>Projects</h2><p>Projects help Gemini understand what you can actually build.</p></div><span className="section-number">07</span></div>
              <div className="repeat-list">{projects.map((item, index) => <div className="repeat-item" key={item.id}><div className="repeat-title"><strong>Project {index + 1}</strong>{projects.length > 1 && <button type="button" onClick={() => removeProject(item.id)}>Remove</button>}</div><div className="form-grid two"><div className="field"><label>Project name</label><input value={item.name} onChange={(event) => updateProject(item.id, "name", event.target.value)} placeholder="ResumeAI" /></div><div className="field"><label>Technologies</label><input value={item.technologies} onChange={(event) => updateProject(item.id, "technologies", event.target.value)} placeholder="Next.js, TypeScript, Gemini API" /></div><div className="field full"><label>Project link</label><input value={item.link} onChange={(event) => updateProject(item.id, "link", event.target.value)} placeholder="https://github.com/..." /></div><div className="field full"><label>Description</label><textarea value={item.description} onChange={(event) => updateProject(item.id, "description", event.target.value)} rows={4} placeholder="What did you build? What problem did it solve?" /></div></div></div>)}</div>
              <button type="button" className="add-button" onClick={() => setProjects((items) => [...items, emptyProject()])}>+ Add project</button>
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 08</span><h2>Certifications & achievements</h2><p>Add verified achievements only.</p></div><span className="section-number">08</span></div>
              <div className="repeat-list">{certifications.map((item, index) => <div className="repeat-item" key={item.id}><div className="repeat-title"><strong>Certification {index + 1}</strong><button type="button" onClick={() => removeCertification(item.id)}>Remove</button></div><div className="form-grid two"><div className="field"><label>Certification</label><input value={item.name} onChange={(event) => updateCertification(item.id, "name", event.target.value)} placeholder="AWS Cloud Practitioner" /></div><div className="field"><label>Issuer</label><input value={item.issuer} onChange={(event) => updateCertification(item.id, "issuer", event.target.value)} placeholder="Amazon Web Services" /></div><div className="field"><label>Date</label><input value={item.date} onChange={(event) => updateCertification(item.id, "date", event.target.value)} placeholder="2026" /></div><div className="field"><label>Credential link</label><input value={item.link} onChange={(event) => updateCertification(item.id, "link", event.target.value)} placeholder="https://..." /></div></div></div>)}</div>
              <button type="button" className="add-button" onClick={() => setCertifications((items) => [...items, emptyCertification()])}>+ Add certification</button>
              <div className="field achievement-field"><label htmlFor="achievements">Achievements <em>One per line</em></label><textarea id="achievements" value={achievementsText} onChange={(event) => setAchievementsText(event.target.value)} rows={5} placeholder="Won college hackathon\nBuilt a project used by 100+ users\nSolved 200+ coding problems" /></div>
            </section>

            <section className="card">
              <div className="section-head"><div><span className="section-kicker">STEP 09</span><h2>Existing resume</h2><p>Already have a resume? Upload it so we can extract the real content.</p></div><span className="section-number">09</span></div>
              <label className={`resume-drop ${isDraggingResume ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setIsDraggingResume(true); }} onDragLeave={() => setIsDraggingResume(false)} onDrop={handleResumeDrop}>
                <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeInput} />
                <span className="upload-icon">{isExtractingResume ? "…" : fileName ? "✓" : "↑"}</span>
                <strong>{isExtractingResume ? "Reading your resume..." : fileName ? fileName : "Upload PDF, DOCX or TXT"}</strong>
                <small>{isExtractingResume ? "Extracting text from the uploaded file." : fileName ? "Resume content extracted successfully. Click to replace." : "Drag & drop or click to browse · Maximum 10MB"}</small>
              </label>
              {fileName && <button type="button" className="remove-file" onClick={() => { setFileName(""); setResumeText(""); }}>Remove uploaded resume</button>}
              {errors.resume && <div className="field-error">{errors.resume}</div>}
              {resumeText && !errors.resume && <div className="success-note">✓ {resumeText.length.toLocaleString()} characters extracted from your resume.</div>}
            </section>

            <section className="card template-card-section">
              <div className="section-head"><div><span className="section-kicker">STEP 10</span><h2>Choose your resume template</h2><p>Every card below is a real mini representation of the resume structure. The selected template is saved with your profile for the final resume.</p></div><span className="selected-template-label">✓ {selectedTemplate.name}</span></div>

              <div className="template-grid">
                {visibleTemplates.map((template) => {
                  const active = template.id === templateId;
                  return (
                    <button key={template.id} type="button" className={`template-card ${active ? "selected" : ""}`} onClick={() => setTemplateId(template.id)} aria-pressed={active}>
                      <TemplateMiniPreview template={template} active={active} name={fullName} role={position} company={selectedCompany} skills={skillList} image={profileImage} />
                      <div className="template-info"><div><strong>{template.name}</strong><span>{template.description}</span></div><em>{active ? "Selected" : "Preview"}</em></div>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="text-button" onClick={() => setShowAllTemplates((value) => !value)}>{showAllTemplates ? "Show fewer templates ↑" : `Show all ${resumeTemplates.length} templates ↓`}</button>
            </section>

            <button type="button" className="continue-button" disabled={isGenerating || isExtractingResume} onClick={validateAndContinue}><span>{isExtractingResume ? "Reading resume..." : isGenerating ? "Preparing your profile..." : "Continue to AI optimization"}</span><b>{isGenerating ? "•••" : "→"}</b></button>
            <div className="privacy-note">🔒 Your information is saved locally for this resume flow. Gemini analysis will happen through the server-side API in the next step.</div>
          </div>

          <aside className="sidebar">
            <div className="sticky">
              <div className="side-card target-summary">
                <div className="side-label">YOUR TARGET</div>
                <div className="target-mode">{targetMode === "specific" ? "SPECIFIC JOB" : targetMode === "internship" ? "INTERNSHIP" : "GENERAL RESUME"}</div>
                <h3>{selectedCompany || (targetMode === "general" ? "No company required" : "Choose a company")}</h3>
                <p>{position || (targetMode === "general" ? "No specific position" : "Choose a target position")}</p>
              </div>

              <div className="side-card readiness-card">
                <div className="readiness-top"><div><span>PROFILE READINESS</span><strong>{readiness}%</strong></div><div className="ring" style={{ "--progress": `${readiness * 3.6}deg` } as CSSProperties}><span>{readiness}</span></div></div>
                <div className="readiness-bar"><i style={{ width: `${readiness}%` }} /></div>
                <p>{readiness >= 80 ? "Your profile has enough information to move into AI analysis." : "Add more real information to give Gemini better context."}</p>
              </div>

              <div className="side-card preview-card">
                <div className="preview-head"><div><span>LIVE TEMPLATE PREVIEW</span><small>{selectedTemplate.name}</small></div><b>LIVE</b></div>
                <TemplateResumeCanvas template={selectedTemplate} name={fullName} role={position} company={selectedCompany} skills={skillList} image={profileImage} />
              </div>

              <div className="side-card roadmap-card">
                <div className="side-label">WHAT HAPPENS NEXT</div>
                <div className="roadmap-step active"><span>01</span><div><strong>Your data</strong><small>Profile + target opportunity</small></div></div>
                <div className="roadmap-step"><span>02</span><div><strong>Gemini analysis</strong><small>Skills, ATS keywords, gaps & recommendations</small></div></div>
                <div className="roadmap-step"><span>03</span><div><strong>Tailored resume</strong><small>Real content in your selected template</small></div></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .create-page { min-height:100vh; background:#09070d; color:#f8f5fb; font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        .create-header { height:78px; position:sticky; top:0; z-index:30; display:flex; align-items:center; justify-content:space-between; gap:30px; padding:0 4vw; background:rgba(9,7,13,.88); backdrop-filter:blur(18px); border-bottom:1px solid rgba(255,255,255,.07); }
        .brand { display:flex; align-items:center; gap:10px; color:#fff; text-decoration:none; font-size:18px; font-weight:900; letter-spacing:-.04em; white-space:nowrap; }
        .brand-accent { color:#d946ef; }
        .brand-mark { width:26px; height:26px; display:grid; grid-template-columns:repeat(3,1fr); align-items:end; gap:3px; padding:5px; border-radius:8px; background:linear-gradient(135deg,#7c3aed,#d946ef); }
        .brand-mark i { display:block; background:#fff; border-radius:3px; height:55%; }.brand-mark i:nth-child(2){height:80%}.brand-mark i:nth-child(3){height:100%}
        .progress { display:flex; align-items:center; justify-content:center; flex:1; max-width:720px; }.progress-item{display:flex; align-items:center; gap:8px; color:#5e5865;}.progress-item b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.1);font-size:9px}.progress-item span{font-size:9px;font-weight:700}.progress-item.active{color:#ddd6e5}.progress-item.active b{border-color:#c026d3;background:rgba(192,38,211,.13);color:#f0abfc}.progress-line{width:70px;height:1px;background:rgba(255,255,255,.08);margin:0 13px}.progress-line.active{background:linear-gradient(90deg,#7c3aed,#c026d3)}
        .save-exit,.text-button,.add-button,.remove-small,.remove-file{border:0;background:transparent;color:#aaa2af;cursor:pointer;font-weight:700}.save-exit{padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#d4ceda;font-size:10px}.save-exit:hover,.text-button:hover{color:#e879f9}
        .page-shell{width:min(1420px,92vw);margin:0 auto;padding:55px 0 80px}.intro{max-width:900px;margin-bottom:35px}.eyebrow,.section-kicker,.side-label{color:#a855f7;font-size:9px;font-weight:900;letter-spacing:.16em}.eyebrow{display:flex;align-items:center;gap:7px}.eyebrow span{width:6px;height:6px;border-radius:50%;background:#d946ef;box-shadow:0 0 14px #d946ef}.intro h1{margin:14px 0 12px;font-size:clamp(34px,4vw,58px);line-height:1;letter-spacing:-.055em}.intro h1 strong{display:block;background:linear-gradient(90deg,#fff,#d8b4fe);background-clip:text;-webkit-background-clip:text;color:transparent}.intro>p{max-width:760px;color:#8c8592;font-size:13px;line-height:1.75;margin:0}.intro-pills{display:flex;gap:9px;flex-wrap:wrap;margin-top:20px}.intro-pills span{padding:7px 10px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.025);color:#9e97a5;font-size:8px}
        .layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:25px;align-items:start}.main-column{min-width:0}.sidebar{min-width:0}.sticky{position:sticky;top:100px}.card,.side-card{border:1px solid rgba(255,255,255,.08);background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.018));border-radius:22px}.card{padding:27px;margin-bottom:18px}.side-card{padding:20px;margin-bottom:16px}.section-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:25px}.section-head h2{font-size:23px;margin:7px 0 5px;letter-spacing:-.04em}.section-head p{margin:0;color:#77717e;font-size:10px;line-height:1.55}.section-number{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:rgba(168,85,247,.09);color:#c084fc;font-size:9px;font-weight:900}.selected-template-label{padding:8px 10px;border-radius:999px;border:1px solid rgba(168,85,247,.35);background:rgba(168,85,247,.08);color:#d8b4fe;font-size:8px;font-weight:900;white-space:nowrap}
        .mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.mode-card{position:relative;display:flex;gap:11px;align-items:center;min-height:91px;padding:14px;text-align:left;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);border-radius:15px;color:#fff;cursor:pointer}.mode-card:hover{border-color:rgba(168,85,247,.45)}.mode-card.selected{border-color:#c026d3;background:rgba(168,85,247,.08)}.mode-card>b{position:absolute;right:10px;top:8px;color:#e879f9}.mode-card strong,.mode-card small{display:block}.mode-card strong{font-size:11px}.mode-card small{margin-top:4px;color:#706a76;font-size:8px;line-height:1.4}.mode-icon{width:35px;height:35px;border-radius:10px;display:grid;place-items:center;background:rgba(168,85,247,.12);color:#d8b4fe;flex-shrink:0}.subhead{display:flex;justify-content:space-between;align-items:baseline;gap:15px;margin:25px 0 12px}.subhead strong{font-size:11px}.subhead span{font-size:8px;color:#5f5966}
        .company-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.company-card{position:relative;display:flex;align-items:center;gap:9px;padding:10px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);border-radius:13px;color:#fff;text-align:left;cursor:pointer}.company-card:hover,.company-card.selected{border-color:var(--company-color,#c026d3);background:rgba(255,255,255,.045)}.company-card>b{position:absolute;right:8px;top:7px;color:#d946ef;font-size:10px}.company-logo{width:31px;height:31px;border-radius:9px;display:grid;place-items:center;background:rgba(255,255,255,.08);color:var(--company-color,#c084fc);font-weight:900;font-size:12px;flex-shrink:0}.company-card strong,.company-card small{display:block}.company-card strong{font-size:9px}.company-card small{font-size:7px;color:#696370;margin-top:3px}.text-button{font-size:8px;margin:12px 0 5px;color:#918996}
        .field{margin-top:18px}.field label{display:flex;align-items:center;gap:7px;margin-bottom:7px;color:#bcb5c2;font-size:9px;font-weight:800}.field label b{color:#f0abfc}.field label em{margin-left:auto;color:#5f5966;font-style:normal;font-weight:500;font-size:7px}.field input,.field textarea{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.16);border-radius:11px;color:#f5f0f7;outline:none;padding:12px 13px;font:inherit;font-size:10px;resize:vertical}.field input:focus,.field textarea:focus{border-color:rgba(192,38,211,.65);box-shadow:0 0 0 3px rgba(192,38,211,.08)}.field textarea{line-height:1.6}.field input::placeholder,.field textarea::placeholder{color:#4f4a55}.field-meta{display:flex;justify-content:space-between;gap:10px;margin-top:5px;color:#55505b;font-size:7px}.field-error{margin-top:7px;color:#fb7185;font-size:8px}.info-box,.success-note{display:flex;gap:11px;padding:14px;border-radius:13px;border:1px solid rgba(168,85,247,.15);background:rgba(168,85,247,.045);margin-top:20px}.info-box>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:rgba(168,85,247,.12);color:#c084fc;flex-shrink:0}.info-box strong{font-size:9px}.info-box p{margin:4px 0 0;color:#706a76;font-size:8px;line-height:1.5}.divider{height:1px;background:rgba(255,255,255,.07);margin:24px 0}.form-grid{display:grid;gap:13px}.form-grid.two{grid-template-columns:1fr 1fr}.form-grid .full{grid-column:1/-1}
        .upload-row{display:flex;align-items:center;gap:18px}.upload-row>div{flex:1}.upload-row label{font-size:10px;font-weight:800;color:#bcb5c2}.upload-row p{margin:5px 0 0;color:#68616e;font-size:8px;line-height:1.5}.photo-drop{width:90px;height:90px;border:1px dashed rgba(255,255,255,.16);border-radius:16px;display:grid;place-items:center;cursor:pointer;overflow:hidden;position:relative}.photo-drop input,.resume-drop input{display:none}.photo-drop.dragging,.resume-drop.dragging{border-color:#d946ef;background:rgba(217,70,239,.07)}.photo-drop img{width:100%;height:100%;object-fit:cover}.photo-drop>span{display:grid;place-items:center;color:#c084fc;font-size:25px}.photo-drop small{display:block;color:#716b77;font-size:7px}.remove-small{font-size:8px;color:#fb7185}
        .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.chips button{border:1px solid rgba(168,85,247,.3);background:rgba(168,85,247,.08);color:#d8b4fe;border-radius:999px;padding:6px 9px;font-size:8px;cursor:pointer}.chips span{margin-left:5px;color:#fb7185}.suggested{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px}.suggested>span{color:#5e5865;font-size:8px}.suggested button{border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);color:#77717d;border-radius:999px;padding:6px 8px;font-size:7px;cursor:pointer}.suggested button:hover{color:#d8b4fe;border-color:rgba(168,85,247,.35)}
        .repeat-list{display:grid;gap:12px}.repeat-item{padding:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.018);border-radius:15px}.repeat-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}.repeat-title strong{font-size:10px}.repeat-title button{border:0;background:transparent;color:#fb7185;font-size:8px;cursor:pointer}.empty-repeat{padding:14px;border-radius:12px;border:1px dashed rgba(255,255,255,.1);color:#65606b;font-size:8px}.add-button{margin-top:13px;padding:9px 12px;border:1px solid rgba(168,85,247,.24);background:rgba(168,85,247,.06);border-radius:10px;color:#c084fc;font-size:8px}.add-button:hover{background:rgba(168,85,247,.1)}.achievement-field{margin-top:20px}
        .resume-drop{min-height:150px;border:1px dashed rgba(255,255,255,.12);border-radius:17px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-align:center;cursor:pointer;background:rgba(255,255,255,.018)}.resume-drop:hover{border-color:rgba(168,85,247,.5)}.upload-icon{width:37px;height:37px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(135deg,#7c3aed,#c026d3);color:#fff;font-size:16px}.resume-drop strong{font-size:10px;max-width:85%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.resume-drop small{color:#69636f;font-size:7px}.remove-file{display:block;margin:8px auto 0;color:#fb7185;font-size:8px}.success-note{color:#86efac;font-size:8px}
        .template-card-section{overflow:hidden}.template-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.template-card{padding:0;text-align:left;border:1px solid rgba(255,255,255,.08);border-radius:17px;overflow:hidden;background:rgba(255,255,255,.018);color:#fff;cursor:pointer;transition:.2s ease}.template-card:hover{transform:translateY(-3px);border-color:rgba(168,85,247,.5)}.template-card.selected{border-color:#d946ef;box-shadow:0 12px 40px rgba(168,85,247,.13),0 0 0 1px rgba(217,70,239,.13)}.template-preview-wrap{position:relative;padding:9px;background:linear-gradient(145deg,#17131d,#0c0a0f)}.template-check{position:absolute;right:14px;top:14px;width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#c026d3;color:#fff;font-size:11px;font-weight:900}.template-info{display:flex;justify-content:space-between;gap:8px;padding:12px;min-height:63px}.template-info strong,.template-info span{display:block}.template-info strong{font-size:10px}.template-info span{margin-top:4px;color:#6e6875;font-size:7px;line-height:1.45}.template-info em{font-style:normal;color:#c084fc;font-size:7px;font-weight:900;white-space:nowrap}
        .cv-paper{--cv-accent:#a855f7;background:#f9f7fa;color:#24202a;border-radius:6px;padding:17px;min-height:330px;box-shadow:0 18px 45px rgba(0,0,0,.32);overflow:hidden;font-family:Arial,sans-serif}.cv-compact{min-height:185px;padding:11px}.cv-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.cv-header h3,.cv-main h3{margin:0;font-size:20px;line-height:1;font-weight:900;letter-spacing:-.05em}.cv-role{margin-top:4px;color:var(--cv-accent);font-size:7px;font-weight:800;letter-spacing:.04em}.cv-rule{height:2px;width:100%;margin:10px 0;background:var(--cv-accent);opacity:.9}.cv-contact{color:#817986;font-size:5.5px;margin-bottom:10px}.cv-heading{margin:11px 0 6px;color:#655d69;font-size:6px;font-weight:900;letter-spacing:.13em}.cv-line{display:block;width:76%;height:3px;background:#d8d2db;border-radius:5px;margin:4px 0}.cv-line.long{width:94%}.cv-line.medium{width:82%}.cv-line.short{width:57%}.cv-line.tiny{width:42%}.cv-entry{display:block;font-size:6px;margin-bottom:3px}.cv-skill-row{display:flex;flex-wrap:wrap;gap:4px}.cv-skill{display:inline-block;padding:3px 5px;border-radius:4px;background:#eee8f2;color:#6d6372;font-size:5px}.cv-photo,.cv-photo-placeholder{width:39px;height:39px;border-radius:8px;object-fit:cover}.cv-photo-placeholder{display:grid;place-items:center;background:#e7dff0;color:var(--cv-accent);font-size:8px;font-weight:900}.cv-creative-dot{width:27px;height:27px;border-radius:50%;background:var(--cv-accent);box-shadow:0 0 0 5px #fff}.cv-badge{padding:4px 6px;background:#cffafe;color:#0e7490;font-size:5px;font-weight:900;border-radius:4px}.cv-exec-mark{width:58px;height:3px;background:var(--cv-accent);margin-top:5px}.cv-two-column{padding:0;display:grid;grid-template-columns:30% 1fr;min-height:330px}.cv-side{padding:17px 10px;background:#eee8f2}.cv-main{padding:17px 14px}.cv-side-title{margin:12px 0 6px;color:#655d69;font-size:5.5px;font-weight:900;letter-spacing:.12em}.cv-side .cv-line{background:#cbc2d0}.cv-side .cv-skill{display:block;margin:4px 0;background:transparent;padding:0}.cv-minimal{box-shadow:none}.cv-minimal .cv-rule{display:none}.cv-minimal .cv-contact{border-bottom:1px solid #ddd5df;padding-bottom:7px}.cv-professional .cv-rule{background:#2563eb}.cv-tech .cv-rule{background:#22c55e}.cv-creative{border-top:8px solid #f97316}.cv-student{border-left:7px solid #06b6d4}.cv-elegant .cv-header h3{font-family:Georgia,serif}.cv-elegant .cv-rule{height:1px;background:#0f766e}.cv-executive .cv-header h3{letter-spacing:.03em}.cv-modern .cv-rule{height:3px;background:#c026d3}.cv-compact .cv-header h3,.cv-compact .cv-main h3{font-size:11px}.cv-compact .cv-role{font-size:4px}.cv-compact .cv-contact{font-size:3.5px}.cv-compact .cv-heading{font-size:4px;margin:7px 0 4px}.cv-compact .cv-line{height:2px;margin:2px 0}.cv-compact .cv-skill{font-size:3.5px;padding:2px 3px}.cv-compact .cv-photo,.cv-compact .cv-photo-placeholder{width:25px;height:25px}.cv-compact .cv-paper{box-shadow:none}
        .continue-button{width:100%;margin-top:25px;border:0;border-radius:14px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(100deg,#7c3aed,#c026d3);color:#fff;font-size:11px;font-weight:900;cursor:pointer;box-shadow:0 16px 40px rgba(124,58,237,.2)}.continue-button:hover:not(:disabled){transform:translateY(-2px)}.continue-button:disabled{opacity:.65;cursor:wait}.continue-button b{font-size:18px}.privacy-note{text-align:center;color:#514c57;font-size:7px;margin:10px 0 0}
        .side-label{font-size:8px}.target-mode{margin-top:12px;color:#c084fc;font-size:7px;font-weight:900;letter-spacing:.12em}.target-summary h3{margin:5px 0 3px;font-size:18px;letter-spacing:-.04em}.target-summary p{margin:0;color:#77717e;font-size:9px}.readiness-top{display:flex;justify-content:space-between;align-items:center}.readiness-top span{display:block;color:#77717e;font-size:7px;letter-spacing:.13em;font-weight:900}.readiness-top strong{display:block;margin-top:4px;font-size:27px}.ring{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid rgba(168,85,247,.18);border-top-color:#a855f7;border-right-color:#d946ef;transform:rotate(-20deg)}.ring span{transform:rotate(20deg);font-size:8px;font-weight:900}.readiness-bar{height:5px;border-radius:9px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:15px}.readiness-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#7c3aed,#d946ef)}.readiness-card p{margin:9px 0 0;color:#69636f;font-size:8px;line-height:1.5}.preview-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}.preview-head span,.preview-head small{display:block}.preview-head span{font-size:7px;color:#8b8490;font-weight:900;letter-spacing:.12em}.preview-head small{margin-top:3px;color:#c084fc;font-size:9px;font-weight:800}.preview-head b{font-size:6px;color:#4ade80;letter-spacing:.1em}.preview-card .cv-paper{min-height:300px}.roadmap-step{display:flex;gap:10px;padding:13px 0;border-top:1px solid rgba(255,255,255,.06)}.roadmap-step:first-of-type{margin-top:12px}.roadmap-step>span{width:27px;height:27px;border-radius:8px;display:grid;place-items:center;background:rgba(255,255,255,.04);color:#69636f;font-size:7px;font-weight:900;flex-shrink:0}.roadmap-step.active>span{background:rgba(168,85,247,.13);color:#c084fc}.roadmap-step strong,.roadmap-step small{display:block}.roadmap-step strong{font-size:9px}.roadmap-step small{margin-top:3px;color:#65606b;font-size:7px;line-height:1.45}
        @media(max-width:1050px){.layout{grid-template-columns:1fr}.sidebar{display:none}.template-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:760px){.create-header{height:auto;min-height:68px;padding:12px 4vw}.progress{display:none}.page-shell{width:92vw;padding-top:32px}.mode-grid,.company-grid,.form-grid.two,.template-grid{grid-template-columns:1fr}.card{padding:20px}.intro h1{font-size:36px}.upload-row{align-items:flex-start;flex-wrap:wrap}.template-grid{grid-template-columns:1fr}.section-head{gap:10px}.selected-template-label{display:none}}/* ================= AI JOB ANALYZER ================= */

.job-analyzer-box {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      rgba(124, 58, 237, 0.1),
      rgba(192, 38, 211, 0.045)
    );
}

.job-analyzer-copy {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.job-analyzer-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: rgba(168, 85, 247, 0.15);
  color: #d8b4fe;
  font-size: 16px;
}

.job-analyzer-copy strong {
  display: block;
  color: #f4eff8;
  font-size: 12px;
}

.job-analyzer-copy p {
  margin: 5px 0 0;
  color: #85808b;
  font-size: 9px;
  line-height: 1.55;
}

.job-analyze-button {
  width: 100%;
  margin-top: 14px;
  padding: 11px 14px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(100deg, #7c3aed, #c026d3);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  transition: 0.2s ease;
}

.job-analyze-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(124, 58, 237, 0.2);
}

.job-analyze-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.job-analyze-button span {
  font-size: 14px;
}

.analyze-spinner {
  width: 11px;
  height: 11px;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: resume-ai-spin .7s linear infinite;
}

@keyframes resume-ai-spin {
  to {
    transform: rotate(360deg);
  }
}

.job-analysis-error {
  margin-top: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.18);
  color: #fca5a5;
  font-size: 8px;
  line-height: 1.5;
}

/* ================= ANALYSIS RESULT ================= */

.job-analysis-result {
  margin-top: 16px;
  padding: 18px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 17px;
  background: rgba(255,255,255,.025);
}

.job-analysis-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.analysis-eyebrow {
  color: #c084fc;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .13em;
}

.job-analysis-header h3 {
  margin: 5px 0 0;
  color: #f7f3fa;
  font-size: 16px;
}

.job-analysis-header p {
  margin: 4px 0 0;
  color: #85808b;
  font-size: 9px;
}

.analysis-status {
  flex-shrink: 0;
  padding: 5px 8px;
  border-radius: 20px;
  background: rgba(74,222,128,.08);
  color: #4ade80;
  font-size: 7px;
  font-weight: 800;
}

.analysis-summary {
  margin-top: 16px;
  padding: 12px;
  border-radius: 11px;
  background: rgba(168,85,247,.045);
}

.analysis-summary strong {
  font-size: 9px;
  color: #ddd6fe;
}

.analysis-summary p {
  margin: 5px 0 0;
  color: #89838f;
  font-size: 8px;
  line-height: 1.6;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.analysis-section {
  min-width: 0;
}

.analysis-section.full {
  margin-top: 14px;
}

.analysis-section-title {
  display: block;
  color: #77717f;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .1em;
}

.analysis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

.analysis-tags span {
  padding: 5px 7px;
  border-radius: 7px;
  background: rgba(168,85,247,.1);
  border: 1px solid rgba(168,85,247,.13);
  color: #d8b4fe;
  font-size: 7px;
}

.analysis-tags.muted span {
  background: rgba(255,255,255,.045);
  border-color: rgba(255,255,255,.07);
  color: #aaa4ae;
}

.keyword-tags span {
  background: rgba(34,197,94,.07);
  border-color: rgba(34,197,94,.13);
  color: #86efac;
}

.analysis-guidance {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  border-radius: 11px;
  background: rgba(245,158,11,.055);
  border: 1px solid rgba(245,158,11,.12);
}

.guidance-icon {
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(245,158,11,.1);
  color: #fbbf24;
  font-size: 10px;
}

.analysis-guidance strong {
  color: #fcd34d;
  font-size: 9px;
}

.analysis-guidance ul {
  margin: 6px 0 0;
  padding-left: 13px;
}

.analysis-guidance li {
  margin: 4px 0;
  color: #9b949f;
  font-size: 8px;
  line-height: 1.5;
}

.analysis-roadmap {
  margin-top: 15px;
}

.roadmap-list {
  margin-top: 8px;
  display: grid;
  gap: 6px;
}

.roadmap-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 0;
}

.roadmap-item span {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(168,85,247,.1);
  color: #c084fc;
  font-size: 7px;
  font-weight: 900;
}

.roadmap-item p {
  margin: 2px 0 0;
  color: #99939e;
  font-size: 8px;
  line-height: 1.45;
}

.reanalyze-button {
  margin-top: 13px;
  padding: 7px 10px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  background: rgba(255,255,255,.025);
  color: #9d94a8;
  font-size: 7px;
  font-weight: 800;
  cursor: pointer;
}

.reanalyze-button:hover {
  border-color: rgba(168,85,247,.25);
  color: #d8b4fe;
}

@media (max-width: 700px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .job-analysis-header {
    flex-direction: column;
  }
}
      `}</style>

      {/* Template preview styles are global because the preview is rendered by a child component. */}
      <style jsx global>{`
        .cv-paper {
          --cv-accent: #a855f7;
          width: 100%;
          min-height: 330px;
          box-sizing: border-box;
          background: #fbf9fc;
          color: #24202a;
          border-radius: 7px;
          padding: 18px;
          overflow: hidden;
          box-shadow: 0 14px 32px rgba(0,0,0,.28);
          font-family: Arial, Helvetica, sans-serif;
        }
        .cv-compact {
          min-height: 245px;
          padding: 14px;
          border-radius: 6px;
          box-shadow: 0 10px 22px rgba(0,0,0,.22);
        }
        .cv-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .cv-header h3, .cv-main h3 {
          margin:0;
          font-size:22px;
          line-height:1.05;
          font-weight:900;
          letter-spacing:-.055em;
          color:#25212a;
        }
        .cv-role {
          margin-top:5px;
          color:var(--cv-accent);
          font-size:8px;
          line-height:1.2;
          font-weight:900;
          letter-spacing:.08em;
        }
        .cv-rule {
          width:100%;
          height:3px;
          margin:11px 0;
          background:var(--cv-accent);
          border-radius:999px;
          opacity:.95;
        }
        .cv-contact {
          color:#77707c;
          font-size:7px;
          line-height:1.35;
          margin-bottom:12px;
        }
        .cv-heading {
          margin:12px 0 6px;
          color:#5f5865;
          font-size:7px;
          line-height:1.2;
          font-weight:900;
          letter-spacing:.15em;
        }
        .cv-line {
          display:block;
          width:76%;
          height:4px;
          background:#d9d3dc;
          border-radius:999px;
          margin:5px 0;
        }
        .cv-line.long { width:94%; }
        .cv-line.medium { width:82%; }
        .cv-line.short { width:57%; }
        .cv-line.tiny { width:42%; }
        .cv-entry {
          display:block;
          margin-bottom:4px;
          font-size:8px;
          line-height:1.2;
          color:#29242e;
        }
        .cv-skill-row { display:flex; flex-wrap:wrap; gap:5px; }
        .cv-skill {
          display:inline-block;
          padding:4px 6px;
          border-radius:5px;
          background:#eee9f2;
          color:#655d6c;
          font-size:6px;
          line-height:1;
          font-weight:700;
        }
        .cv-photo, .cv-photo-placeholder {
          width:46px;
          height:46px;
          flex:0 0 46px;
          border-radius:9px;
          object-fit:cover;
        }
        .cv-photo-placeholder {
          display:grid;
          place-items:center;
          background:#e8e0ee;
          color:var(--cv-accent);
          font-size:10px;
          font-weight:900;
        }
        .cv-creative-dot {
          width:30px;
          height:30px;
          flex:0 0 30px;
          border-radius:50%;
          background:var(--cv-accent);
          box-shadow:0 0 0 5px #fff;
        }
        .cv-badge {
          padding:5px 7px;
          background:#cffafe;
          color:#0e7490;
          font-size:6px;
          font-weight:900;
          border-radius:5px;
        }
        .cv-exec-mark {
          width:64px;
          height:4px;
          margin-top:6px;
          background:var(--cv-accent);
          border-radius:999px;
        }
        .cv-two-column {
          padding:0;
          display:grid;
          grid-template-columns:31% 1fr;
          min-height:330px;
        }
        .cv-two-column.cv-compact { min-height:245px; }
        .cv-side { padding:18px 11px; background:#eee8f2; }
        .cv-main { padding:18px 15px; }
        .cv-side-title {
          margin:13px 0 7px;
          color:#625a68;
          font-size:6px;
          line-height:1.2;
          font-weight:900;
          letter-spacing:.13em;
        }
        .cv-side .cv-line { background:#cbc2d0; }
        .cv-side .cv-skill {
          display:block;
          margin:5px 0;
          padding:0;
          background:transparent;
        }
        .cv-minimal { box-shadow:none; border:1px solid #eee8f0; }
        .cv-minimal .cv-rule { display:none; }
        .cv-minimal .cv-contact { border-bottom:1px solid #ddd5df; padding-bottom:8px; }
        .cv-professional .cv-rule { background:#2563eb; }
        .cv-tech .cv-rule { background:#22c55e; }
        .cv-tech .cv-role { color:#16a34a; }
        .cv-creative { border-top:8px solid #f97316; }
        .cv-student { border-left:7px solid #06b6d4; }
        .cv-student .cv-role { color:#0891b2; }
        .cv-elegant .cv-header h3 { font-family:Georgia, 'Times New Roman', serif; }
        .cv-elegant .cv-rule { height:1px; background:#0f766e; }
        .cv-executive .cv-header h3 { letter-spacing:.025em; }
        .cv-modern .cv-rule { height:4px; background:#c026d3; }
        .cv-compact .cv-header h3,
        .cv-compact .cv-main h3 { font-size:14px; }
        .cv-compact .cv-role { font-size:5px; margin-top:3px; }
        .cv-compact .cv-contact { font-size:4.5px; margin-bottom:8px; }
        .cv-compact .cv-heading { font-size:5px; margin:8px 0 4px; }
        .cv-compact .cv-line { height:2.5px; margin:3px 0; }
        .cv-compact .cv-entry { font-size:5.5px; margin-bottom:2px; }
        .cv-compact .cv-skill { font-size:4.5px; padding:3px 4px; }
        .cv-compact .cv-photo,
        .cv-compact .cv-photo-placeholder { width:30px; height:30px; flex-basis:30px; }
        .cv-compact .cv-photo-placeholder { font-size:7px; }
        .cv-compact .cv-side { padding:12px 8px; }
        .cv-compact .cv-main { padding:12px 10px; }
        .cv-compact .cv-side-title { font-size:4.5px; margin:8px 0 4px; }
        .cv-compact .cv-side .cv-skill { margin:3px 0; }
        .cv-compact .cv-creative-dot { width:20px; height:20px; flex-basis:20px; }
        .cv-compact .cv-badge { padding:3px 4px; font-size:4px; }
        .cv-compact .cv-exec-mark { width:40px; height:2.5px; margin-top:4px; }
        @media (max-width:760px) {
          .cv-compact { min-height:220px; }
          .cv-compact .cv-header h3, .cv-compact .cv-main h3 { font-size:13px; }
        }
      `}</style>
      </main>
    </AuthGuard>
  );
}
