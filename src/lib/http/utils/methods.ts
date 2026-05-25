/**
 * Core HTTP methods (GET, POST, PUT, PATCH, DELETE).
 */
import { buildURL, buildPayload, buildQueryParams, buildFormDataPayload } from './utils';
import env from '../../../config/environment';
import { isValueDefined } from '../../../utils/is';
import { deffHttp, type RequestOptions } from '../../axios';

import type { AxiosRequestConfig } from 'axios';

export interface HttpRequestOptions {
  withToken?: boolean;
  withCredentials?: boolean;
  urlIds?: string[];
  baseURL?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

export async function deleteMethod<P, R>(
  endpoint: string,
  payload: P,
  options?: HttpRequestOptions,
): Promise<R> {
  const withToken = options?.withToken ?? true;
  const withCredentials = options?.withCredentials ?? true;
  const baseURL = options?.baseURL ?? env.API_URL;

  const url: string = buildURL(endpoint, options?.urlIds);

  const axiosRequestConfig: AxiosRequestConfig = {
    url,
    data: buildPayload<P>(payload),
    withCredentials,
    baseURL,
    signal: options?.signal,
    headers: options?.headers,
    ...(options?.config ?? {}),
  };

  const requestOptions: RequestOptions = {
    errorMessageMode: 'modal',
    withToken,
    withCredentials,
    headers: options?.headers,
    signal: options?.signal,
    config: options?.config,
  };

  return await deffHttp.delete<R>(axiosRequestConfig, requestOptions);
}

export async function postForm<R>(
  endpoint: string,
  formData: FormData,
  options?: Omit<HttpRequestOptions, 'urlIds'>,
): Promise<R> {
  const withToken = options?.withToken ?? true;
  const withCredentials = options?.withCredentials ?? true;
  const baseURL = options?.baseURL ?? env.API_URL;

  const axiosRequestConfig: AxiosRequestConfig = {
    url: endpoint,
    data: buildFormDataPayload(formData),
    withCredentials,
    headers: { 'Content-Type': 'multipart/form-data', ...(options?.headers ?? {}) },
    baseURL,
    signal: options?.signal,
    ...(options?.config ?? {}),
  };

  const requestOptions: RequestOptions = {
    errorMessageMode: 'modal',
    withToken,
    withCredentials,
    headers: options?.headers,
    signal: options?.signal,
    config: options?.config,
  };

  return await deffHttp.post<R>(axiosRequestConfig, requestOptions);
}

export async function post<P, R>(
  endpoint: string,
  payload: P,
  options?: HttpRequestOptions,
): Promise<R> {
  const withToken = options?.withToken ?? true;
  const withCredentials = options?.withCredentials ?? true;
  const baseURL = options?.baseURL ?? env.API_URL;

  const url: string = buildURL(endpoint, options?.urlIds);

  const axiosRequestConfig: AxiosRequestConfig = {
    url,
    data: buildPayload<P>(payload),
    withCredentials,
    baseURL,
    signal: options?.signal,
    headers: options?.headers,
    ...(options?.config ?? {}),
  };

  const requestOptions: RequestOptions = {
    errorMessageMode: 'modal',
    withToken,
    withCredentials,
    headers: options?.headers,
    signal: options?.signal,
    config: options?.config,
  };

  return await deffHttp.post<R>(axiosRequestConfig, requestOptions);
}

export async function put<P, R>(
  endpoint: string,
  payload: P,
  options?: HttpRequestOptions,
): Promise<R> {
  const withToken = options?.withToken ?? true;
  const withCredentials = options?.withCredentials ?? true;
  const baseURL = options?.baseURL ?? env.API_URL;

  const url: string = buildURL(endpoint, options?.urlIds);

  const axiosRequestConfig: AxiosRequestConfig = {
    url,
    data: buildPayload<P>(payload),
    withCredentials,
    baseURL,
    signal: options?.signal,
    headers: options?.headers,
    ...(options?.config ?? {}),
  };

  const requestOptions: RequestOptions = {
    errorMessageMode: 'modal',
    withToken,
    withCredentials,
    headers: options?.headers,
    signal: options?.signal,
    config: options?.config,
  };

  return await deffHttp.put<R>(axiosRequestConfig, requestOptions);
}

export async function patch<P, R>(
  endpoint: string,
  payload: P,
  options?: HttpRequestOptions,
): Promise<R> {
  const withToken = options?.withToken ?? true;
  const withCredentials = options?.withCredentials ?? true;
  const baseURL = options?.baseURL ?? env.API_URL;

  const url: string = buildURL(endpoint, options?.urlIds);

  const axiosRequestConfig: AxiosRequestConfig = {
    url,
    data: buildPayload<P>(payload),
    withCredentials,
    baseURL,
    signal: options?.signal,
    headers: options?.headers,
    ...(options?.config ?? {}),
  };

  const requestOptions: RequestOptions = {
    errorMessageMode: 'modal',
    withToken,
    withCredentials,
    headers: options?.headers,
    signal: options?.signal,
    config: options?.config,
  };

  return await deffHttp.patch<R>(axiosRequestConfig, requestOptions);
}

export async function get<Q, R>(
  endpoint: string,
  queryParameters?: Q,
  options?: HttpRequestOptions,
): Promise<R> {
  const withToken = options?.withToken ?? true;
  const withCredentials = options?.withCredentials ?? true;
  const baseURL = options?.baseURL ?? env.API_URL;

  const url: string = buildURL(endpoint, options?.urlIds);
  const axiosRequestConfig: AxiosRequestConfig = {
    url,
    params: resolveQueryParams(queryParameters),
    withCredentials,
    baseURL,
    signal: options?.signal,
    headers: options?.headers,
    ...(options?.config ?? {}),
  };
  const requestOptions: RequestOptions = {
    errorMessageMode: 'modal',
    withToken,
    withCredentials,
    headers: options?.headers,
    signal: options?.signal,
    config: options?.config,
  };

  return await deffHttp.get<R>(axiosRequestConfig, requestOptions);
}

function resolveQueryParams<Q>(queryParameters?: Q): Record<string, unknown> | undefined {
  if (!isValueDefined(queryParameters)) return undefined;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Q is always an object when defined
  return buildQueryParams(queryParameters as Record<string, unknown>);
}
