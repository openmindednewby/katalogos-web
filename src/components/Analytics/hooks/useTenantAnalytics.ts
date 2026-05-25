// TODO: Replace with generated hook when GET /api/analytics/tenant-summary is added to OpenAPI spec
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { TenantAnalyticsSummary } from '../types';
import type { UseQueryResult } from '@tanstack/react-query';

const ANALYTICS_ENDPOINT = '/api/analytics/tenant-summary';

async function fetchTenantAnalytics(signal?: AbortSignal): Promise<TenantAnalyticsSummary> {
  return customInstance<TenantAnalyticsSummary>({
    url: ANALYTICS_ENDPOINT,
    method: 'GET',
    signal,
  });
}

export function getTenantAnalyticsQueryKey(): readonly string[] {
  return [ANALYTICS_ENDPOINT] as const;
}

export function useTenantAnalytics(): UseQueryResult<TenantAnalyticsSummary> {
  return useQuery({
    queryKey: getTenantAnalyticsQueryKey(),
    queryFn: async ({ signal }) => fetchTenantAnalytics(signal),
  });
}
