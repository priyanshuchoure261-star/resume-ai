/* ============================================================
   Shared types used by all resume templates & the renderer.
   ============================================================ */

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

/** Props passed into every template component */
export type TemplateProps = {
  template: string;
  profile: ResumeProfile;

  name: string;
  position: string;
  company: string;

  contactItems: string[];

  summary: string;
  skills: string[];
  softSkills: string[];
  languages: string[];

  experience: Experience[];
  internships: Internship[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  achievements: string[];

  optimizedExperience: string[];
  optimizedProjects: string[];

  plainExperience: string;
};
