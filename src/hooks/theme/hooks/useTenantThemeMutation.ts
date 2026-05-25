

/**
 * Hook that returns a mutation for saving tenant theme configuration.
 * Invalidates the theme query cache on success.
 */
/**
 * React Query mutation hook for saving tenant theme configuration.
 *
 * Uses PUT /api/tenants/{tenantId}/theme via identityInstance.
 * Invalidates the tenant theme query cache on success so useTenantTheme
 * picks up the new config immediately.
 */
import { useMemo } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { queryKeys } from '../../../lib/queryClient';
import { identityInstance } from '../../../server/mutators/identityMutator';
import { isValueDefined } from '../../../utils/is';

import type { RootState } from '../../../store/reduxStore';
import type { TenantThemeConfig } from '../../../theme/types';
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

/** Response shape from PUT /api/tenants/{tenantId}/theme */
interface SaveThemeResponse {
  success: boolean;
}

interface ApiThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string | null;
  onBackground: string;
  onSurface: string;
}

interface ApiThemeRequest {
  presetId: string | null;
  colors: ApiThemeColors;
  darkColors: ApiThemeColors;
  typography: { fontFamily: string | null; headerScale: number | null } | null;
  logoContentId: string | null;
  faviconContentId: string | null;
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

/** Maps frontend TenantThemeConfig to the API's UpdateTenantThemeRequest shape. */
function toApiRequest(config: TenantThemeConfig): ApiThemeRequest {
  return {
    presetId: config.branding.presetId ?? null,
    colors: {
      primary: config.primary,
      secondary: config.secondary,
      background: config.light.background,
      surface: config.light.surface,
      error: config.semantic?.error ?? null,
      onBackground: config.light.text,
      onSurface: config.light.textSecondary,
    },
    darkColors: {
      primary: config.primary,
      secondary: config.secondary,
      background: config.dark.background,
      surface: config.dark.surface,
      error: config.semantic?.error ?? null,
      onBackground: config.dark.text,
      onSurface: config.dark.textSecondary,
    },
    typography: config.typography
      ? { fontFamily: config.typography.fontFamily ?? null, headerScale: config.typography.headingScale ?? null }
      : null,
    logoContentId: config.branding.logoContentId ?? null,
    faviconContentId: config.branding.faviconContentId ?? null,
  };
}

async function saveTenantTheme(
  tenantId: string,
  config: TenantThemeConfig,
): Promise<SaveThemeResponse> {
  return identityInstance<SaveThemeResponse>({
    url: `/api/tenants/${tenantId}/theme`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: toApiRequest(config),
  });
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
      return saveTenantTheme(tenantId, config);
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
