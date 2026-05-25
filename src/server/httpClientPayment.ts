import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

// Re-export types for backward compatibility
export type { OrvalRequest, OrvalMutator };

/**
 * HTTP client for PaymentService hooks.
 *
 * Post-BFF-cutover this routes same-origin to `/bff/api/payments/*`; the
 * `bff-katalogos` reverse proxy attaches the `Bearer` and forwards to
 * `payment-api`.
 */
export const paymentInstance = createHttpClient({
  baseURL: BFF_API_BASE.payments,
  withCredentials: true,
});

export default paymentInstance;
