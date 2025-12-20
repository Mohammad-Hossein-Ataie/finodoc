'use client';

import { useLetter } from '@/hooks/useLetters';
import LetterDetail from '@/components/letters/LetterDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LetterDetailPage({ params }: { params: { tracingNo: string } }) {
  const { data: letter, isLoading, isError } = useLetter(params.tracingNo);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
    );
  }

  if (isError || !letter) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">خطا در دریافت اطلاعات</h2>
            <Button asChild>
                <Link href="/letters">بازگشت به لیست</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
            <Link href="/letters">
                <ArrowRight className="ml-2 h-4 w-4" />
                بازگشت
            </Link>
        </Button>
      </div>
      <LetterDetail letter={letter} />
    </div>
  );
}
