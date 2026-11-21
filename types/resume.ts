export type TargetMode =
  | "specific"
  | "internship"
  | "general";

export type ResumeTemplate =
  | "classic"
  | "modern"
  | "executive"
  | "minimal"
  | "professional"
  | "creative"
  | "tech"
  | "academic"
  | "elegant"
  | "compact";

export type Education = {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
  grade: string;
  details: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  details: string;
};

export type Internship = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  details: string;
};

export type Project = {
  id: string;
  name: string;
  role: string;
  link: string;
  details: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
};

export type ResumeProfile = {
  name: string;

  email: string;
  phone: string;
  location: string;

  portfolio: string;
  linkedin: string;
  github: string;

  targetMode: TargetMode;

  targetCompany: string;
  targetPosition: string;
  jobDescription: string;

  summary: string;

  technicalSkills: string;
  softSkills: string;
  languages: string;

  profileImage: string;
  existingResumeName: string;

  education: Education[];
  experience: Experience[];
  internships: Internship[];
  projects: Project[];
  certifications: Certification[];
  achievements: string[];

  template: ResumeTemplate;

  updatedAt: string;
};

export type AnalysisStatus =
  | "strong"
  | "good"
  | "gap";

export type AnalysisItem = {
  title: string;
  status: AnalysisStatus;
  message: string;
};

export type ResumeAnalysis = {
  overallScore: number;

  companyInsights: string[];

  roleRequirements: string[];

  requiredSkills: string[];

  missingSkills: string[];

  atsKeywords: string[];

  communicationSkills: string[];

  analysisItems: AnalysisItem[];

  recommendations: string[];

  summary: string;

  tailoredSummary: string;

  tailoredSkills: string[];

  tailoredExperience: string[];

  tailoredProjects: string[];

  interviewTips: string[];

  internshipAdvice: string[];

  chatbotContext: string;
};

export type ResumeSession = {
  profile: ResumeProfile;
  analysis: ResumeAnalysis | null;
};