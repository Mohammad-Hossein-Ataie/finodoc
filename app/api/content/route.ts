import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Content from "@/lib/models/Content";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const tagId = searchParams.get('tagId');

  const query: any = {};
  if (tagId) {
    query.tags = tagId;
  }

  const content = await Content.find(query).populate('tags').sort({ createdAt: -1 });
  return NextResponse.json(content);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();
    const content = await Content.create({ ...body, uploadedBy: session.userId });
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: "Error creating content" }, { status: 500 });
  }
}
