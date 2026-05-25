/**
 * Custom hook for comparing two menu versions.
 * Uses the OnlineMenu API: GET /TenantMenus/{menuId}/versions/{v1}/compare/{v2}
 */
import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { MenuVersionComparisonDto } from '../../features/onlinemenus/types';
import type { UseQueryResult } from '@tanstack/react-query';

const VERSIONS_ENDPOINT_PREFIX = '/TenantMenus';
const COMPARE_SEGMENT = '/compare';
const COMPARE_QUERY_PREFIX = 'menu-version-compare';

async function fetchComparison(
  menuId: string,
  versionId1: string,
  versionId2: string,
  signal?: AbortSignal,
): Promise<MenuVersionComparisonDto> {
  return customInstance<MenuVersionComparisonDto>({
    url: `${VERSIONS_ENDPOINT_PREFIX}/${menuId}/versions/${versionId1}${COMPARE_SEGMENT}/${versionId2}`,
    method: 'GET',
    signal,
  });
}

export function getCompareMenuVersionsQueryKey(
  menuId: string,
  versionId1: string,
  versionId2: string,
): readonly string[] {
  return [COMPARE_QUERY_PREFIX, menuId, versionId1, versionId2] as const;
}

export function useCompareMenuVersions(
  menuId: string,
  versionId1: string,
  versionId2: string,
): UseQueryResult<MenuVersionComparisonDto> {
  const isValid = menuId !== '' && versionId1 !== '' && versionId2 !== '';

  return useQuery({
    queryKey: getCompareMenuVersionsQueryKey(menuId, versionId1, versionId2),
    queryFn: async ({ signal }) => fetchComparison(menuId, versionId1, versionId2, signal),
    enabled: isValid,
  });
}
