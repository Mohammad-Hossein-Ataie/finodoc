import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getSession } from '@/lib/auth';
import Tag from '@/lib/models/Tag';
import Letter from '@/lib/models/Letter';

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const allTags = await Tag.find({}).select({ name: 1, group: 1 }).lean();

  // Count number of letters (codal_letters) that have each tag.
  const counts = await Letter.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  for (const c of counts) {
    if (c?._id) countMap.set(String(c._id), Number(c.count) || 0);
  }

  const result = allTags
    .map((t: any) => ({
      _id: String(t._id),
      name: t.name,
      group: t.group || 'General',
      // Backward-compatible: older UI expects contentCount.
      // New UI should use letterCount.
      letterCount: countMap.get(String(t._id)) || 0,
      contentCount: countMap.get(String(t._id)) || 0,
    }))
    .sort((a, b) => {
      if (a.group === b.group) return a.name.localeCompare(b.name, 'fa');
      return a.group.localeCompare(b.group, 'fa');
    });

  return NextResponse.json(result);
}
