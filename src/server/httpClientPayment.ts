import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

export type { OrvalRequest, OrvalMutator };

/** HTTP client for PaymentService hooks. */
export const paymentInstance = createHttpClient({
  baseURL: BFF_API_BASE.payments,
  withCredentials: true,
});

export default paymentInstance;
