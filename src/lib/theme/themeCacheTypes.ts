/**
 * Types for the tenant theme localStorage cache.
 */
import type { TenantThemeConfig } from '../../theme/types';

/** Shape of the cached theme data stored in localStorage. */
export interface CachedThemeData {
  config: TenantThemeConfig;
  logoUrl: string | null;
  faviconUrl: string | null;
  etag: string;
  cachedAt: number;
}
