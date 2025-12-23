import { NextRequest, NextResponse } from "next/server";
import { getSession, logout } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}

export async function POST(req: NextRequest) {
    await logout();
    return NextResponse.json({ success: true });
}
