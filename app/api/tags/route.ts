import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Tag from "@/lib/models/Tag";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const tags = await Tag.find({}).sort({ group: 1, name: 1 });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, group } = await req.json();
    await dbConnect();
    const tag = await Tag.create({ name, group });
    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ error: "Error creating tag" }, { status: 500 });
  }
}
