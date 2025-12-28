'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/letters/Pagination';

type Tag = { _id: string; name: string; group?: string };

type TagStat = Tag & { letterCount?: number; contentCount?: number };

type LettersResponse = {
  items: any[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

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

export default function TagReports() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TagStat[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [hasFetchedTags, setHasFetchedTags] = useState(false);
  const [hasFetchedStats, setHasFetchedStats] = useState(false);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  const [lettersResp, setLettersResp] = useState<LettersResponse>({
    items: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });
  const [loadingLetters, setLoadingLetters] = useState(false);

  const selectedTagSet = useMemo(() => new Set(selectedTags), [selectedTags]);

  const tagItems = useMemo(() => {
    if (stats.length > 0) return stats;
    return tags.map((t) => ({ ...t, letterCount: 0, contentCount: 0 }));
  }, [stats, tags]);

  const availableGroups = useMemo(() => {
    const groupSet = new Set<string>();
    for (const t of tagItems) groupSet.add(t.group || 'General');
    return Array.from(groupSet).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [tagItems]);

  const groupedTags = useMemo(() => {
    const map = new Map<string, TagStat[]>();
    for (const t of tagItems) {
      const group = t.group || 'General';
      if (groupFilter !== 'all' && group !== groupFilter) continue;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(t);
    }

    map.forEach((list) => {
      list.sort((a: TagStat, b: TagStat) => {
        const aCount = a.letterCount ?? a.contentCount ?? 0;
        const bCount = b.letterCount ?? b.contentCount ?? 0;
        const byCount = bCount - aCount;
        if (byCount !== 0) return byCount;
        return a.name.localeCompare(b.name, 'fa');
      });
    });

    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'fa'));
  }, [tagItems, groupFilter]);

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await fetch('/api/tags');
      if (!res.ok) {
        setTags([]);
        return;
      }
      const data = await res.json();
      setTags(Array.isArray(data) ? data : []);
      setHasFetchedTags(true);
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/tags/stats');
      if (!res.ok) {
        setStats([]);
        return;
      }
      const data = await res.json();
      setStats(Array.isArray(data) ? data : []);
      setHasFetchedStats(true);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLetters = async (page: number) => {
    setLoadingLetters(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(lettersResp.pageSize));
      if (search.trim()) params.set('q', search.trim());
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

      const res = await fetch(`/api/letters?${params.toString()}`);
      const data = await res.json();
      setLettersResp({
        items: Array.isArray(data?.items) ? data.items : [],
        page: typeof data?.page === 'number' ? data.page : page,
        pageSize: typeof data?.pageSize === 'number' ? data.pageSize : lettersResp.pageSize,
        totalCount: typeof data?.totalCount === 'number' ? data.totalCount : 0,
        totalPages: typeof data?.totalPages === 'number' ? data.totalPages : 1,
      });
    } finally {
      setLoadingLetters(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchStats();
    fetchLetters(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showTagReportSkeleton = !hasFetchedTags || !hasFetchedStats;

  const toggleTag = (id: string) => {
    setLettersResp((prev) => ({ ...prev, page: 1 }));
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  useEffect(() => {
    fetchLetters(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);

  const handleSearch = () => {
    fetchLetters(1);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-bold">گزارش تگ‌ها</h2>
          <div className="w-full sm:w-64">
            <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} aria-label="فیلتر گروه">
              <option value="all">همه گروه‌ها</option>
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {showTagReportSkeleton
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <Skeleton key={j} className="h-10 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))
            : groupedTags.map(([group, list]) => {
              const totalLetters = list.reduce((acc, t) => acc + (t.letterCount ?? t.contentCount ?? 0), 0);
              const maxInGroup = Math.max(1, ...list.map((t) => t.letterCount ?? t.contentCount ?? 0));

                return (
                  <Card key={group}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{group}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {list.length} تگ · {totalLetters} اطلاعیه
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {list.map((t) => {
                          const isSelected = selectedTagSet.has(t._id);
                          const tagCount = t.letterCount ?? t.contentCount ?? 0;
                          const pct = Math.round((tagCount / maxInGroup) * 100);
                          return (
                            <div
                              key={t._id}
                              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="truncate font-medium">{t.name}</div>
                                  <div className="shrink-0 text-sm text-muted-foreground">{tagCount}</div>
                                </div>
                                <div className="mt-2 h-2 w-full rounded bg-muted">
                                  <div
                                    className="h-2 rounded bg-primary"
                                    style={{ width: `${pct}%` }}
                                    aria-hidden
                                  />
                                </div>
                              </div>
                              <div className="sm:mr-3">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={isSelected ? 'default' : 'outline'}
                                  onClick={() => toggleTag(t._id)}
                                >
                                  {isSelected ? 'انتخاب شده' : 'انتخاب'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">مشاهده اطلاعیه‌ها بر اساس تگ</h2>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="جستجو در نماد، شرکت یا عنوان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={loadingLetters}>جستجو</Button>
          </div>

          <div>
            <div className="text-sm mb-2">تگ‌ها</div>
            <div className="space-y-2">
              {showTagReportSkeleton ? (
                <div className="grid gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : groupedTags.length === 0 ? (
                <div className="text-sm text-muted-foreground">تگی برای نمایش وجود ندارد.</div>
              ) : (
                <div className="grid gap-2">
                  {groupedTags.map(([group, list]) => (
                    <details key={group} className="rounded-md border" open>
                      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                        {group} <span className="text-muted-foreground">({list.length})</span>
                      </summary>
                      <div className="flex flex-wrap gap-2 px-3 pb-3">
                        {list.map((t) => {
                          const isSelected = selectedTagSet.has(t._id);
                          return (
                            <Button
                              key={t._id}
                              type="button"
                              size="sm"
                              variant={isSelected ? 'default' : 'secondary'}
                              onClick={() => toggleTag(t._id)}
                              className="h-9"
                            >
                              {t.name}
                            </Button>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="hidden md:block border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">نماد</TableHead>
                    <TableHead className="text-right">عنوان</TableHead>
                    <TableHead className="text-right">تاریخ</TableHead>
                    <TableHead className="text-right">مشاهده</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLetters
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-96" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                      ))
                    : lettersResp.items.map((letter) => (
                        <TableRow key={letter.tracingNo}>
                          <TableCell>{letter.symbol || '-'}</TableCell>
                          <TableCell>{letter.title || '-'}</TableCell>
                          <TableCell>{formatLetterDate(letter)}</TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/letters/${letter.tracingNo}`}>مشاهده</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-2">
              {loadingLetters
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-20" />
                      </CardContent>
                    </Card>
                  ))
                : lettersResp.items.map((letter) => (
                    <Card key={letter.tracingNo}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm text-muted-foreground">{letter.symbol || '-'}</div>
                          <div className="text-sm text-muted-foreground">{formatLetterDate(letter)}</div>
                        </div>
                        <div className="text-sm font-medium leading-6">
                          {letter.title || '-'}
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center justify-end">
                        <Button asChild size="sm" variant="outline" className="h-9">
                          <Link href={`/letters/${letter.tracingNo}`}>مشاهده</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>

          <Pagination
            page={lettersResp.page}
            totalPages={lettersResp.totalPages}
            totalCount={lettersResp.totalCount}
            onPageChange={(p) => fetchLetters(p)}
          />
        </div>
      </div>
    </div>
  );
}
