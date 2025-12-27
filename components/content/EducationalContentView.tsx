'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import type { ContentItem, ContentType } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, toPersianDigits } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

type MeResponse = { user: null | { _id: string; name?: string; mobile?: string; role?: string; email?: string } };

async function fetchMe(): Promise<MeResponse> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) return { user: null };
  return res.json();
}

function toPersianContentType(type: ContentType): string {
  if (type === 'video') return 'فیلم';
  if (type === 'audio') return 'صوت';
  return 'نوشته';
}

export default function EducationalContentView({ onBack }: { onBack: () => void }) {
  const router = useRouter();

  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const isLoggedIn = !!meData?.user;

  const [draftFilters, setDraftFilters] = useState({
    q: '',
    category: '',
    type: '',
  });

  const [filters, setFilters] = useState(draftFilters);

  const queryParams = useMemo(
    () => ({
      q: filters.q,
      category: filters.category,
      type: filters.type,
    }),
    [filters]
  );

  const { data, isLoading, isFetching } = useContent(queryParams, { enabled: isLoggedIn });

  const items: ContentItem[] = Array.isArray(data) ? data : [];

  return (
    <div className="w-full relative">
      <div className={`flex flex-col md:flex-row gap-4 items-start ${!isLoggedIn && !meLoading ? 'blur-sm' : ''}`}>
        <aside className="w-full md:w-72 flex-shrink-0 lg:sticky lg:top-20">
          <Card className="h-fit bg-white border border-gray-200 shadow-sm">
            <CardHeader className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2 text-[#2c3e50] font-bold">
                <Filter className="w-5 h-5" />
                <span>فیلترهای مطالب آموزشی</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">عنوان آموزش:</label>
                <Input
                  className="h-9 text-sm bg-white"
                  value={draftFilters.q}
                  onChange={(e) => setDraftFilters({ ...draftFilters, q: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">دسته بندی:</label>
                <Input
                  className="h-9 text-sm bg-white"
                  value={draftFilters.category}
                  onChange={(e) => setDraftFilters({ ...draftFilters, category: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">نوع محتوا:</label>
                <Select
                  value={draftFilters.type}
                  onChange={(e) => setDraftFilters({ ...draftFilters, type: e.target.value })}
                >
                  <option value="">همه موارد</option>
                  <option value="video">فیلم</option>
                  <option value="audio">صوت</option>
                  <option value="text">نوشته</option>
                  <option value="rich-text">نوشته</option>
                  <option value="pdf">نوشته</option>
                </Select>
              </div>

              <div className="pt-2 border-t">
                <Button
                  className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white"
                  onClick={() => setFilters(draftFilters)}
                >
                  جستجو
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0 space-y-4">
          <div className="rounded-none border-t border-l border-r border-gray-300 bg-white">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-[#007bff]">
                <TableRow className="hover:bg-[#007bff] border-b-0">
                  <TableHead className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
                    عنوان آموزش
                  </TableHead>
                  <TableHead className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
                    تاریخ انتشار
                  </TableHead>
                  <TableHead className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
                    دسته بندی
                  </TableHead>
                  <TableHead className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
                    نوع محتوا
                  </TableHead>
                  <TableHead className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
                    تعداد بازدید
                  </TableHead>
                  <TableHead className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
                    امتیاز مطلب
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading || isFetching ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-2 px-2 border-l border-gray-200 last:border-l-0">...</TableCell>
                      <TableCell className="py-2 px-2 border-l border-gray-200 last:border-l-0">...</TableCell>
                      <TableCell className="py-2 px-2 border-l border-gray-200 last:border-l-0">...</TableCell>
                      <TableCell className="py-2 px-2 border-l border-gray-200 last:border-l-0">...</TableCell>
                      <TableCell className="py-2 px-2 border-l border-gray-200 last:border-l-0">...</TableCell>
                      <TableCell className="py-2 px-2 border-l border-gray-200 last:border-l-0">...</TableCell>
                    </TableRow>
                  ))
                ) : items.length ? (
                  items.map((item, idx) => (
                    <TableRow
                      key={item._id}
                      className={`hover:bg-[#e6f2ff] transition-colors border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]'}`}
                    >
                      <TableCell className="py-1 px-2 border-l border-gray-200 last:border-l-0 text-right">
                        <span className="text-[11px] font-medium text-[#0056b3]">{item.title}</span>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-l border-gray-200 last:border-l-0 text-center">
                        <span className="whitespace-nowrap text-[11px]">
                          {item.createdAt ? toPersianDigits(new Date(item.createdAt).toLocaleDateString('fa-IR')) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-l border-gray-200 last:border-l-0 text-center">
                        <span className="text-[11px]">{item.category || '-'}</span>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-l border-gray-200 last:border-l-0 text-center">
                        <span className="text-[11px]">{toPersianContentType(item.type)}</span>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-l border-gray-200 last:border-l-0 text-center">
                        <span className="text-[11px]">{formatNumber(item.viewsCount ?? 0)}</span>
                      </TableCell>
                      <TableCell className="py-1 px-2 border-l border-gray-200 last:border-l-0 text-center">
                        <span className="text-[11px]">{formatNumber(item.rating ?? 0)}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm">
                      موردی یافت نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {!isLoggedIn && !meLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="p-4 border-b bg-gray-50">
                <div className="text-[#2c3e50] font-bold text-center">دسترسی به مطالب آموزشی</div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="text-sm text-gray-700 text-center">
                  برای دیدن محتوای آموزشی باید وارد شوید.
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[#007bff] hover:bg-[#0056b3] text-white"
                    onClick={() => router.push('/login')}
                  >
                    ثبت نام
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                  >
                    بازگشت
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  با دکمه بازگشت به تب جستجو برگردید.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
