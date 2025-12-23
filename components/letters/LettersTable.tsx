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
  const [selectedTags, setSelectedTags] = useState<string[] | null>(null);

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
             <Eye className="h-4 w-4 text-gray-500 cursor-pointer hover:text-blue-500" />
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
    <div className="rounded-none border-t border-l border-r border-gray-300 bg-white">
      <Table>
        <TableHeader className="bg-[#007bff]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-[#007bff] border-b-0">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-center h-8 text-[11px] font-bold text-white border-l border-white/20 last:border-l-0">
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
                    <TableCell key={cell.id} className={`py-1 px-2 border-l border-gray-200 last:border-l-0 ${isRightAligned ? 'text-right' : 'text-center'}`}>
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
