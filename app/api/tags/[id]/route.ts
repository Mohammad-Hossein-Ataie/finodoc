import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Tag from "@/lib/models/Tag";
import { getSession } from "@/lib/auth";

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
