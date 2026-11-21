"use client";

import type { TemplateProps } from "../types";
import { ListSection, ExperienceAndRest } from "../ResumeBlocks";

export default function TechTemplate(props: TemplateProps) {
  return (
    <div className="resume-inner">
      <header className="tech-header">
        <div className="identity">
          <h2>{props.name}</h2>

          {props.position && (
            <p>{props.position}</p>
          )}

          {props.company && (
            <small>{props.company}</small>
          )}
        </div>

        <div className="contact-info">
          {props.contactItems.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </div>
      </header>

      {props.summary && (
        <ListSection title="ABOUT">
          <p>{props.summary}</p>
        </ListSection>
      )}

      {props.skills.length > 0 && (
        <ListSection title="TECH STACK">
          <div className="skills-grid">
            {props.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </ListSection>
      )}

      <ExperienceAndRest {...props} />
    </div>
  );
}
