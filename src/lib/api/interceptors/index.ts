/**
 * Interceptor registration module — BFF era.
 *
 * Registers all interceptors on an Axios instance in the correct order.
 *
 * Request interceptors run in REVERSE order of registration, so:
 *   1. logging (registered first, runs last = logs the FINAL config)
 *   2. csrf    (registered second, runs first = attaches X-BFF-Csrf)
 *
 * Response interceptors run in ORDER of registration, so:
 *   1. logging          (logs response/error first)
 *   2. normalizer       (emits success toast)
 *   3. session expiry   (handles 401 -> clear session + emit session-expired)
 *   4. error classifier (classifies remaining errors)
 *
 * The pre-BFF `auth` (Bearer header) and `tenant` (X-Tenant-Id header)
 * request interceptors are gone: the SPA holds no token, and the BFF
 * attaches the Bearer + lets downstream services derive the tenant from the
 * KC JWT. The pre-BFF token-refresh interceptor is gone too — the BFF
 * refreshes tokens server-side.
 */

import { registerCsrfInterceptor } from './csrfInterceptor';
import { registerErrorClassifier } from './errorClassifier';
import { registerLoggingInterceptor } from './loggingInterceptor';
import { registerResponseNormalizer } from './responseNormalizer';
import { registerSessionExpiryInterceptor } from '../sessionExpiry';

import type { AxiosInstance } from 'axios';

/**
 * Registers all interceptors on the provided Axios instance.
 *
 * Call this once during application bootstrap after creating the
 * axios instance.
 */
function registerInterceptors(instance: AxiosInstance): void {
  // Request interceptors (registered order = reverse execution order)
  registerLoggingInterceptor(instance);
  registerCsrfInterceptor(instance);

  // Response interceptors (registered order = execution order)
  registerResponseNormalizer(instance);
  registerSessionExpiryInterceptor(instance);
  registerErrorClassifier(instance);
}

export { registerInterceptors };

// Re-export individual registrations for selective use
export { registerCsrfInterceptor } from './csrfInterceptor';
export { registerResponseNormalizer } from './responseNormalizer';
export { registerErrorClassifier } from './errorClassifier';
export { registerLoggingInterceptor } from './loggingInterceptor';
