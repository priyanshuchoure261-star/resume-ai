"use client";

import type { TemplateProps } from "../types";
import { StandardHeader, CommonResumeContent } from "../ResumeBlocks";

export default function ClassicTemplate(props: TemplateProps) {
  return (
    <div className="resume-inner">
      <StandardHeader {...props} />

      <div className="resume-divider" />

      <CommonResumeContent {...props} showTruth />
    </div>
  );
}
