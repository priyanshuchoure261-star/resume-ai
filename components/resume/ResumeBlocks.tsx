"use client";

import React from "react";
import type {
  TemplateProps,
  Experience,
  Internship,
  Project,
  Education,
  Certification,
} from "./types";

/* ============================================================
   HELPER
   ============================================================ */

export function clean(value?: string) {
  return typeof value === "string" ? value.trim() : "";
}

/* ============================================================
   LIST SECTION
   ============================================================ */

export function ListSection({
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

/* ============================================================
   STANDARD HEADER
   ============================================================ */

export function StandardHeader({
  profile,
  name,
  position,
  company,
  contactItems,
}: {
  profile: TemplateProps["profile"];
  name: string;
  position: string;
  company: string;
  contactItems: string[];
}) {
  return (
    <header className="resume-header">
      <div className="identity">
        {profile.profileImage && (
          <img
            src={profile.profileImage}
            alt=""
            className="profile-image"
          />
        )}

        <div>
          <h2>{name}</h2>

          {position && <p>{position}</p>}

          {company && <small>{company}</small>}
        </div>
      </div>

      <div className="contact-info">
        {contactItems.map((item, index) => (
          <span key={`contact-${index}`}>
            {item}
          </span>
        ))}
      </div>
    </header>
  );
}

/* ============================================================
   EXPERIENCE BLOCK
   ============================================================ */

export function ExperienceBlock({
  items,
}: {
  items: Experience[];
}) {
  return (
    <ListSection title="EXPERIENCE">
      <div>
        {items.map((item) => (
          <div
            className="timeline-item"
            key={item.id}
          >
            <div className="timeline-top">
              <div>
                <div className="timeline-title">
                  {clean(item.role) || "Role"}
                </div>

                <div className="timeline-company">
                  {clean(item.company)}

                  {clean(item.location)
                    ? ` · ${clean(item.location)}`
                    : ""}
                </div>
              </div>

              {(clean(item.startDate) ||
                clean(item.endDate)) && (
                <div className="timeline-date">
                  {clean(item.startDate)}

                  {clean(item.endDate)
                    ? ` — ${clean(item.endDate)}`
                    : ""}
                </div>
              )}
            </div>

            {clean(item.details) && (
              <div className="timeline-details">
                {clean(item.details)}
              </div>
            )}
          </div>
        ))}
      </div>
    </ListSection>
  );
}

/* ============================================================
   INTERNSHIP BLOCK
   ============================================================ */

export function InternshipBlock({
  items,
}: {
  items: Internship[];
}) {
  return (
    <ListSection title="INTERNSHIPS">
      {items.map((item) => (
        <div
          className="timeline-item"
          key={item.id}
        >
          <div className="timeline-top">
            <div>
              <div className="timeline-title">
                {clean(item.role) || "Intern"}
              </div>

              <div className="timeline-company">
                {clean(item.company)}
              </div>
            </div>

            {(clean(item.startDate) ||
              clean(item.endDate)) && (
              <div className="timeline-date">
                {clean(item.startDate)}

                {clean(item.endDate)
                  ? ` — ${clean(item.endDate)}`
                  : ""}
              </div>
            )}
          </div>

          {clean(item.details) && (
            <div className="timeline-details">
              {clean(item.details)}
            </div>
          )}
        </div>
      ))}
    </ListSection>
  );
}

/* ============================================================
   PROJECT BLOCK
   ============================================================ */

export function ProjectBlock({
  items,
}: {
  items: Project[];
}) {
  return (
    <ListSection title="PROJECTS">
      {items.map((item) => (
        <div
          className="timeline-item"
          key={item.id}
        >
          <div className="timeline-title">
            {clean(item.name) || "Project"}
          </div>

          {clean(item.role) && (
            <div className="timeline-company">
              {clean(item.role)}
            </div>
          )}

          {clean(item.details) && (
            <div className="timeline-details">
              {clean(item.details)}
            </div>
          )}

          {clean(item.link) && (
            <a
              className="timeline-link"
              href={item.link}
              target="_blank"
              rel="noreferrer"
            >
              {item.link}
            </a>
          )}
        </div>
      ))}
    </ListSection>
  );
}

/* ============================================================
   EDUCATION BLOCK
   ============================================================ */

export function EducationBlock({
  items,
}: {
  items: Education[];
}) {
  return (
    <ListSection title="EDUCATION">
      {items.map((item) => (
        <div
          className="timeline-item"
          key={item.id}
        >
          <div className="timeline-top">
            <div>
              <div className="timeline-title">
                {clean(item.degree) || "Qualification"}
              </div>

              <div className="timeline-company">
                {clean(item.institution)}
              </div>
            </div>

            {(clean(item.startYear) ||
              clean(item.endYear)) && (
              <div className="timeline-date">
                {clean(item.startYear)}

                {clean(item.endYear)
                  ? ` — ${clean(item.endYear)}`
                  : ""}
              </div>
            )}
          </div>

          {clean(item.grade) && (
            <div className="timeline-company">
              Grade: {clean(item.grade)}
            </div>
          )}

          {clean(item.details) && (
            <div className="timeline-details">
              {clean(item.details)}
            </div>
          )}
        </div>
      ))}
    </ListSection>
  );
}

/* ============================================================
   CERTIFICATION BLOCK
   ============================================================ */

export function CertificationBlock({
  items,
}: {
  items: Certification[];
}) {
  return (
    <ListSection title="CERTIFICATIONS">
      {items.map((item) => (
        <div
          className="timeline-item"
          key={item.id}
        >
          <div className="timeline-title">
            {clean(item.name) || "Certification"}
          </div>

          <div className="timeline-company">
            {clean(item.issuer)}

            {clean(item.date)
              ? ` · ${clean(item.date)}`
              : ""}
          </div>

          {clean(item.link) && (
            <a
              className="timeline-link"
              href={item.link}
              target="_blank"
              rel="noreferrer"
            >
              {item.link}
            </a>
          )}
        </div>
      ))}
    </ListSection>
  );
}

/* ============================================================
   SIMPLE LIST BLOCK
   ============================================================ */

export function SimpleListBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const filtered = items.filter(Boolean);

  if (!filtered.length) return null;

  return (
    <ListSection title={title}>
      <div className="text-list">
        {filtered.map((item, index) => (
          <p key={`${title}-${index}`}>
            • {item}
          </p>
        ))}
      </div>
    </ListSection>
  );
}

/* ============================================================
   COMMON RESUME CONTENT
   ============================================================ */

export function CommonResumeContent(
  props: TemplateProps & {
    showTruth?: boolean;
  }
) {
  return (
    <>
      {props.summary && (
        <ListSection title="PROFESSIONAL SUMMARY">
          <p>{props.summary}</p>
        </ListSection>
      )}

      {props.skills.length > 0 && (
        <ListSection title="TECHNICAL SKILLS">
          <div className="skills-grid">
            {props.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </ListSection>
      )}

      {props.softSkills.length > 0 && (
        <ListSection title="CORE STRENGTHS">
          <div className="skills-grid">
            {props.softSkills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </ListSection>
      )}

      <ExperienceAndRest {...props} />

      {props.showTruth && (
        <div className="truth-note">
          ResumeAI only uses information provided by the
          candidate. Missing information is not fabricated.
        </div>
      )}
    </>
  );
}

/* ============================================================
   EXPERIENCE + REST
   ============================================================ */

export function ExperienceAndRest(props: TemplateProps) {
  return (
    <>
      {props.optimizedExperience.length > 0 ? (
        <ListSection title="EXPERIENCE">
          <div className="text-list">
            {props.optimizedExperience.map(
              (item, index) => (
                <p key={`optimized-${index}`}>
                  {item}
                </p>
              )
            )}
          </div>
        </ListSection>
      ) : props.experience.length > 0 ? (
        <ExperienceBlock items={props.experience} />
      ) : props.plainExperience ? (
        <ListSection title="EXPERIENCE">
          <p>{props.plainExperience}</p>
        </ListSection>
      ) : null}

      {props.internships.length > 0 && (
        <InternshipBlock items={props.internships} />
      )}

      {props.optimizedProjects.length > 0 ? (
        <ListSection title="PROJECTS">
          <div className="text-list">
            {props.optimizedProjects.map(
              (item, index) => (
                <p key={`optimized-project-${index}`}>
                  {item}
                </p>
              )
            )}
          </div>
        </ListSection>
      ) : (
        props.projects.length > 0 && (
          <ProjectBlock items={props.projects} />
        )
      )}

      {props.education.length > 0 && (
        <EducationBlock items={props.education} />
      )}

      {props.certifications.length > 0 && (
        <CertificationBlock items={props.certifications} />
      )}

      {props.achievements.length > 0 && (
        <SimpleListBlock
          title="ACHIEVEMENTS"
          items={props.achievements}
        />
      )}

      {props.languages.length > 0 && (
        <SimpleListBlock
          title="LANGUAGES"
          items={props.languages}
        />
      )}
    </>
  );
}

/* ============================================================
   REST SECTIONS (skippable)
   ============================================================ */

export function RestSections(
  props: TemplateProps & {
    skipExperience?: boolean;
    skipSkills?: boolean;
  }
) {
  return (
    <>
      {!props.skipExperience &&
        props.experience.length > 0 && (
          <ExperienceBlock items={props.experience} />
        )}

      {props.internships.length > 0 && (
        <InternshipBlock items={props.internships} />
      )}

      {props.projects.length > 0 && (
        <ProjectBlock items={props.projects} />
      )}

      {props.education.length > 0 && (
        <EducationBlock items={props.education} />
      )}

      {props.achievements.length > 0 && (
        <SimpleListBlock
          title="ACHIEVEMENTS"
          items={props.achievements}
        />
      )}

      {props.languages.length > 0 && (
        <SimpleListBlock
          title="LANGUAGES"
          items={props.languages}
        />
      )}
    </>
  );
}
