import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Tag from "@/lib/models/Tag";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
  const group = typeof body?.group === 'string' ? body.group.trim() : undefined;

  const update: Record<string, any> = {};
  if (name !== undefined) update.name = name;
  if (group !== undefined) update.group = group || 'General';

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  try {
    await dbConnect();
    const tag = await Tag.findByIdAndUpdate(params.id, { $set: update }, { new: true, runValidators: true });
    if (!tag) return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    return NextResponse.json(tag);
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "این نام تگ قبلاً استفاده شده است." }, { status: 409 });
    }
    return NextResponse.json({ error: "Error updating tag" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    await Tag.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting tag" }, { status: 500 });
  }
}
