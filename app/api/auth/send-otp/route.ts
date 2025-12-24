import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import OTP from "@/lib/models/OTP";
import OtpRequest from "@/lib/models/OtpRequest";
import { sendOtp } from "@/lib/sms";

function getClientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return null;
}

function rateLimitResponse(message: string, retryAfterSeconds: number) {
  const seconds = Math.max(1, Math.ceil(retryAfterSeconds));
  return NextResponse.json(
    { error: message, retryAfterSeconds: seconds },
    { status: 429, headers: { "Retry-After": String(seconds) } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();
    const normalizedMobile = String(mobile || "").trim().replace(/\s+/g, "");
    if (!normalizedMobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    await dbConnect();

    // --- Best-practice throttling for OTP send ---
    // 1) Per-number cooldown to prevent spam
    // 2) Per-number hourly/daily caps to stop abuse
    // 3) Per-IP hourly cap to reduce bot blasting across many numbers
    const COOLDOWN_SECONDS = Number(process.env.OTP_COOLDOWN_SECONDS || 60);
    const PER_MOBILE_HOURLY_LIMIT = Number(process.env.OTP_PER_MOBILE_HOURLY_LIMIT || 5);
    const PER_MOBILE_DAILY_LIMIT = Number(process.env.OTP_PER_MOBILE_DAILY_LIMIT || 20);
    const PER_IP_HOURLY_LIMIT = Number(process.env.OTP_PER_IP_HOURLY_LIMIT || 30);

    const now = Date.now();
    const hourAgo = new Date(now - 60 * 60 * 1000);
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent");

    const lastReq = await OtpRequest.findOne({ mobile: normalizedMobile, purpose: "login" })
      .sort({ createdAt: -1 })
      .select({ createdAt: 1 })
      .lean();

    if (lastReq?.createdAt) {
      const elapsedSeconds = (now - new Date(lastReq.createdAt).getTime()) / 1000;
      if (elapsedSeconds < COOLDOWN_SECONDS) {
        return rateLimitResponse(
          "لطفاً کمی صبر کنید و سپس دوباره تلاش کنید.",
          COOLDOWN_SECONDS - elapsedSeconds
        );
      }
    }

    const [mobileHourCount, mobileDayCount, ipHourCount] = await Promise.all([
      OtpRequest.countDocuments({
        mobile: normalizedMobile,
        purpose: "login",
        createdAt: { $gte: hourAgo },
      }),
      OtpRequest.countDocuments({
        mobile: normalizedMobile,
        purpose: "login",
        createdAt: { $gte: dayAgo },
      }),
      ip
        ? OtpRequest.countDocuments({ ip, createdAt: { $gte: hourAgo } })
        : Promise.resolve(0),
    ]);

    if (mobileHourCount >= PER_MOBILE_HOURLY_LIMIT) {
      return rateLimitResponse(
        "تعداد درخواست‌های کد تایید در این بازه زیاد است. لطفاً بعداً دوباره تلاش کنید.",
        60 * 60
      );
    }

    if (mobileDayCount >= PER_MOBILE_DAILY_LIMIT) {
      return rateLimitResponse(
        "تعداد درخواست‌های امروز شما به سقف مجاز رسیده است. لطفاً فردا دوباره تلاش کنید.",
        24 * 60 * 60
      );
    }

    if (ip && ipHourCount >= PER_IP_HOURLY_LIMIT) {
      return rateLimitResponse(
        "تعداد درخواست‌ها از این شبکه زیاد است. لطفاً بعداً دوباره تلاش کنید.",
        60 * 60
      );
    }

    // Log request before sending (helps prevent race spam)
    await OtpRequest.create({
      mobile: normalizedMobile,
      purpose: "login",
      ip,
      userAgent: userAgent || null,
    });

    // Generate 5 digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    await OTP.create({
      mobile: normalizedMobile,
      code,
      expiresAt,
    });

    // Send SMS
    const result = await sendOtp(normalizedMobile, code);
    
    if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
