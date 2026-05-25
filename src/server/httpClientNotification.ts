import { BFF_API_BASE } from './bffRoutes';
import { createHttpClient, type OrvalRequest, type OrvalMutator } from './createHttpClient';

// Re-export types for backward compatibility
export type { OrvalRequest, OrvalMutator };

/**
 * HTTP client for NotificationService hooks.
 *
 * Post-BFF-cutover this routes same-origin to `/bff/api/notifications/*`; the
 * `bff-katalogos` reverse proxy attaches the `Bearer` and forwards to
 * `notification-api`.
 */
export const notificationInstance = createHttpClient({
  baseURL: BFF_API_BASE.notifications,
  withCredentials: true,
});

export default notificationInstance;
