"use client";

import type { TemplateProps } from "../types";
import { CommonResumeContent } from "../ResumeBlocks";

export default function ElegantTemplate(props: TemplateProps) {
  return (
    <div>
      <header className="elegant-header">
        <div className="identity">
          {props.profile.profileImage && (
            <img
              src={props.profile.profileImage}
              alt=""
              className="profile-image"
            />
          )}

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

      <div className="elegant-divider" />

      <div className="elegant-content">
        <CommonResumeContent {...props} showTruth />
      </div>
    </div>
  );
}
