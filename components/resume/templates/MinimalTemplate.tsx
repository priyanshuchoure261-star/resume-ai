"use client";

import type { TemplateProps } from "../types";
import { CommonResumeContent } from "../ResumeBlocks";

export default function MinimalTemplate(props: TemplateProps) {
  return (
    <div className="resume-inner">
      <header className="minimal-header">
        <div className="identity">
          {props.profile.profileImage && (
            <img
              src={props.profile.profileImage}
              alt=""
              className="profile-image"
            />
          )}

          <h2>{props.name}</h2>

          {props.position && <p>{props.position}</p>}

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

      <div className="resume-divider" />

      <CommonResumeContent {...props} showTruth />
    </div>
  );
}
