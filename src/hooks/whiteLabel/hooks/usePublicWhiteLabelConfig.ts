/**
 * Hook that fetches white-label config for public (unauthenticated) pages.
 *
 * Unlike useWhiteLabelConfig (which reads tenant ID from Redux), this hook
 * accepts the tenant ID as a parameter. Used on public menu pages where the
 * tenant ID is extracted from the menu API response.
 *
 * The GET /tenants/{tenantId}/theme endpoint is AllowAnonymous so no auth
 * token is required.
 */
import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { toWhiteLabelConfig } from './useWhiteLabelConfig';
import { QUERY_CACHE, queryKeys } from '../../../lib/queryClient';
import { identityInstance } from '../../../server/mutators/identityMutator';
import { isValueDefined } from '../../../utils/is';

import type { UseWhiteLabelConfigReturn } from './useWhiteLabelConfig';

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

async function fetchPublicTheme(tenantId: string): Promise<ThemeResponseWithWhiteLabel> {
  return identityInstance<ThemeResponseWithWhiteLabel>({
    url: `/api/tenants/${tenantId}/theme`,
    method: 'GET',
  });
}

export function usePublicWhiteLabelConfig(
  tenantId: string | null,
): UseWhiteLabelConfigReturn {
  const isEnabled = isValueDefined(tenantId) && tenantId.length > 0;

  const { data, isLoading, isError, error } = useQuery<ThemeResponseWithWhiteLabel>({
    queryKey: queryKeys.tenantTheme.byTenant(tenantId ?? ''),
    queryFn: async () => fetchPublicTheme(tenantId ?? ''),
    enabled: isEnabled,
    staleTime: QUERY_CACHE.STALE_TIME_LONG_MS,
  });

  const config = useMemo(() => {
    if (!isValueDefined(data)) return null;
    return toWhiteLabelConfig(data);
  }, [data]);

  return { config, isLoading: isEnabled && isLoading, isError, error: error ?? null };
}
