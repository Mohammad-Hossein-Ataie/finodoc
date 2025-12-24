import { NextRequest, NextResponse } from "next/server";
import { getSession, login, logout } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  await dbConnect();
  const user = await User.findById((session as any).userId)
    .select({ name: 1, mobile: 1, role: 1, email: 1 })
    .lean();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      _id: String((user as any)._id),
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      email: user.email || "",
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const emailRaw = typeof body?.email === "string" ? body.email.trim() : undefined;
  const email = emailRaw ? emailRaw.toLowerCase() : emailRaw;

  const update: Record<string, any> = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email || null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  await dbConnect();
  try {
    const user = await User.findByIdAndUpdate(
      (session as any).userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select({ name: 1, mobile: 1, role: 1, email: 1 });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Refresh session cookie so server-rendered UI (e.g. Header) reflects updated name immediately.
    await login({ userId: user._id, role: user.role, name: user.name, mobile: user.mobile });

    return NextResponse.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        email: user.email || "",
      },
    });
  } catch (e: any) {
    // Handle unique constraints (e.g., email already used)
    if (e?.code === 11000) {
      return NextResponse.json({ error: "این ایمیل قبلاً استفاده شده است." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    await logout();
    return NextResponse.json({ success: true });
}
