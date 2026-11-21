import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import AdInquiry from "@/models/AdInquiry";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "ad_inquiries.json");
const ACTIVE_ADS_FILE = path.join(DATA_DIR, "active_ads.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function GET() {
  ensureDirectoryExists();
  try {
    let inquiries: unknown[] = [];
    let activeAds = null;

    // Try MongoDB first if configured
    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const mongoInquiries = await AdInquiry.find().sort({ createdAt: -1 }).lean();
        if (mongoInquiries && mongoInquiries.length > 0) {
          inquiries = mongoInquiries;
        }
      } catch (dbErr) {
        console.warn("MongoDB fetch inquiries error, falling back to local file:", dbErr);
      }
    }

    // Fallback to local JSON file if empty
    if (inquiries.length === 0 && fs.existsSync(INQUIRIES_FILE)) {
      const content = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      inquiries = JSON.parse(content || "[]");
    }

    if (fs.existsSync(ACTIVE_ADS_FILE)) {
      const content = fs.readFileSync(ACTIVE_ADS_FILE, "utf-8");
      activeAds = JSON.parse(content || "null");
    }

    return NextResponse.json({
      success: true,
      inquiries,
      activeAds,
      isDatabaseConnected: isMongoConfigured(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching inquiries";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  ensureDirectoryExists();
  try {
    const body = await request.json();

    const newInquiry = {
      id: "inq_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      company: body.company || "Unknown Company",
      email: body.email || "",
      phone: body.phone || "",
      productType: body.productType || "General Promotion",
      packageType: body.packageType || "Standard Banner",
      adTitle: body.adTitle || "",
      adDescription: body.adDescription || "",
      targetUrl: body.targetUrl || "",
      bannerAssetUrl: body.bannerAssetUrl || "",
      status: "pending", // pending | approved | rejected | paid
    };

    // Save to MongoDB if connected
    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await AdInquiry.create({
          companyName: newInquiry.company,
          contactName: body.contactName || newInquiry.company,
          email: newInquiry.email,
          phone: newInquiry.phone,
          website: newInquiry.targetUrl,
          slot: newInquiry.packageType,
          budget: body.budget || "₹1,999",
          duration: body.duration || "1 month",
          message: newInquiry.adDescription || newInquiry.adTitle,
          status: "pending",
        });
      } catch (dbErr) {
        console.warn("Could not save to MongoDB, saving to local file:", dbErr);
      }
    }

    // Also persist in local JSON file
    let existingInquiries = [];
    if (fs.existsSync(INQUIRIES_FILE)) {
      try {
        const fileContent = fs.readFileSync(INQUIRIES_FILE, "utf-8");
        existingInquiries = JSON.parse(fileContent || "[]");
      } catch {
        existingInquiries = [];
      }
    }

    existingInquiries.unshift(newInquiry);
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(existingInquiries, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Ad inquiry submitted successfully! Our partnerships team will contact you shortly.",
      inquiryId: newInquiry.id,
      isDatabaseConnected: isMongoConfigured(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error submitting inquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT endpoint to update active live ads
export async function PUT(request: NextRequest) {
  ensureDirectoryExists();
  try {
    const body = await request.json();
    fs.writeFileSync(ACTIVE_ADS_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Active ads updated successfully!" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating ads";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
