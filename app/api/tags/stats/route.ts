import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getSession } from '@/lib/auth';
import Tag from '@/lib/models/Tag';
import Content from '@/lib/models/Content';

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const allTags = await Tag.find({}).select({ name: 1, group: 1 }).lean();

  const counts = await Content.aggregate([
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
      contentCount: countMap.get(String(t._id)) || 0,
    }))
    .sort((a, b) => {
      if (a.group === b.group) return a.name.localeCompare(b.name, 'fa');
      return a.group.localeCompare(b.group, 'fa');
    });

  return NextResponse.json(result);
}
