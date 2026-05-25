/**
 * Hook that fetches white-label configuration from the tenant theme endpoint.
 *
 * The white-label fields are stored alongside theme colors in ThemeConfigJson.
 * This hook fetches the raw JSON via the Identity API and extracts only the
 * white-label fields.
 */
import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { QUERY_CACHE, queryKeys } from '../../../lib/queryClient';
import { identityInstance } from '../../../server/mutators/identityMutator';
import { isValueDefined } from '../../../utils/is';

import type { RootState } from '../../../store/reduxStore';
import type { WhiteLabelConfig } from '../types';

interface ThemeResponseWithWhiteLabel {
  customLogoUrl?: string | null;
  customFaviconUrl?: string | null;
  customCss?: string | null;
  headerHtml?: string | null;
  footerHtml?: string | null;
  showPoweredBy?: boolean;
  companyName?: string | null;
  supportEmail?: string | null;
}

export interface UseWhiteLabelConfigReturn {
  config: WhiteLabelConfig | null;
  isLoading: boolean;
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

async function fetchWhiteLabelConfig(tenantId: string): Promise<ThemeResponseWithWhiteLabel> {
  return identityInstance<ThemeResponseWithWhiteLabel>({
    url: `/api/tenants/${tenantId}/theme`,
    method: 'GET',
  });
}

export function toWhiteLabelConfig(data: ThemeResponseWithWhiteLabel): WhiteLabelConfig {
  return {
    customLogoUrl: data.customLogoUrl ?? null,
    customFaviconUrl: data.customFaviconUrl ?? null,
    customCss: data.customCss ?? null,
    headerHtml: data.headerHtml ?? null,
    footerHtml: data.footerHtml ?? null,
    showPoweredBy: data.showPoweredBy ?? true,
    companyName: data.companyName ?? null,
    supportEmail: data.supportEmail ?? null,
  };
}

export function useWhiteLabelConfig(): UseWhiteLabelConfigReturn {
  const tenantId = useSelector(extractTenantId);
  const isEnabled = isValueDefined(tenantId);

  const { data, isLoading, isError, error } = useQuery<ThemeResponseWithWhiteLabel>({
    queryKey: queryKeys.tenantTheme.byTenant(tenantId ?? ''),
    queryFn: async () => fetchWhiteLabelConfig(tenantId ?? ''),
    enabled: isEnabled,
    staleTime: QUERY_CACHE.STALE_TIME_LONG_MS,
  });

  const config = useMemo((): WhiteLabelConfig | null => {
    if (!isValueDefined(data)) return null;
    return toWhiteLabelConfig(data);
  }, [data]);

  return { config, isLoading: isEnabled && isLoading, isError, error: error ?? null };
}
