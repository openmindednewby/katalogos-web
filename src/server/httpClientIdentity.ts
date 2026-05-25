import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

// Re-export types for backward compatibility
export type { OrvalRequest, OrvalMutator };

/**
 * HTTP client for TenantService (formerly identity-api) hooks.
 *
 * Post-BFF-cutover this routes same-origin to `/bff/api/tenants/*`; the
 * `bff-katalogos` reverse proxy attaches the `Bearer` and forwards to
 * `tenant-api`.
 */
export const identityInstance = createHttpClient({
  baseURL: BFF_API_BASE.tenants,
  withCredentials: true,
});

export default identityInstance;
