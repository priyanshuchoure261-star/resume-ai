"use client";

import type { TemplateProps } from "../types";
import {
  ListSection,
  ExperienceBlock,
  InternshipBlock,
  ProjectBlock,
  EducationBlock,
  CertificationBlock,
  SimpleListBlock,
} from "../ResumeBlocks";

export default function TwoColumnTemplate(props: TemplateProps) {
  return (
    <div className="two-column-shell">
      <aside className="template-sidebar">
        <div className="sidebar-avatar">
          {props.profile.profileImage ? (
            <img
              src={props.profile.profileImage}
              alt=""
            />
          ) : (
            <span>
              {props.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <h2>{props.name}</h2>

        {props.position && (
          <p className="sidebar-role">{props.position}</p>
        )}

        <div className="sidebar-block">
          <b>CONTACT</b>

          {props.contactItems.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>

        {props.skills.length > 0 && (
          <div className="sidebar-block">
            <b>SKILLS</b>

            {props.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}

        {props.softSkills.length > 0 && (
          <div className="sidebar-block">
            <b>STRENGTHS</b>

            {props.softSkills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}

        {props.languages.length > 0 && (
          <div className="sidebar-block">
            <b>LANGUAGES</b>

            {props.languages.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </aside>

      <div className="template-main">
        {props.summary && (
          <ListSection title="PROFILE">
            <p>{props.summary}</p>
          </ListSection>
        )}

        {props.experience.length > 0 && (
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

        {props.certifications.length > 0 && (
          <CertificationBlock items={props.certifications} />
        )}

        {props.achievements.length > 0 && (
          <SimpleListBlock
            title="ACHIEVEMENTS"
            items={props.achievements}
          />
        )}
      </div>
    </div>
  );
}
