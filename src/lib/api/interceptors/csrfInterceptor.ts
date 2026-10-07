
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const CSRF_HEADER = 'X-BFF-Csrf';
const CSRF_HEADER_VALUE = '1';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function isStateChanging(method: string | undefined): boolean {
  if (typeof method !== 'string') return false;
  return STATE_CHANGING_METHODS.includes(method.toUpperCase());
}

/** Adds `X-BFF-Csrf` to every state-changing request. Safe (GET/HEAD) requests */
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
