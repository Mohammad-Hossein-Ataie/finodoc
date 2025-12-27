import { useQuery } from '@tanstack/react-query';
import type { ContentItem } from '@/lib/types';

export interface ContentFilterParams {
  q?: string;
  type?: string;
  category?: string;
}

export interface UseContentOptions {
  enabled?: boolean;
}

async function fetchContent(params: ContentFilterParams): Promise<ContentItem[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const res = await fetch(`/api/content?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch content');
  }
  return res.json();
}

export function useContent(params: ContentFilterParams, options?: UseContentOptions) {
  return useQuery({
    queryKey: ['content', params],
    queryFn: () => fetchContent(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}
