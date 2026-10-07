import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for QuestionerService hooks. */
export const questionerInstance = createHttpClient({
  baseURL: BFF_API_BASE.questioner,
  withCredentials: true,
});

export default questionerInstance;
