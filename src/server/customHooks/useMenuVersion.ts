/**
 * Custom hook for fetching a single menu version with full snapshot.
 * Uses the OnlineMenu API: GET /TenantMenus/{menuId}/versions/{versionId}
 */
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { MenuVersionDetailDto } from '../../features/onlinemenus/types';
import type { UseQueryResult } from '@tanstack/react-query';

const VERSIONS_ENDPOINT_PREFIX = '/TenantMenus';
const VERSIONS_ENDPOINT_SUFFIX = '/versions';
const MENU_VERSION_QUERY_PREFIX = 'menu-version-detail';

async function fetchMenuVersion(
  menuId: string,
  versionId: string,
  signal?: AbortSignal,
): Promise<MenuVersionDetailDto> {
  return customInstance<MenuVersionDetailDto>({
    url: `${VERSIONS_ENDPOINT_PREFIX}/${menuId}${VERSIONS_ENDPOINT_SUFFIX}/${versionId}`,
    method: 'GET',
    signal,
  });
}

export function getMenuVersionQueryKey(
  menuId: string,
  versionId: string,
): readonly string[] {
  return [MENU_VERSION_QUERY_PREFIX, menuId, versionId] as const;
}

export function useMenuVersion(
  menuId: string,
  versionId: string,
): UseQueryResult<MenuVersionDetailDto> {
  const isValidId = menuId !== '' && versionId !== '';

  return useQuery({
    queryKey: getMenuVersionQueryKey(menuId, versionId),
    queryFn: async ({ signal }) => fetchMenuVersion(menuId, versionId, signal),
    enabled: isValidId,
  });
}
