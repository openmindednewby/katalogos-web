import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for TenantService (formerly identity-api) hooks. */
export const identityInstance = createHttpClient({
  baseURL: BFF_API_BASE.tenants,
  withCredentials: true,
});

export default identityInstance;
