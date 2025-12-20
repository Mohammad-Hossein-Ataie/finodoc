import { useQuery } from '@tanstack/react-query';
import { FilterParams, PaginatedResponse, CodalLetter, FacetCounts } from '@/lib/types';

async function fetchLetters(params: FilterParams): Promise<PaginatedResponse<CodalLetter>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const res = await fetch(`/api/letters?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch letters');
  }
  return res.json();
}

async function fetchFacets(): Promise<FacetCounts> {
  const res = await fetch('/api/facets');
  if (!res.ok) {
    throw new Error('Failed to fetch facets');
  }
  return res.json();
}

export function useLetters(params: FilterParams) {
  return useQuery({
    queryKey: ['letters', params],
    queryFn: () => fetchLetters(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });
}

export function useFacets() {
  return useQuery({
    queryKey: ['facets'],
    queryFn: fetchFacets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLetter(tracingNo: string) {
    return useQuery({
        queryKey: ['letter', tracingNo],
        queryFn: async () => {
            const res = await fetch(`/api/letters/${tracingNo}`);
            if (!res.ok) throw new Error('Failed to fetch letter');
            return res.json() as Promise<CodalLetter>;
        }
    })
}
