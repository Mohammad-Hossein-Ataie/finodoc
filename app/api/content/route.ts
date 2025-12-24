import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Content from "@/lib/models/Content";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const tagId = searchParams.get('tagId');
  const tagIdsRaw = searchParams.get('tagIds') || searchParams.get('tags');

  const query: any = {};
  if (tagIdsRaw) {
    const tagIds = tagIdsRaw.split(',').map(s => s.trim()).filter(Boolean);
    if (tagIds.length > 0) query.tags = { $all: tagIds };
  } else if (tagId) {
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
    // Properly handle the userId - it might be a string representation of ObjectId or the ObjectId itself
    const userId = typeof session.userId === 'string' ? session.userId : session.userId?.toString();
    
    // Log for debugging
    console.log('Session userId:', session.userId, 'Type:', typeof session.userId);
    console.log('Content body:', body);
    
    const content = await Content.create({ ...body, uploadedBy: userId });
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Content creation error:', error);
    return NextResponse.json({ 
      error: "Error creating content",
      details: error.message 
    }, { status: 500 });
  }
}
