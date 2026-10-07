import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for ContentService hooks. */
export const contentInstance = createHttpClient({
  baseURL: BFF_API_BASE.content,
  withCredentials: true,
});

export default contentInstance;
