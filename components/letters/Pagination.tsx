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
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        مجموع: {formatNumber(totalCount)} رکورد
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <span className="sr-only">اولین صفحه</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <span className="sr-only">صفحه قبل</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center text-sm font-medium w-[100px]">
          صفحه {formatNumber(page)} از {formatNumber(totalPages)}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <span className="sr-only">صفحه بعد</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <span className="sr-only">آخرین صفحه</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
