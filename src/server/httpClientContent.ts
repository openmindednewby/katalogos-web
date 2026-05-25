import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

// Re-export types for backward compatibility
export type { OrvalRequest, OrvalMutator };

/**
 * HTTP client for ContentService hooks.
 *
 * Post-BFF-cutover this routes same-origin to `/bff/api/content/*`; the
 * `bff-katalogos` reverse proxy attaches the `Bearer` and forwards to
 * `content-api`.
 */
export const contentInstance = createHttpClient({
  baseURL: BFF_API_BASE.content,
  withCredentials: true,
});

export default contentInstance;
