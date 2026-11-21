import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { verifyToken } from "@/lib/auth";

function getUserFromReq(req: NextRequest): { userId?: string; email?: string } {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      return { userId: decoded.userId, email: decoded.email };
    }
  }

  // Fallback to query param or headers
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || req.headers.get("x-user-email") || undefined;
  const userId = url.searchParams.get("userId") || undefined;
  return { userId, email };
}

// GET /api/resumes - Fetch all saved resumes for the user
export async function GET(req: NextRequest) {
  try {
    const { userId, email } = getUserFromReq(req);

    if (!userId && !email) {
      return NextResponse.json(
        { error: "Authentication or user email required" },
        { status: 401 }
      );
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({
        resumes: [],
        isDatabaseConnected: false,
        message: "MongoDB not connected yet. Storing locally in browser.",
      });
    }

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (email) {
      query.userEmail = email.toLowerCase().trim();
    } else if (userId) {
      query.userId = userId;
    }

    const resumes = await Resume.find(query).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      resumes,
      isDatabaseConnected: true,
      count: resumes.length,
    });
  } catch (error: unknown) {
    console.error("GET /api/resumes error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/resumes - Create or update a resume
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      userId,
      userEmail,
      title,
      targetCompany,
      targetRole,
      templateId,
      matchScore,
      honestyScore,
      analysis,
      resumeData,
    } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required to save resume" },
        { status: 400 }
      );
    }

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: true,
        resume: {
          id: id || "local-" + Date.now(),
          title: title || "My Resume",
          userEmail,
          updatedAt: new Date().toISOString(),
        },
        isDatabaseConnected: false,
      });
    }

    await connectToDatabase();

    let savedResume;
    if (id && id.length === 24) {
      // Update existing MongoDB document
      savedResume = await Resume.findByIdAndUpdate(
        id,
        {
          title: title || "Untitled Resume",
          targetCompany: targetCompany || "General",
          targetRole: targetRole || "Software Engineer",
          templateId: templateId || "1",
          matchScore: matchScore ?? 80,
          honestyScore: honestyScore ?? 100,
          analysis: analysis || {},
          resumeData,
        },
        { new: true }
      );
    }

    if (!savedResume) {
      // Create new document
      savedResume = await Resume.create({
        userId: userId || "user-" + Date.now(),
        userEmail: userEmail.toLowerCase().trim(),
        title: title || "Untitled Resume",
        targetCompany: targetCompany || "General",
        targetRole: targetRole || "Software Engineer",
        templateId: templateId || "1",
        matchScore: matchScore ?? 80,
        honestyScore: honestyScore ?? 100,
        analysis: analysis || {},
        resumeData,
      });
    }

    return NextResponse.json({
      success: true,
      resume: savedResume,
      isDatabaseConnected: true,
    });
  } catch (error: unknown) {
    console.error("POST /api/resumes error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/resumes?id=... - Delete a resume
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: true, isDatabaseConnected: false });
    }

    await connectToDatabase();
    await Resume.findByIdAndDelete(id);

    return NextResponse.json({ success: true, isDatabaseConnected: true });
  } catch (error: unknown) {
    console.error("DELETE /api/resumes error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
