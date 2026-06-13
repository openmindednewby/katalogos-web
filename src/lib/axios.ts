/**
 * @deprecated Import from 'src/lib/api' instead for new code.
 *
 * This module provides the legacy `deffHttp` wrapper used by
 * `src/lib/http/methods.ts`. It delegates to the shared `apiClient` instance
 * from the modular API architecture (`src/lib/api/apiClient.ts`).
 *
 * Existing imports of `deffHttp` and `RequestOptions` continue to work
 * unchanged.
 *
 * Post-BFF-cutover `withToken` is a no-op: the SPA holds no token, and the
 * `bff-katalogos` reverse proxy attaches the `Bearer` server-side. It is kept
 * on `RequestOptions` only so existing callers compile unchanged.
 *
 * Migration path:
 *   OLD: import { deffHttp } from '../lib/axios';
 *   NEW: import { apiClient } from '../lib/api';
 */

import { apiClient, registerAllInterceptors } from './api/apiClient';

import type { AxiosRequestConfig } from 'axios';

export interface RequestOptions {
  /** @deprecated No-op post-BFF-cutover — the BFF attaches the Bearer server-side. */
  withToken?: boolean;
  withCredentials?: boolean;
  errorMessageMode?: 'modal' | 'none';
  headers?: Record<string, string>;
  signal?: AbortSignal;
  config?: AxiosRequestConfig;
}

// Register all interceptors once at module load time. The modular
// interceptors handle the X-BFF-Csrf header, success notifications,
// session-expiry (401) handling, error classification, and logging.
registerAllInterceptors(apiClient);

async function request<T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
  const withCredentials = options?.withCredentials ?? true;

  const cfg: AxiosRequestConfig = {
    ...config,
    ...(options?.config ?? {}),
    withCredentials,
  };

  if (options?.signal)
    cfg.signal = options.signal;

  if (options?.headers)
    cfg.headers = { ...(cfg.headers ?? {}), ...options.headers };

  const res = await apiClient.request<T>(cfg);
  return res.data;
}

export const deffHttp: {
  get: <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions) => Promise<T>;
  post: <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions) => Promise<T>;
  delete: <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions) => Promise<T>;
  put: <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions) => Promise<T>;
  patch: <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions) => Promise<T>;
} = {
  get: async <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> =>
    request<T>({ ...config, method: 'GET' }, options),
  post: async <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> =>
    request<T>({ ...config, method: 'POST' }, options),
  delete: async <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> =>
    request<T>({ ...config, method: 'DELETE' }, options),
  put: async <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> =>
    request<T>({ ...config, method: 'PUT' }, options),
  patch: async <T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> =>
    request<T>({ ...config, method: 'PATCH' }, options),
};
