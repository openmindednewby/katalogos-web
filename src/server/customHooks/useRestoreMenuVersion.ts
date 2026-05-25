/**
 * Custom hook for restoring a menu to a previous version.
 * Uses the OnlineMenu API: POST /TenantMenus/{menuId}/versions/{versionId}/restore
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { RestoreMenuVersionResponse } from '../../features/onlinemenus/types';
import type { UseMutationResult } from '@tanstack/react-query';

const VERSIONS_ENDPOINT_PREFIX = '/TenantMenus';
const RESTORE_SUFFIX = '/restore';
const MENU_VERSIONS_QUERY_PREFIX = 'menu-versions';
const MENU_VERSION_QUERY_PREFIX = 'menu-version-detail';

interface RestoreMenuVersionParams {
  menuId: string;
  versionId: string;
}

async function restoreMenuVersion(
  params: RestoreMenuVersionParams,
): Promise<RestoreMenuVersionResponse> {
  return customInstance<RestoreMenuVersionResponse>({
    url: `${VERSIONS_ENDPOINT_PREFIX}/${params.menuId}/versions/${params.versionId}${RESTORE_SUFFIX}`,
    method: 'POST',
  });
}

export function useRestoreMenuVersion(): UseMutationResult<
  RestoreMenuVersionResponse,
  Error,
  RestoreMenuVersionParams
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreMenuVersion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [MENU_VERSIONS_QUERY_PREFIX, variables.menuId] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: [MENU_VERSION_QUERY_PREFIX, variables.menuId] }).catch(() => undefined);
    },
  });
}
