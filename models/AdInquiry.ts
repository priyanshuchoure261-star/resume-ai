import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdInquiry extends Document {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  slot: string;
  budget: string;
  duration: string;
  message: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const AdInquirySchema = new Schema<IAdInquiry>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    slot: {
      type: String,
      default: "Starter Banner",
    },
    budget: {
      type: String,
      default: "₹1,999",
    },
    duration: {
      type: String,
      default: "1 month",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const AdInquiry: Model<IAdInquiry> =
  mongoose.models.AdInquiry || mongoose.model<IAdInquiry>("AdInquiry", AdInquirySchema);

export default AdInquiry;
