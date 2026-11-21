import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResume extends Document {
  userId: string;
  userEmail: string;
  title: string;
  targetCompany: string;
  targetRole: string;
  templateId: string;
  matchScore: number;
  honestyScore: number;
  analysis?: Record<string, unknown>;
  resumeData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      default: "Untitled Resume",
      trim: true,
    },
    targetCompany: {
      type: String,
      default: "General",
      trim: true,
    },
    targetRole: {
      type: String,
      default: "Software Engineer",
      trim: true,
    },
    templateId: {
      type: String,
      default: "1",
    },
    matchScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    honestyScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    analysis: {
      type: Schema.Types.Mixed,
      default: {},
    },
    resumeData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;
