'use client';

import { CodalLetter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buildCodalUrl, formatNumber, toPersianDigits } from '@/lib/utils';
import { FileText, FileSpreadsheet, Paperclip, ExternalLink, Calendar, Building, Tag } from 'lucide-react';
import Link from 'next/link';

export default function LetterDetail({ letter }: { letter: CodalLetter }) {
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
