'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LetterTagger() {
  const [letters, setLetters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLetters = async (q = '') => {
    setLoading(true);
    const res = await fetch(`/api/letters?q=${q}&pageSize=10`);
    const data = await res.json();
    setLetters(data.items);
    setLoading(false);
  };

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data);
  };

  useEffect(() => {
    fetchTags();
    fetchLetters();
  }, []);

  const handleSearch = () => {
    fetchLetters(search);
  };

  const openTagModal = (letter: any) => {
    setSelectedLetter(letter);
    // Pre-select existing tags if available (need to fetch or have in letter object)
    // Assuming letter.tags is populated or array of IDs
    setSelectedTags(letter.tags || []);
  };

  const saveTags = async () => {
    if (!selectedLetter) return;
    
    await fetch(`/api/letters/${selectedLetter.tracingNo}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: selectedTags }),
    });

    setSelectedLetter(null);
    fetchLetters(search); // Refresh
  };

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter(t => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">تگ‌گذاری اطلاعیه‌ها</h2>
      
      <div className="flex gap-2 mb-4">
        <Input 
            placeholder="جستجو در نماد، شرکت یا عنوان..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
        />
        <Button onClick={handleSearch}>جستجو</Button>
      </div>

      <div className="border rounded-md mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">نماد</TableHead>
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">تگ‌ها</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.map((letter) => (
              <TableRow key={letter.tracingNo}>
                <TableCell>{letter.symbol}</TableCell>
                <TableCell>{letter.title}</TableCell>
                <TableCell>
                    {letter.tags && letter.tags.length > 0 ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {letter.tags.length} تگ
                        </span>
                    ) : '-'}
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => openTagModal(letter)}>ویرایش تگ</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h3 className="font-bold mb-4">تگ‌گذاری: {selectedLetter.symbol}</h3>
                <div className="flex flex-wrap gap-2 mb-6 max-h-60 overflow-y-auto">
                    {tags.map(tag => (
                        <div 
                            key={tag._id} 
                            onClick={() => toggleTag(tag._id)}
                            className={`cursor-pointer px-3 py-1 rounded border ${selectedTags.includes(tag._id) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}
                        >
                            {tag.name}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedLetter(null)}>انصراف</Button>
                    <Button onClick={saveTags}>ذخیره</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
