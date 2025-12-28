import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

type DropdownOptionsDoc = {
  _id: string;
  updatedAt?: Date | string | { $date: string };
  markets?: string[];
  boards?: string[];
  industries?: string[];
  symbols?: string[];
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection<DropdownOptionsDoc>('dropdown_options');

    const doc = await collection.findOne(
      { _id: 'main_options' },
      {
        projection: {
          _id: 1,
          updatedAt: 1,
          markets: 1,
          boards: 1,
          industries: 1,
          symbols: 1,
        },
      }
    );

    if (!doc) {
      return NextResponse.json({ error: 'main_options not found' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}
