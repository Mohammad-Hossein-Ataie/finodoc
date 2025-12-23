'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/useLetters';
import LettersTable from '@/components/letters/LettersTable';
import LettersFilters from '@/components/letters/LettersFilters';
import Pagination from '@/components/letters/Pagination';
import { SortingState } from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { FilterParams } from '@/lib/types';

export default function LettersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse params
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '25');
  const q = searchParams.get('q') || '';
  const sortBy = (searchParams.get('sortBy') as any) || 'publishDateTimeUtc';
  const sortDir = (searchParams.get('sortDir') as any) || 'desc';

  const filters: FilterParams = {
    page,
    pageSize,
    q,
    sortBy,
    sortDir,
    hasPdf: searchParams.get('hasPdf') === 'true' || undefined,
    hasExcel: searchParams.get('hasExcel') === 'true' || undefined,
    hasAttachment: searchParams.get('hasAttachment') === 'true' || undefined,
    hasHtml: searchParams.get('hasHtml') === 'true' || undefined,
    hasXbrl: searchParams.get('hasXbrl') === 'true' || undefined,
    isEstimate: searchParams.get('isEstimate') === 'true' || undefined,
    underSupervision: searchParams.get('underSupervision') === '1' || undefined,
    letterCode: searchParams.get('letterCode') || undefined,
    symbol: searchParams.get('symbol') || undefined,
    companyName: searchParams.get('companyName') || undefined,
    tags: searchParams.get('tags') || undefined,
    industryId: searchParams.get('industryId') || undefined,
    letterCategoryCode: searchParams.get('letterCategoryCode') || undefined,
    publisherTypeCode: searchParams.get('publisherTypeCode') || undefined,
    letterTypeId: searchParams.get('letterTypeId') || undefined,
  };

  const { data, isLoading, isError, isFetching } = useLetters(filters);

  // Sorting state for the table
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortBy, desc: sortDir === 'desc' },
  ]);

  // Sync table sorting with URL
  const handleSortingChange = (updaterOrValue: any) => {
    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);
    
    if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        const params = new URLSearchParams(searchParams.toString());
        params.set('sortBy', id);
        params.set('sortDir', desc ? 'desc' : 'asc');
        router.push(`/letters?${params.toString()}`);
    }
  };

  const handlePageChange = (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/letters?${params.toString()}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-[1600px]">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <aside className="w-full md:w-72 flex-shrink-0 sticky top-4">
            <LettersFilters isLoading={isLoading || isFetching} />
        </aside>
        <main className="flex-1 min-w-0 space-y-4">
            <LettersTable
            data={data?.items || []}
            isLoading={isLoading || isFetching}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            />
            {data && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    totalCount={data.totalCount}
                    onPageChange={handlePageChange}
                />
            )}
        </main>
      </div>
    </div>
  );
}
