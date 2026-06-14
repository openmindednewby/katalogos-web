/**
 * React Query mutation hook for saving tenant theme configuration.
 *
 * Uses PUT /api/tenants/{tenantId}/theme via the shared
 * `@dloizides/tenant-theme-web` package (transport wired in
 * `lib/theme/themeTransport`). Invalidates the tenant theme query cache on
 * success so useTenantTheme picks up the new config immediately.
 */
import { useMemo } from 'react';

import { saveTenantTheme } from '@dloizides/tenant-theme-web';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { queryKeys } from '../../../lib/queryClient';
import { httpPut } from '../../../lib/theme/themeTransport';
import { isValueDefined } from '../../../utils/is';

import type { RootState } from '../../../store/reduxStore';
import type { SaveThemeResponse, TenantThemeConfig } from '@dloizides/tenant-theme-web';
import type { QueryClient, UseMutationResult } from '@tanstack/react-query';

export function useTenantThemeMutation(
  callbacks?: MutationCallbacks,
): UseTenantThemeMutationReturn {
  const tenantId = useSelector(extractTenantId);
  const queryClient = useQueryClient();

  const config = buildMutationConfig(tenantId, queryClient, callbacks);
  const mutation = useMutation<SaveThemeResponse, Error, TenantThemeConfig>(config);

  return useMemo(() => buildReturn(mutation), [mutation]);
}

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseTenantThemeMutationReturn {
  saveTheme: (config: TenantThemeConfig) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

function extractTenantId(state: RootState): string | undefined {
  const userInfo = state.auth.userInfo;
  if (!isValueDefined(userInfo)) return undefined;
  const tenantId = userInfo.tenantId;
  if (typeof tenantId === 'string' && tenantId.length > 0) return tenantId;
  return undefined;
}

function buildMutationConfig(
  tenantId: string | undefined,
  queryClient: QueryClient,
  callbacks?: MutationCallbacks,
): {
  mutationFn: (config: TenantThemeConfig) => Promise<SaveThemeResponse>;
  onSuccess: () => void;
  onError: (error: Error) => void;
} {
  return {
    mutationFn: async (config: TenantThemeConfig) => {
      if (!isValueDefined(tenantId))
        return Promise.reject(new Error('No tenant ID available'));
      return saveTenantTheme(tenantId, config, httpPut);
    },
    onSuccess: () => {
      if (isValueDefined(tenantId))
        queryClient
          .invalidateQueries({ queryKey: queryKeys.tenantTheme.byTenant(tenantId) })
          .catch(() => {});
      callbacks?.onSuccess?.();
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  };
}

function buildReturn(
  mutation: UseMutationResult<SaveThemeResponse, Error, TenantThemeConfig>,
): UseTenantThemeMutationReturn {
  return {
    saveTheme: (config: TenantThemeConfig) => mutation.mutate(config),
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
