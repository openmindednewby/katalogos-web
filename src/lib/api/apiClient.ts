
import { createBffAxiosClient, registerInterceptors } from '@dloizides/bff-web-client';
import { notifyWarming } from '@dloizides/ui-feedback';

import { apiEventBus } from './events/apiEventBus';
import { registerCsrfInterceptor } from './interceptors/csrfInterceptor';
import { registerSessionExpiryInterceptor } from './sessionExpiry';
import { HTTP_TIMEOUT_MS } from '../../shared/constants';
import { logger } from '../../utils/logger';

import type { ErrorSeverity } from '@dloizides/api-client-base';
import type { AxiosInstance } from 'axios';

export const apiClient: AxiosInstance = createBffAxiosClient({ timeoutMs: HTTP_TIMEOUT_MS });

/** Registers the full BFF interceptor chain on the provided instance, wiring the */
function registerAllInterceptors(instance: AxiosInstance): void {
  registerInterceptors(instance, {
    logger,
    emitToast: (message: string, severity: ErrorSeverity) =>
      apiEventBus.emit({ type: 'toast', severity, message }),
    csrf: registerCsrfInterceptor,
    onSessionExpiry: registerSessionExpiryInterceptor,
    warmupRetry: { onWarmupRetry: (info) => notifyWarming(info) },
  });
}

export { registerAllInterceptors };
