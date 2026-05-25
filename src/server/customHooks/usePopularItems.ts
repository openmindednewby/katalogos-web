// TODO: Replace with generated hook when GET /api/analytics/popular-items is added to OpenAPI spec
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { PopularItemsResponse } from '../../components/Analytics/types';
import type { UseQueryResult } from '@tanstack/react-query';

const POPULAR_ITEMS_ENDPOINT = '/api/analytics/popular-items';

async function fetchPopularItems(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<PopularItemsResponse> {
  return customInstance<PopularItemsResponse>({
    url: POPULAR_ITEMS_ENDPOINT,
    method: 'GET',
    params: { from, to },
    signal,
  });
}

export function getPopularItemsQueryKey(
  from: string,
  to: string,
): readonly string[] {
  return [POPULAR_ITEMS_ENDPOINT, from, to] as const;
}

export function usePopularItems(
  from: string,
  to: string,
): UseQueryResult<PopularItemsResponse> {
  return useQuery({
    queryKey: getPopularItemsQueryKey(from, to),
    queryFn: async ({ signal }) => fetchPopularItems(from, to, signal),
    enabled: from.length > 0 && to.length > 0,
  });
}
