'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useFacets } from '@/hooks/useLetters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

// I'll create simple Checkbox and Label components inline or use standard inputs if I don't want to create more files.
// Let's use standard inputs for now to save time, styled to look good.

export default function LettersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: facets } = useFacets();

  const updateFilter = (key: string, value: string | boolean | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === false || value === '') {
      params.delete(key);
    } else {
      params.set(key, value.toString());
    }
    params.set('page', '1'); // Reset page
    router.push(`/letters?${params.toString()}`);
  };

  const filters = [
    { key: 'hasPdf', label: 'دارای PDF', count: facets?.hasPdf },
    { key: 'hasExcel', label: 'دارای Excel', count: facets?.hasExcel },
    { key: 'underSupervision', label: 'تحت نظارت', count: facets?.underSupervision, value: '1' },
    { key: 'isEstimate', label: 'تخمین سود', value: 'true' },
    { key: 'hasAttachment', label: 'دارای پیوست' },
    { key: 'hasHtml', label: 'دارای HTML' },
    { key: 'hasXbrl', label: 'دارای XBRL' },
  ];

  const clearFilters = () => {
      router.push('/letters');
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">فیلترها</CardTitle>
            {(searchParams.toString().length > 0 && searchParams.get('page') !== searchParams.toString().split('=')[1]) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                    حذف همه
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            {filters.map((filter) => {
                const isActive = filter.key === 'underSupervision' 
                    ? searchParams.get(filter.key) === '1'
                    : searchParams.get(filter.key) === 'true';
                
                return (
                    <div key={filter.key} className="flex items-center space-x-2 space-x-reverse">
                        <input
                            type="checkbox"
                            id={filter.key}
                            checked={isActive}
                            onChange={(e) => updateFilter(filter.key, filter.key === 'underSupervision' ? (e.target.checked ? '1' : null) : e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                            htmlFor={filter.key}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 flex justify-between"
                        >
                            <span>{filter.label}</span>
                            {filter.count !== undefined && (
                                <span className="text-xs text-muted-foreground">({formatNumber(filter.count)})</span>
                            )}
                        </label>
                    </div>
                );
            })}
          </div>

          {facets?.topLetterCodes && facets.topLetterCodes.length > 0 && (
              <div className="pt-4 border-t">
                  <h4 className="mb-2 text-sm font-semibold">کدهای نامه پرتکرار</h4>
                  <div className="flex flex-wrap gap-2">
                      {facets.topLetterCodes.map((code) => {
                          const isActive = searchParams.get('letterCode') === code._id;
                          return (
                              <Badge
                                  key={code._id}
                                  variant={isActive ? "default" : "outline"}
                                  className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground"
                                  onClick={() => updateFilter('letterCode', isActive ? null : code._id)}
                              >
                                  {code._id}
                                  <span className="mr-1 text-[10px] opacity-70">({formatNumber(code.count)})</span>
                              </Badge>
                          )
                      })}
                  </div>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
