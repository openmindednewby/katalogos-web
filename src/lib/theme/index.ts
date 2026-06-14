/**
 * Tenant theme barrel.
 *
 * The fetch logic, ETag localStorage cache, DTO -> config mapper, and types now
 * live in the shared `@dloizides/tenant-theme-web` package. This barrel
 * re-exports them (preserving the app's existing import surface) and imports the
 * app-owned transport module for its cache-logger side-effect.
 */
import './themeTransport';

export {
  readThemeCache,
  writeThemeCache,
  clearThemeCache,
  clearAllThemeCaches,
  fetchTenantTheme,
} from '@dloizides/tenant-theme-web';

export type {
  CachedThemeData,
  TenantThemeResponse,
  FetchTenantThemeOptions,
} from '@dloizides/tenant-theme-web';
