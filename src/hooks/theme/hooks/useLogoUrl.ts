/**
 * Hook to resolve a tenant theme logo contentId to a public URL.
 *
 * Uses the existing ContentService public-url endpoint to resolve
 * the logoContentId from the tenant theme config into an accessible URL.
 * Falls back to null on errors or when no logoContentId is configured.
 */
import { usePublicContentUrl } from '../../../lib/hooks/content/hooks/useContent';
import { isValueDefined } from '../../../utils/is';

import type { TenantThemeConfig } from '../../../theme/types';

export interface UseLogoUrlReturn {
  logoUrl: string | null;
  isLoading: boolean;
}

function extractLogoContentId(config: TenantThemeConfig | null): string | undefined {
  if (!isValueDefined(config)) return undefined;
  const contentId = config.branding.logoContentId;
  if (typeof contentId === 'string' && contentId.length > 0) return contentId;
  return undefined;
}

/**
 * Resolves the logoContentId from a tenant theme config into a public URL.
 * Returns null when no logo is configured or when the fetch fails.
 */
export function useLogoUrl(themeConfig: TenantThemeConfig | null): UseLogoUrlReturn {
  const logoContentId = extractLogoContentId(themeConfig);
  const { data, isLoading } = usePublicContentUrl(logoContentId);

  const hasValidUrl = isValueDefined(data) && typeof data.url === 'string' && data.url.length > 0;
  const logoUrl = hasValidUrl ? data.url : null;

  return { logoUrl, isLoading: isValueDefined(logoContentId) && isLoading };
}
