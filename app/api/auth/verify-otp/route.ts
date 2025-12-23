import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OTP from "@/lib/models/OTP";
import User from "@/lib/models/User";
import { login } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { mobile, code, name } = await req.json();
    if (!mobile || !code) {
      return NextResponse.json({ error: "Mobile and code are required" }, { status: 400 });
    }

    await dbConnect();

    const otpRecord = await OTP.findOne({ mobile, code }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Find or create user
    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({ mobile, name: name || "User", role: "user" });
    } else if (name) {
        // Update name if provided
        user.name = name;
        await user.save();
    }

    // Create session
    await login({ userId: user._id, role: user.role, name: user.name, mobile: user.mobile });

    // Delete used OTP (optional, but good practice)
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
