'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table';
import { CodalLetter } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, FileSpreadsheet, Paperclip, Eye, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatNumber, toPersianDigits, buildCodalUrl } from '@/lib/utils';
import { useMemo } from 'react';

interface LettersTableProps {
  data: CodalLetter[];
  isLoading: boolean;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

export default function LettersTable({
  data,
  isLoading,
  sorting,
  onSortingChange,
}: LettersTableProps) {
  const columns = useMemo<ColumnDef<CodalLetter>[]>(
    () => [
      {
        accessorKey: 'publishDateTimeUtc', // Or fetchedAt
        header: 'تاریخ انتشار',
        cell: ({ row }) => {
            const jalali = row.original.publishDateTimeJalali;
            // Simple display of the string from DB, assuming it's correct.
            // If we want to format the Date object, we can use date-fns-jalali on publishDateTimeUtc
            return <span className="whitespace-nowrap text-xs">{toPersianDigits(jalali)}</span>;
        },
      },
      {
        accessorKey: 'symbol',
        header: 'نماد',
        cell: ({ row }) => <span className="font-bold text-primary">{row.original.symbol}</span>,
      },
      {
        accessorKey: 'companyName',
        header: 'نام شرکت',
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.companyName}</span>,
      },
      {
        accessorKey: 'title',
        header: 'عنوان اطلاعیه',
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate" title={row.original.title}>
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: 'letterCode',
        header: 'کد',
        cell: ({ row }) => <Badge variant="outline" className="text-[10px]">{row.original.letterCode}</Badge>,
      },
      {
        id: 'files',
        header: 'فایل‌ها',
        cell: ({ row }) => (
          <div className="flex space-x-1 space-x-reverse items-center">
            {row.original.hasPdf && (
              <a 
                href={buildCodalUrl(row.original.pdfUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                title="دانلود PDF"
                className="hover:scale-110 transition-transform"
              >
                <FileText className="h-4 w-4 text-red-500" />
              </a>
            )}
            {row.original.hasExcel && (
              <a 
                href={row.original.excelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                title="دانلود اکسل"
                className="hover:scale-110 transition-transform"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-500" />
              </a>
            )}
            {row.original.hasAttachment && (
              <a 
                href={buildCodalUrl(row.original.attachmentUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                title="دانلود پیوست"
                className="hover:scale-110 transition-transform"
              >
                <Paperclip className="h-4 w-4 text-blue-500" />
              </a>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'وضعیت',
        cell: ({ row }) => {
            const isUnderSupervision = row.original.underSupervision === 1;
            const isEstimate = row.original.isEstimate;
            
            if (!isUnderSupervision && !isEstimate) {
                return <span className="text-muted-foreground text-xs">-</span>;
            }

            return (
                <div className="flex flex-col gap-1">
                    {isUnderSupervision && (
                        <Badge variant="destructive" className="text-[10px] w-fit">تحت نظارت</Badge>
                    )}
                    {isEstimate && (
                        <Badge variant="secondary" className="text-[10px] w-fit">تخمین</Badge>
                    )}
                </div>
            );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/letters/${row.original.tracingNo}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: onSortingChange,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">هیچ نامه‌ای یافت نشد</h3>
              <p className="text-sm text-muted-foreground mt-2">لطفا فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.</p>
          </div>
      )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
