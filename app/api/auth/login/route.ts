import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if MongoDB is connected
    if (!isMongoConfigured()) {
      // Local fallback mode
      const token = signToken({
        userId: "local-" + Date.now(),
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        role: "user",
      });

      return NextResponse.json({
        success: true,
        message: "Logged in (Local mode)",
        user: {
          id: "local-" + Date.now(),
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "user",
        },
        token,
        isDatabaseConnected: false,
      });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      isDatabaseConnected: true,
    });
  } catch (error: unknown) {
    console.error("Login API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
