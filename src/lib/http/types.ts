/**
 * Shared types and interfaces for HTTP service modules.
 */
import type { AxiosRequestConfig } from 'axios';

export interface DefaultPayload {}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface HttpRequestParams<P = unknown> {
  endpoint: string;
  payload?: P;
  withToken?: boolean;
  withCredentials?: boolean;
  urlIds?: string[];
  baseURL?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

export interface HttpQueryParams<Q = unknown> extends Omit<HttpRequestParams, 'payload'> {
  queryParameters?: Q;
}
