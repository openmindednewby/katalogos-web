/**
 * BFF axios client + interceptor wiring for katalogos-web.
 *
 * The axios factory and the interceptor chain (logging, success-toast
 * normalizer, error classifier) live in the shared
 * `@dloizides/bff-web-client` package. This module supplies the app-owned
 * **ports**: the CSRF strategy (`registerCsrfInterceptor`), the session-expiry
 * handler (`registerSessionExpiryInterceptor`, which owns the Redux session
 * store + the `/bff/me` probe), the logger, and the toast emitter (the app's
 * `apiEventBus`).
 */

import { createBffAxiosClient, registerInterceptors } from '@dloizides/bff-web-client';

import { apiEventBus } from './events/apiEventBus';
import { registerCsrfInterceptor } from './interceptors/csrfInterceptor';
import { registerSessionExpiryInterceptor } from './sessionExpiry';
import { HTTP_TIMEOUT_MS } from '../../shared/constants';
import { logger } from '../../utils/logger';

import type { ErrorSeverity } from '@dloizides/api-client-base';
import type { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = createBffAxiosClient({ timeoutMs: HTTP_TIMEOUT_MS });

/**
 * Registers the full BFF interceptor chain on the provided instance, wiring the
 * app-owned CSRF + session-expiry ports, logger, and toast emitter.
 */
function registerAllInterceptors(instance: AxiosInstance): void {
  registerInterceptors(instance, {
    logger,
    emitToast: (message: string, severity: ErrorSeverity) =>
      apiEventBus.emit({ type: 'toast', severity, message }),
    csrf: registerCsrfInterceptor,
    onSessionExpiry: registerSessionExpiryInterceptor,
  });
}

export { registerAllInterceptors };
