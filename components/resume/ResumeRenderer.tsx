"use client";

import type { TemplateProps } from "./types";

import ClassicTemplate from "./templates/ClassicTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import TechTemplate from "./templates/TechTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import StudentTemplate from "./templates/StudentTemplate";
import TwoColumnTemplate from "./templates/TwoColumnTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";

export default function ResumeRenderer(props: TemplateProps) {
  switch (props.template) {
    case "modern":
      return <ModernTemplate {...props} />;

    case "executive":
      return <ExecutiveTemplate {...props} />;

    case "minimal":
      return <MinimalTemplate {...props} />;

    case "professional":
      return <ProfessionalTemplate {...props} />;

    case "tech":
      return <TechTemplate {...props} />;

    case "creative":
      return <CreativeTemplate {...props} />;

    case "student":
      return <StudentTemplate {...props} />;

    case "two-column":
      return <TwoColumnTemplate {...props} />;

    case "elegant":
      return <ElegantTemplate {...props} />;

    case "classic":
    default:
      return <ClassicTemplate {...props} />;
  }
}
