"use client";

import type { TemplateProps } from "../types";
import {
  StandardHeader,
  ListSection,
  ExperienceBlock,
  SimpleListBlock,
  CertificationBlock,
  RestSections,
} from "../ResumeBlocks";

export default function ProfessionalTemplate(props: TemplateProps) {
  return (
    <div>
      <div className="professional-header">
        <StandardHeader {...props} />
      </div>

      <div className="resume-inner">
        <div className="professional-columns">
          <div>
            {props.summary && (
              <ListSection title="PROFESSIONAL SUMMARY">
                <p>{props.summary}</p>
              </ListSection>
            )}

            {props.experience.length > 0 && (
              <ExperienceBlock items={props.experience} />
            )}
          </div>

          <div className="professional-side">
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
              <ListSection title="STRENGTHS">
                <div className="text-list">
                  {props.softSkills.map((item) => (
                    <p key={item}>• {item}</p>
                  ))}
                </div>
              </ListSection>
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

        <div style={{ marginTop: 25 }}>
          <RestSections
            {...props}
            skipExperience
            skipSkills
          />
        </div>

        <div className="truth-note">
          ResumeAI only uses information provided by the
          candidate. Missing information is not fabricated.
        </div>
      </div>
    </div>
  );
}
