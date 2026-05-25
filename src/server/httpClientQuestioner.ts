import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

// Re-export types for backward compatibility
export type { OrvalRequest, OrvalMutator };

/**
 * HTTP client for QuestionerService hooks.
 *
 * Post-BFF-cutover this routes same-origin to `/bff/api/questioner/*`; the
 * `bff-katalogos` reverse proxy attaches the `Bearer` and forwards to
 * `questioner-api`. Like every other client it is token-free — the SPA never
 * holds a credential.
 */
export const questionerInstance = createHttpClient({
  baseURL: BFF_API_BASE.questioner,
  withCredentials: true,
});

export default questionerInstance;
