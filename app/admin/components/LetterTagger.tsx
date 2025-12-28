'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/components/letters/Pagination';

function formatLetterDate(letter: any) {
  if (letter?.publishDateTimeJalali) return String(letter.publishDateTimeJalali);
  const utc = letter?.publishDateTimeUtc;
  if (!utc) return '-';
  const d = new Date(utc);
  if (Number.isNaN(d.getTime())) return '-';
  try {
    return d.toLocaleDateString('fa-IR');
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export default function LetterTagger() {
  const [letters, setLetters] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [initialTags, setInitialTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchLetters = async ({ q = '', page: nextPage = 1 }: { q?: string; page?: number } = {}) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(nextPage));
    params.set('pageSize', String(pageSize));
    if (q.trim()) params.set('q', q.trim());

    const res = await fetch(`/api/letters?${params.toString()}`);
    const data = await res.json();
    setLetters(Array.isArray(data?.items) ? data.items : []);
    setPage(typeof data?.page === 'number' ? data.page : nextPage);
    setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 1);
    setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : 0);
    setLoading(false);
  };

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data);
  };

  useEffect(() => {
    fetchTags();
    fetchLetters({ page: 1 });
  }, []);

  const handleSearch = () => {
    fetchLetters({ q: search, page: 1 });
  };

  const openTagModal = (letter: any) => {
    setSelectedLetter(letter);
    // Pre-select existing tags if available (need to fetch or have in letter object)
    // Assuming letter.tags is populated or array of IDs
    const rawTags = Array.isArray(letter?.tags) ? letter.tags : [];
    const normalizedTags = rawTags
      .map((t: any) => {
        if (!t) return '';
        if (typeof t === 'string') return t;
        if (typeof t?.toString === 'function') return t.toString();
        if (typeof t?.$oid === 'string') return t.$oid;
        return String(t);
      })
      .map((s: string) => s.trim())
      .filter(Boolean);

    setSelectedTags(normalizedTags);
    setInitialTags(normalizedTags);
  };

  const saveTags = async () => {
    if (!selectedLetter) return;

    const initialSet = new Set(initialTags);
    const selectedSet = new Set(selectedTags);

    const toAdd = selectedTags.filter((id) => !initialSet.has(id));
    const toRemove = initialTags.filter((id) => !selectedSet.has(id));

    if (toAdd.length > 0) {
      await fetch(`/api/letters/${selectedLetter.tracingNo}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: toAdd }),
      });
    }

    if (toRemove.length > 0) {
      await fetch(`/api/letters/${selectedLetter.tracingNo}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: toRemove }),
      });
    }

    setSelectedLetter(null);
    setSelectedTags([]);
    setInitialTags([]);
    fetchLetters({ q: search, page: 1 }); // Refresh
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
              <TableHead className="text-right">کد اطلاعیه</TableHead>
              <TableHead className="text-right">کد نامه</TableHead>
              <TableHead className="text-right">نماد</TableHead>
              <TableHead className="text-right">شرکت</TableHead>
              <TableHead className="text-right">عنوان</TableHead>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">تگ‌ها</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-96" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-56" /></TableCell>
                  </TableRow>
                ))
              : letters.map((letter) => (
                  <TableRow key={letter.tracingNo}>
                    <TableCell className="font-medium">{letter.tracingNo ?? '-'}</TableCell>
                    <TableCell>{letter.letterCode ?? '-'}</TableCell>
                    <TableCell>{letter.symbol}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={letter.companyName || ''}>
                      {letter.companyName || '-'}
                    </TableCell>
                    <TableCell>{letter.title}</TableCell>
                    <TableCell>{formatLetterDate(letter)}</TableCell>
                    <TableCell>
                        {letter.tags && letter.tags.length > 0 ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap inline-flex items-center">
                          {letter.tags.length} تگ
                        </span>
                        ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="w-28 justify-center" asChild>
                          <Link href={`/letters/${letter.tracingNo}`} target="_blank" rel="noopener noreferrer">
                            نمای اطلاعیه
                          </Link>
                        </Button>
                        <Button size="sm" className="w-28 justify-center" onClick={() => openTagModal(letter)}>
                          ویرایش تگ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={(p) => fetchLetters({ q: search, page: p })}
      />

      {selectedLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <div className="mb-4 space-y-1">
                  <h3 className="font-bold">تگ‌گذاری: {selectedLetter.symbol}</h3>
                  <div className="text-sm text-muted-foreground">
                    کد اطلاعیه: {selectedLetter.tracingNo ?? '-'} · کد نامه: {selectedLetter.letterCode ?? '-'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate" title={selectedLetter.title || ''}>
                    {selectedLetter.title || ''}
                  </div>
                  <div className="pt-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/letters/${selectedLetter.tracingNo}`} target="_blank" rel="noopener noreferrer">
                        نمای اطلاعیه
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm font-medium mb-2">همه تگ‌ها</div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                      {tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag._id);
                        return (
                          <div
                            key={tag._id}
                            onClick={() => toggleTag(tag._id)}
                            className={`cursor-pointer px-3 py-1 rounded border whitespace-nowrap inline-flex items-center gap-2 ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300'}`}
                            role="button"
                            aria-pressed={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') toggleTag(tag._id);
                            }}
                          >
                            <span>{tag.name}</span>
                            {isSelected ? <span className="text-white/90">×</span> : null}
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedLetter(null);
                        setSelectedTags([]);
                        setInitialTags([]);
                      }}
                    >
                      انصراف
                    </Button>
                    <Button onClick={saveTags}>ذخیره</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
