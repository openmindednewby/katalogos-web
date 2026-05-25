import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

// Re-export types for backward compatibility
export type { OrvalRequest, OrvalMutator };

/**
 * Mutator adapter for OnlineMenu API hooks.
 *
 * Post-BFF-cutover this routes same-origin to `/bff/api/menus/*`; the
 * `bff-katalogos` reverse proxy attaches the `Bearer` server-side and
 * forwards to `onlinemenu-api`. `withToken` is gone — the SPA holds no token.
 */
export const customInstance = createHttpClient({
  baseURL: BFF_API_BASE.menus,
  withCredentials: true,
});

export default customInstance;
