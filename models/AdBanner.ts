import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdBanner extends Document {
  slot: "horizontal" | "sidebar";
  headline: string;
  companyName: string;
  tagline: string;
  ctaText: string;
  targetUrl: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdBannerSchema = new Schema<IAdBanner>(
  {
    slot: {
      type: String,
      enum: ["horizontal", "sidebar"],
      default: "horizontal",
    },
    headline: {
      type: String,
      required: true,
      default: "Scale Your Team Faster",
    },
    companyName: {
      type: String,
      required: true,
      default: "TechCorp Global",
    },
    tagline: {
      type: String,
      required: true,
      default: "Hiring Top 1% Engineers Across India",
    },
    ctaText: {
      type: String,
      default: "Apply Now →",
    },
    targetUrl: {
      type: String,
      default: "https://example.com/careers",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const AdBanner: Model<IAdBanner> =
  mongoose.models.AdBanner || mongoose.model<IAdBanner>("AdBanner", AdBannerSchema);

export default AdBanner;
