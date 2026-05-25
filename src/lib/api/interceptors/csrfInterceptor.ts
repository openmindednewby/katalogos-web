/**
 * Request interceptor: attaches the `X-BFF-Csrf` anti-forgery header.
 *
 * After the Phase 2 BFF cutover, katalogos-web authenticates via a cookie
 * (`__Host-bff-katalogos`). Cookie auth reintroduces CSRF risk, so the BFF's
 * `Bff.AspNetCore` anti-forgery middleware requires a custom header on every
 * state-changing `/bff/*` request — a request a cross-site form POST cannot
 * forge. This interceptor adds `X-BFF-Csrf: 1` to all mutating methods.
 *
 * Replaces the old `authInterceptor` (Bearer header) — the SPA holds no
 * token, the BFF attaches the `Bearer` server-side.
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/** Header name + value the `Bff.AspNetCore` anti-forgery middleware checks. */
const CSRF_HEADER = 'X-BFF-Csrf';
const CSRF_HEADER_VALUE = '1';

/** Methods the BFF anti-forgery middleware treats as state-changing. */
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function isStateChanging(method: string | undefined): boolean {
  if (typeof method !== 'string') return false;
  return STATE_CHANGING_METHODS.includes(method.toUpperCase());
}

/**
 * Adds `X-BFF-Csrf` to every state-changing request. Safe (GET/HEAD) requests
 * are left untouched — the BFF only enforces the header on mutations.
 */
function attachCsrfHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (isStateChanging(config.method)) config.headers.set(CSRF_HEADER, CSRF_HEADER_VALUE);
  return config;
}

/**
 * Registers the CSRF request interceptor on an Axios instance.
 * @returns The interceptor ID for potential ejection.
 */
function registerCsrfInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.request.use(attachCsrfHeader);
}

export { registerCsrfInterceptor, attachCsrfHeader };
