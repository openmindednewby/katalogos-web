/**
 * Custom hook for fetching paginated experiments.
 * Uses the OnlineMenu API: GET /api/v1/experiments
 */
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { PaginatedExperimentsDto } from './types';
import type { UseQueryResult } from '@tanstack/react-query';

const EXPERIMENTS_ENDPOINT = '/api/v1/experiments';
const EXPERIMENTS_QUERY_PREFIX = 'experiments-list';

async function fetchExperiments(
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<PaginatedExperimentsDto> {
  return customInstance<PaginatedExperimentsDto>({
    url: EXPERIMENTS_ENDPOINT,
    method: 'GET',
    params: { page, pageSize },
    signal,
  });
}

export function getListExperimentsQueryKey(
  page: number,
  pageSize: number,
): readonly string[] {
  return [EXPERIMENTS_QUERY_PREFIX, String(page), String(pageSize)] as const;
}

export function useListExperiments(
  page: number,
  pageSize: number,
): UseQueryResult<PaginatedExperimentsDto> {
  return useQuery({
    queryKey: getListExperimentsQueryKey(page, pageSize),
    queryFn: async ({ signal }) => fetchExperiments(page, pageSize, signal),
  });
}
