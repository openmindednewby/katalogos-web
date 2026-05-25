// TODO: Replace with generated hook when GET /api/analytics/menu/:menuId is added to OpenAPI spec
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { MenuAnalyticsDetail } from '../types';
import type { UseQueryResult } from '@tanstack/react-query';

const MENU_ANALYTICS_BASE = '/api/analytics/menu';

interface MenuAnalyticsParams {
  menuId: string;
  from: string;
  to: string;
}

async function fetchMenuAnalytics(
  params: MenuAnalyticsParams,
  signal?: AbortSignal,
): Promise<MenuAnalyticsDetail> {
  return customInstance<MenuAnalyticsDetail>({
    url: `${MENU_ANALYTICS_BASE}/${params.menuId}`,
    method: 'GET',
    params: { from: params.from, to: params.to },
    signal,
  });
}

export function getMenuAnalyticsQueryKey(
  menuId: string,
  from: string,
  to: string,
): readonly string[] {
  return [MENU_ANALYTICS_BASE, menuId, from, to] as const;
}

export function useMenuAnalytics(
  menuId: string,
  from: string,
  to: string,
): UseQueryResult<MenuAnalyticsDetail> {
  return useQuery({
    queryKey: getMenuAnalyticsQueryKey(menuId, from, to),
    queryFn: async ({ signal }) =>
      fetchMenuAnalytics({ menuId, from, to }, signal),
    enabled: menuId.length > 0,
  });
}
