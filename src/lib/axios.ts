
import { apiClient, registerAllInterceptors } from './api/apiClient';

import type { AxiosRequestConfig } from 'axios';

export interface RequestOptions {
  withToken?: boolean;
  withCredentials?: boolean;
  errorMessageMode?: 'modal' | 'none';
  headers?: Record<string, string>;
  signal?: AbortSignal;
  config?: AxiosRequestConfig;
}

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
