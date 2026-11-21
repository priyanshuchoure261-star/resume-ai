"use client";

import type { TemplateProps } from "../types";
import {
  StandardHeader,
  ListSection,
  EducationBlock,
  ProjectBlock,
  InternshipBlock,
  ExperienceBlock,
  SimpleListBlock,
  CertificationBlock,
} from "../ResumeBlocks";

export default function StudentTemplate(props: TemplateProps) {
  return (
    <div>
      <header className="student-header">
        <StandardHeader {...props} />
      </header>

      <div className="resume-inner">
        {props.summary && (
          <ListSection title="CAREER OBJECTIVE">
            <p>{props.summary}</p>
          </ListSection>
        )}

        <div className="student-grid">
          <div>
            {props.education.length > 0 && (
              <EducationBlock items={props.education} />
            )}

            {props.projects.length > 0 && (
              <ProjectBlock items={props.projects} />
            )}

            {props.internships.length > 0 && (
              <InternshipBlock items={props.internships} />
            )}
          </div>

          <div>
            {props.skills.length > 0 && (
              <ListSection title="SKILLS">
                <div className="skills-grid">
                  {props.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </ListSection>
            )}

            {props.softSkills.length > 0 && (
              <SimpleListBlock
                title="STRENGTHS"
                items={props.softSkills}
              />
            )}

            {props.languages.length > 0 && (
              <SimpleListBlock
                title="LANGUAGES"
                items={props.languages}
              />
            )}

            {props.certifications.length > 0 && (
              <CertificationBlock items={props.certifications} />
            )}
          </div>
        </div>

        {props.experience.length > 0 && (
          <ExperienceBlock items={props.experience} />
        )}

        {props.achievements.length > 0 && (
          <SimpleListBlock
            title="ACHIEVEMENTS"
            items={props.achievements}
          />
        )}

        <div className="truth-note">
          ResumeAI only uses information provided by the
          candidate. Missing information is not fabricated.
        </div>
      </div>
    </div>
  );
}
