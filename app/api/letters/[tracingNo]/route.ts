import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { tracingNo: string } }
) {
  try {
    const tracingNo = parseInt(params.tracingNo);
    
    if (isNaN(tracingNo)) {
        return NextResponse.json({ error: 'Invalid tracingNo' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME || 'codal_letters');

    const letter = await collection.findOne({ tracingNo: tracingNo });

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    return NextResponse.json(letter);

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
