'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TagManager() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    await fetch('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name, group: group || 'General' }),
    });
    setName('');
    setGroup('');
    fetchTags();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    fetchTags();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">مدیریت تگ‌ها</h2>
      
      <div className="flex gap-4 mb-6 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">نام تگ</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلا: صورت مالی" />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">گروه</label>
          <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="مثلا: مالی" />
        </div>
        <Button onClick={handleCreate} disabled={loading}>افزودن تگ</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نام تگ</TableHead>
              <TableHead className="text-right">گروه</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag._id}>
                <TableCell>{tag.name}</TableCell>
                <TableCell>{tag.group}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(tag._id)}>حذف</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
