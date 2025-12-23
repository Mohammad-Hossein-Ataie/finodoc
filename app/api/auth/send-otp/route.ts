import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OTP from "@/lib/models/OTP";
import { sendOtp } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();
    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    await dbConnect();

    // Generate 5 digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    await OTP.create({
      mobile,
      code,
      expiresAt,
    });

    // Send SMS
    const result = await sendOtp(mobile, code);
    
    if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
