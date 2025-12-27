'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: PaginationProps) {
  const clampedPage = Math.max(1, Math.min(page, totalPages || 1));

  const getPageItems = () => {
    if (totalPages <= 1) return [1];

    const windowSize = 2; // pages around current
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);

    for (let p = clampedPage - windowSize; p <= clampedPage + windowSize; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const items: Array<number | 'ellipsis'> = [];
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const prev = sorted[i - 1];
      if (i > 0 && prev !== undefined && current - prev > 1) {
        items.push('ellipsis');
      }
      items.push(current);
    }
    return items;
  };

  const pageItems = getPageItems();

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        مجموع: {formatNumber(totalCount)} رکورد
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={clampedPage === 1}
        >
          <span className="sr-only">اولین صفحه</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(clampedPage - 1)}
          disabled={clampedPage === 1}
        >
          <span className="sr-only">صفحه قبل</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pageItems.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span key={`e-${idx}`} className="px-2 text-sm text-muted-foreground select-none">
                  …
                </span>
              );
            }

            const p = item;
            const isActive = p === clampedPage;
            return (
              <Button
                key={p}
                variant={isActive ? 'default' : 'outline'}
                className={`h-8 min-w-8 px-2 ${isActive ? 'bg-[#007bff] hover:bg-[#0056b3]' : ''}`}
                onClick={() => onPageChange(p)}
                disabled={p === clampedPage}
              >
                {formatNumber(p)}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(clampedPage + 1)}
          disabled={clampedPage === totalPages}
        >
          <span className="sr-only">صفحه بعد</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={clampedPage === totalPages}
        >
          <span className="sr-only">آخرین صفحه</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
