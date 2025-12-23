'use client';

import { CodalLetter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildCodalUrl, formatNumber, toPersianDigits } from '@/lib/utils';
import { FileText, FileSpreadsheet, Paperclip, ExternalLink, Calendar, Building, Tag, Play, Music, Share2, Check } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function LetterDetail({ letter }: { letter: CodalLetter }) {
  const hasTags = Array.isArray((letter as any)?.tags) && (letter as any).tags.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl leading-8">{letter.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {letter.companyName} ({letter.symbol})
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">{letter.letterCode}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">تاریخ انتشار:</span>
                  <span className="font-medium">{toPersianDigits(letter.publishDateTimeJalali)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">تاریخ ارسال:</span>
                  <span className="font-medium">{toPersianDigits(letter.sentDateTimeJalali)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">شماره پیگیری:</span>
                  <span className="font-medium">{toPersianDigits(letter.tracingNo)}</span>
                </div>
                {letter.underSupervision === 1 && (
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">تحت نظارت</span>
                    </div>
                )}
              </div>

              {letter.superVision && letter.superVision.Reasons.length > 0 && (
                  <div className="mt-4 p-4 bg-destructive/10 rounded-md text-sm text-destructive">
                      <strong>دلایل تحت نظارت:</strong>
                      <ul className="list-disc list-inside mt-2">
                          {letter.superVision.Reasons.map((r: any, i: number) => (
                              <li key={i}>{r}</li>
                          ))}
                      </ul>
                  </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={buildCodalUrl(letter.url)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="ml-2 h-4 w-4" />
                  مشاهده در کدال
                </a>
              </Button>
              
              {letter.hasPdf && (
                <Button variant="outline" asChild>
                  <a href={buildCodalUrl(letter.pdfUrl)} target="_blank" rel="noopener noreferrer">
                    <FileText className="ml-2 h-4 w-4 text-red-500" />
                    دانلود PDF
                  </a>
                </Button>
              )}
              
              {letter.hasExcel && (
                <Button variant="outline" asChild>
                  <a href={letter.excelUrl} target="_blank" rel="noopener noreferrer">
                    <FileSpreadsheet className="ml-2 h-4 w-4 text-green-500" />
                    دانلود اکسل
                  </a>
                </Button>
              )}

              {letter.hasAttachment && (
                <Button variant="outline" asChild>
                  <a href={buildCodalUrl(letter.attachmentUrl)} target="_blank" rel="noopener noreferrer">
                    <Paperclip className="ml-2 h-4 w-4 text-blue-500" />
                    دانلود پیوست
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>

          {hasTags && (
            <EducationalContentSection tags={(letter as any).tags} />
          )}

          {/* CODAL Preview Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">نمایش صفحه کدال</CardTitle>
              <CardDescription>
                پیش‌نمایش مستقیم صفحه اطلاعیه در کدال
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[600px] border rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={buildCodalUrl(letter.url)}
                  className="absolute inset-0 w-full h-full"
                  title="CODAL Letter Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';

function normalizeTagIds(rawTags: unknown): string[] {
  if (!Array.isArray(rawTags)) return [];

  return rawTags
    .map((t: any) => {
      if (!t) return '';
      if (typeof t === 'string') return t;
      if (typeof t?.toString === 'function') return t.toString();
      if (typeof t?.$oid === 'string') return t.$oid;
      return String(t);
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

function getContentIcon(type: string) {
  if (type === 'video') return <Play className="h-5 w-5 text-blue-500" />;
  if (type === 'audio') return <Music className="h-5 w-5 text-green-500" />;
  return <FileText className="h-5 w-5 text-orange-500" />;
}

function EducationalContentSection({ tags }: { tags: unknown }) {
  const tagIds = useMemo(() => normalizeTagIds(tags), [tags]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Check auth first
      try {
        const meRes = await fetch('/api/auth/me');
        const me = await meRes.json();
        if (cancelled) return;
        setUser(me.user);

        if (!me.user) return;
        if (tagIds.length === 0) return;

        setLoading(true);
        const allContent: any[] = [];

        for (const tagId of tagIds) {
          const res = await fetch(`/api/content?tagId=${encodeURIComponent(tagId)}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (Array.isArray(data)) allContent.push(...data);
        }

        const unique = Array.from(new Map(allContent.map((item) => [item._id, item])).values());
        if (!cancelled) setContents(unique);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [tagIds]);

  const handleShare = async (content: any) => {
    const shareData = {
      title: content.title,
      text: `محتوای فینوداک: ${content.title}`,
      url: content.url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(content.url);
      setCopiedId(content._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">محتوای آموزشی و تحلیلی</CardTitle>
        <CardDescription>
          محتواهای مرتبط با این اطلاعیه (بر اساس تگ‌ها)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">برای مشاهده محتوای آموزشی باید وارد شوید.</p>
            <Button asChild>
              <Link href="/login">ورود / ثبت نام</Link>
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-6 text-sm text-muted-foreground">در حال بارگذاری...</div>
        ) : contents.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">محتوایی یافت نشد.</div>
        ) : (
          <div className="space-y-4">
            {contents.map((content) => (
              <div key={content._id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded">
                    {getContentIcon(content.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-sm truncate">{content.title}</h3>
                      <button
                        onClick={() => handleShare(content)}
                        className="group relative inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        type="button"
                      >
                        {copiedId === content._id ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span>اشتراک</span>
                          </>
                        )}
                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                          اشتراک یا کپی لینک
                        </span>
                      </button>
                    </div>
                    <div className="mt-3">
                      {content.type === 'video' ? (
                        <video controls className="w-full max-h-72 bg-black rounded" src={content.url} />
                      ) : content.type === 'audio' ? (
                        <audio controls className="w-full" src={content.url} />
                      ) : (
                        <a href={content.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">
                          مشاهده فایل/متن
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
