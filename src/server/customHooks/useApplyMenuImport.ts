/**
 * Custom hook for applying AI-imported menu data to a specific menu.
 * Uses the OnlineMenu API: POST /api/v1/TenantMenus/{ExternalId}/apply-import
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customInstance } from '@/server/mutators/onlineMenuMutator';

import type { ApplyImportRequest, ImportedMenuData } from '../../types/aiImportTypes';
import type { UseMutationResult } from '@tanstack/react-query';

const MENU_ENDPOINT_PREFIX = '/api/v1/TenantMenus';
const APPLY_SUFFIX = '/apply-import';
const MENU_QUERY_KEY = 'onlineMenuWebMenuList';

interface ApplyMenuImportVariables {
  externalId: string;
  importedData: ImportedMenuData;
  mergeStrategy: string;
}

async function applyMenuImport(
  variables: ApplyMenuImportVariables,
): Promise<undefined> {
  const request: ApplyImportRequest = {
    importedData: variables.importedData,
    mergeStrategy: variables.mergeStrategy,
  };

  await customInstance<undefined>({
    url: `${MENU_ENDPOINT_PREFIX}/${variables.externalId}${APPLY_SUFFIX}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: request,
  });

  return undefined;
}

export function useApplyMenuImport(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}): UseMutationResult<undefined, unknown, ApplyMenuImportVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['applyMenuImport'],
    mutationFn: applyMenuImport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}
