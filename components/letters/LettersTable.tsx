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
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, FileSpreadsheet, Paperclip, Eye, AlertTriangle, PlayCircle, MessageSquare } from 'lucide-react';
import { toPersianDigits, buildCodalUrl } from '@/lib/utils';
import { useMemo, useState } from 'react';
import ContentPlayer from '@/components/ContentPlayer';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

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
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[] | null>(null);

  const renderActions = (letter: CodalLetter) => (
    <div className="flex items-center gap-2">
      <MessageSquare className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      {letter.hasAttachment ? <Paperclip className="h-4 w-4 text-gray-500" /> : null}
      {letter.hasPdf ? (
        <a
          href={buildCodalUrl(letter.pdfUrl)}
          target="_blank"
          className="hover:scale-110 transition-transform"
          rel="noreferrer"
        >
          <FileText className="h-4 w-4 text-red-500" />
        </a>
      ) : null}
      {letter.hasExcel ? (
        <a
          href={letter.excelUrl}
          target="_blank"
          className="hover:scale-110 transition-transform"
          rel="noreferrer"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-500" />
        </a>
      ) : null}
      <Eye
        className="h-4 w-4 text-gray-500 cursor-pointer hover:text-blue-500"
        onClick={() => router.push(`/letters/${letter.tracingNo}`)}
      />
      {letter.tags && letter.tags.length > 0 ? (
        <PlayCircle
          className="h-5 w-5 text-purple-600 cursor-pointer hover:scale-110"
          onClick={() => setSelectedTags(letter.tags as any)}
        />
      ) : null}
    </div>
  );

  const columns = useMemo<ColumnDef<CodalLetter>[]>(
    () => [
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex space-x-1 space-x-reverse items-center justify-center">
             <MessageSquare className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
             {row.original.hasAttachment ? <Paperclip className="h-4 w-4 text-gray-500" /> : <div className="w-4" />}
             {row.original.hasPdf ? (
              <a href={buildCodalUrl(row.original.pdfUrl)} target="_blank" className="hover:scale-110 transition-transform">
                <FileText className="h-4 w-4 text-red-500" />
              </a>
            ) : <div className="w-4" />}
            {row.original.hasExcel ? (
              <a href={row.original.excelUrl} target="_blank" className="hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-4 w-4 text-green-500" />
              </a>
            ) : <div className="w-4" />}
             <Eye 
               className="h-4 w-4 text-gray-500 cursor-pointer hover:text-blue-500" 
               onClick={() => router.push(`/letters/${row.original.tracingNo}`)}
             />
            {/* Media Icon */}
            {row.original.tags && row.original.tags.length > 0 && (
                <PlayCircle 
                    className="h-5 w-5 text-purple-600 cursor-pointer hover:scale-110" 
                    onClick={() => setSelectedTags(row.original.tags as any)}
                />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'publishDateTimeUtc', 
        header: 'زمان انتشار',
        cell: ({ row }) => <span className="whitespace-nowrap text-[11px]">{toPersianDigits(row.original.publishDateTimeJalali)}</span>,
      },
      {
        accessorKey: 'sentDateTimeJalali',
        header: 'زمان ارسال',
        cell: ({ row }) => <span className="whitespace-nowrap text-[11px]">{toPersianDigits(row.original.sentDateTimeJalali || '')}</span>,
      },
      {
        accessorKey: 'letterCode',
        header: 'کد',
        cell: ({ row }) => <span className="text-[11px]">{row.original.letterCode}</span>,
      },
      {
        accessorKey: 'title',
        header: 'عنوان اطلاعیه',
        cell: ({ row }) => (
          <div className="text-[11px] font-medium text-[#0056b3] hover:underline cursor-pointer" title={row.original.title}>
            {row.original.title}
            {row.original.underSupervision === 1 && <AlertTriangle className="inline h-3 w-3 text-red-500 mr-1" />}
          </div>
        ),
      },
      {
        accessorKey: 'companyName',
        header: 'نام شرکت',
        cell: ({ row }) => <span className="text-[11px] text-gray-700">{row.original.companyName}</span>,
      },
      {
        accessorKey: 'symbol',
        header: 'نماد',
        cell: ({ row }) => <span className="font-bold text-[#0056b3] text-[11px]">{row.original.symbol}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full">
      {/* Mobile/Tablet: Card list (no zoom needed) */}
      <div className="space-y-2 lg:hidden">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border border-gray-200 shadow-sm">
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-4 w-[60%]" />
              </CardContent>
            </Card>
          ))
        ) : data?.length ? (
          data.map((letter) => (
            <Card key={String(letter.tracingNo)} className="border border-gray-200 shadow-sm">
              <CardContent className="p-3 space-y-2">
                <div
                  className="text-sm font-medium text-[#0056b3] leading-6 cursor-pointer"
                  title={letter.title}
                  onClick={() => router.push(`/letters/${letter.tracingNo}`)}
                >
                  {letter.title}
                  {letter.underSupervision === 1 && (
                    <AlertTriangle className="inline h-4 w-4 text-red-500 mr-1" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">نماد</span>
                    <span className="font-bold text-[#0056b3]">{letter.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-gray-500">کد</span>
                    <span className="font-medium">{letter.letterCode}</span>
                  </div>
                  <div className="col-span-2 text-gray-700">
                    <span className="text-gray-500">شرکت: </span>
                    <span>{letter.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">انتشار</span>
                    <span className="whitespace-nowrap">{toPersianDigits(letter.publishDateTimeJalali)}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-gray-500">ارسال</span>
                    <span className="whitespace-nowrap">{toPersianDigits(letter.sentDateTimeJalali || '')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {renderActions(letter)}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 text-center text-sm text-gray-600">موردی یافت نشد.</CardContent>
          </Card>
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block rounded-none border-t border-l border-r border-gray-300 bg-white">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-[#007bff]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-[#007bff] border-b-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-center h-8 px-2 sm:px-3 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0"
                    >
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
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-[80%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`hover:bg-[#e6f2ff] transition-colors border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f9f9f9]'}`}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isRightAligned = ['title', 'companyName'].includes(cell.column.id);
                    return (
                      <TableCell
                        key={cell.id}
                        className={`py-1 px-2 border-l border-gray-200 last:border-l-0 ${isRightAligned ? 'text-right' : 'text-center'}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  موردی یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {selectedTags && (
        <ContentPlayer 
            tags={selectedTags} 
            isOpen={!!selectedTags} 
            onClose={() => setSelectedTags(null)} 
        />
      )}
    </div>
  );
}
