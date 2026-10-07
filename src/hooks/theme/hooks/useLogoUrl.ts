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

/** Resolves the logoContentId from a tenant theme config into a public URL. */
export function useLogoUrl(themeConfig: TenantThemeConfig | null): UseLogoUrlReturn {
  const logoContentId = extractLogoContentId(themeConfig);
  const { data, isLoading } = usePublicContentUrl(logoContentId);

  const hasValidUrl = isValueDefined(data) && typeof data.url === 'string' && data.url.length > 0;
  const logoUrl = hasValidUrl ? data.url : null;

  return { logoUrl, isLoading: isValueDefined(logoContentId) && isLoading };
}
