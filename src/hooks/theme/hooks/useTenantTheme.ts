import { useEffect, useMemo } from 'react';

import {
  fetchTenantTheme,
  readThemeCache,
  writeThemeCache,
  clearAllThemeCaches,
} from '@dloizides/tenant-theme-web';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { QUERY_CACHE, queryKeys } from '../../../lib/queryClient';
import {
  defaultThemeConfig,
  getIdentityBaseUrl,
  httpGet,
} from '../../../lib/theme/themeTransport';
import { isValueDefined } from '../../../utils/is';
import { logger } from '../../../utils/logger';

import type { RootState } from '../../../store/reduxStore';
import type {
  CachedThemeData,
  TenantThemeConfig,
  TenantThemeResponse,
} from '@dloizides/tenant-theme-web';
import type { QueryClient } from '@tanstack/react-query';

const EMPTY_ETAG = '';

export function useTenantTheme(): UseTenantThemeReturn {
  const tenantId = useSelector(extractTenantId);
  const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);
  const queryClient = useQueryClient();
  const isEnabled = isValueDefined(tenantId) && isLoggedIn;

  const cached = useMemo((): CachedThemeData | null => {
    if (!isValueDefined(tenantId)) return null;
    return readThemeCache(tenantId);
  }, [tenantId]);

  const cachedConfig = isValueDefined(cached) ? cached.config : null;
  const cachedEtag = isValueDefined(cached) ? cached.etag : undefined;

  const { data, isLoading, isFetched, error } = useQuery<TenantThemeResponse>({
    queryKey: queryKeys.tenantTheme.byTenant(tenantId ?? EMPTY_ETAG),
    queryFn: async ({ signal }) =>
      fetchTenantTheme(tenantId ?? EMPTY_ETAG, {
        signal,
        cachedEtag,
        httpGet,
        defaultThemeConfig,
        baseURL: getIdentityBaseUrl(),
      }),
    enabled: isEnabled,
    staleTime: QUERY_CACHE.STALE_TIME_LONG_MS,
  });

  useCacheSyncEffects(tenantId, data, error);
  const tenantThemeConfig = useResolvedConfig(isLoggedIn, data, cachedConfig);
  const { refetch, clearCache } = useThemeActions(isEnabled, queryClient);

  return { tenantThemeConfig, isLoading: isEnabled && isLoading, isFetched, error, refetch, clearCache };
}

export interface UseTenantThemeReturn {
  tenantThemeConfig: TenantThemeConfig | null;
  isLoading: boolean;
  isFetched: boolean;
  error: unknown;
  refetch: () => void;
  clearCache: () => void;
}

function extractTenantId(state: RootState): string | undefined {
  const userInfo = state.auth.userInfo;
  if (!isValueDefined(userInfo)) return undefined;

  const tenantId = userInfo.tenantId;
  if (typeof tenantId === 'string' && tenantId.length > 0) return tenantId;

  return undefined;
}

function handleFetchSuccess(tenantId: string, data: TenantThemeResponse): void {
  if (data.notModified) return;
  if (!isValueDefined(data.themeConfig)) return;
  writeThemeCache(tenantId, data.themeConfig, data.etag ?? EMPTY_ETAG);
}

function useCacheSyncEffects(tenantId: string | undefined, data: TenantThemeResponse | undefined, error: unknown): void {
  useEffect(() => {
    if (!isValueDefined(tenantId) || !isValueDefined(data)) return;
    handleFetchSuccess(tenantId, data);
  }, [tenantId, data]);

  useEffect(() => {
    if (!isValueDefined(error)) return;
    logger.warn('useTenantTheme', 'Failed to fetch tenant theme, using fallback', error);
  }, [error]);
}

function useResolvedConfig(isLoggedIn: boolean, data: TenantThemeResponse | undefined, cachedConfig: TenantThemeConfig | null): TenantThemeConfig | null {
  return useMemo((): TenantThemeConfig | null => {
    if (!isLoggedIn) return null;
    const serverConfirmedCached = isValueDefined(data) && data.notModified && isValueDefined(cachedConfig);
    if (serverConfirmedCached) return cachedConfig;
    if (isValueDefined(data?.themeConfig)) return data.themeConfig;
    if (isValueDefined(cachedConfig)) return cachedConfig;
    return null;
  }, [isLoggedIn, data, cachedConfig]);
}

function useThemeActions(isEnabled: boolean, queryClient: QueryClient): { refetch: () => void; clearCache: () => void } {
  return useMemo(() => ({
    refetch: (): void => {
      if (!isEnabled) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.tenantTheme.all }).catch(() => {});
    },
    clearCache: (): void => {
      clearAllThemeCaches();
      queryClient.removeQueries({ queryKey: queryKeys.tenantTheme.all });
    },
  }), [isEnabled, queryClient]);
}
