import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection('codal_letters');

    // We can run multiple aggregations or counts in parallel
    const [
        hasPdfCount,
        hasExcelCount,
        underSupervisionCount,
        topLetterCodes
    ] = await Promise.all([
        collection.countDocuments({ hasPdf: true }),
        collection.countDocuments({ hasExcel: true }),
        collection.countDocuments({ underSupervision: 1 }), // Assuming 1 means under supervision
        collection.aggregate([
            { $group: { _id: "$letterCode", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray()
    ]);

    return NextResponse.json({
        hasPdf: hasPdfCount,
        hasExcel: hasExcelCount,
        underSupervision: underSupervisionCount,
        topLetterCodes
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
