import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if MongoDB is connected
    if (!isMongoConfigured()) {
      // Local development fallback if MONGODB_URI not set yet
      const token = signToken({
        userId: "local-" + Date.now(),
        email: cleanEmail,
        name: name.trim(),
        role: "user",
      });

      return NextResponse.json({
        success: true,
        message: "Account created (Local mode - configure MONGODB_URI for cloud persistence)",
        user: {
          id: "local-" + Date.now(),
          name: name.trim(),
          email: cleanEmail,
          role: "user",
        },
        token,
        isDatabaseConnected: false,
      });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
      isDatabaseConnected: true,
    });
  } catch (error: unknown) {
    console.error("Register API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
