/**
 * Custom hook for fetching paginated menu version history.
 * Uses the OnlineMenu API: GET /TenantMenus/{menuId}/versions
 */
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { PaginatedMenuVersionsDto } from '../../features/onlinemenus/types';
import type { UseQueryResult } from '@tanstack/react-query';

const VERSIONS_ENDPOINT_PREFIX = '/TenantMenus';
const VERSIONS_ENDPOINT_SUFFIX = '/versions';
const MENU_VERSIONS_QUERY_PREFIX = 'menu-versions';

async function fetchMenuVersions(
  menuId: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<PaginatedMenuVersionsDto> {
  return customInstance<PaginatedMenuVersionsDto>({
    url: `${VERSIONS_ENDPOINT_PREFIX}/${menuId}${VERSIONS_ENDPOINT_SUFFIX}`,
    method: 'GET',
    params: { page, pageSize },
    signal,
  });
}

export function getMenuVersionsQueryKey(
  menuId: string,
  page: number,
  pageSize: number,
): readonly string[] {
  return [MENU_VERSIONS_QUERY_PREFIX, menuId, String(page), String(pageSize)] as const;
}

export function useMenuVersions(
  menuId: string,
  page: number,
  pageSize: number,
): UseQueryResult<PaginatedMenuVersionsDto> {
  const isValidId = menuId !== '';

  return useQuery({
    queryKey: getMenuVersionsQueryKey(menuId, page, pageSize),
    queryFn: async ({ signal }) => fetchMenuVersions(menuId, page, pageSize, signal),
    enabled: isValidId,
  });
}
