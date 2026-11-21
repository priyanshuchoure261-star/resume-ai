"use client";

import type { TemplateProps } from "../types";
import {
  StandardHeader,
  ListSection,
  ExperienceAndRest,
} from "../ResumeBlocks";

export default function ModernTemplate(props: TemplateProps) {
  return (
    <div className="resume-inner">
      <div className="modern-header">
        <StandardHeader {...props} />
      </div>

      <div style={{ marginTop: 30 }}>
        {props.summary && (
          <ListSection title="PROFILE">
            <p>{props.summary}</p>
          </ListSection>
        )}

        {props.skills.length > 0 && (
          <ListSection title="CORE SKILLS">
            <div className="skills-grid">
              {props.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </ListSection>
        )}

        <ExperienceAndRest {...props} />
      </div>
    </div>
  );
}
