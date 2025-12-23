import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Letter from "@/lib/models/Letter";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { tracingNo: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tags } = await req.json(); // Array of tag IDs
    await dbConnect();
    
    // tracingNo is used as _id in the example, so params.tracingNo is tracingNo
    const tracingNo = parseInt(params.tracingNo);

    const letter = await Letter.findOneAndUpdate(
      { tracingNo: tracingNo },
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    );

    if (!letter) {
        // Try finding by _id if tracingNo didn't work (just in case)
        const letterById = await Letter.findByIdAndUpdate(
            params.tracingNo,
            { $addToSet: { tags: { $each: tags } } },
            { new: true }
        );
        if (!letterById) return NextResponse.json({ error: "Letter not found" }, { status: 404 });
        return NextResponse.json(letterById);
    }

    return NextResponse.json(letter);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating tags" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { tracingNo: string } }) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    try {
      const { tags } = await req.json(); // Array of tag IDs to remove
      await dbConnect();
      
      const tracingNo = parseInt(params.tracingNo);
  
      const letter = await Letter.findOneAndUpdate(
        { tracingNo: tracingNo },
        { $pull: { tags: { $in: tags } } },
        { new: true }
      );
  
      if (!letter) {
          return NextResponse.json({ error: "Letter not found" }, { status: 404 });
      }
  
      return NextResponse.json(letter);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Error removing tags" }, { status: 500 });
    }
  }
