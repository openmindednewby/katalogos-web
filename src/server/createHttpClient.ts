import {
  createHttpClient as createHttpClientWithTransport,
  type HttpRequestOptions,
  type HttpServicePort,
  type OrvalMutator,
  type OrvalRequest,
} from '@dloizides/orval-preset';

import * as httpService from '../lib/httpService';

export type { OrvalRequest, OrvalMutator };

interface HttpClientOptions {
  baseURL?: string;
  withCredentials?: boolean;
}

interface AppRequestOptions {
  withCredentials?: boolean;
  baseURL?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function toAppOptions(opts: HttpRequestOptions): AppRequestOptions {
  return {
    withCredentials: opts.withCredentials,
    baseURL: opts.baseURL,
    signal: opts.signal,
    headers: opts.headers,
  };
}

function buildHttpServicePort(): HttpServicePort {
  return {
    get: async <TQry, TResp>(endpoint: string, params: TQry, opts: HttpRequestOptions): Promise<TResp> =>
      httpService.get<TQry, TResp>(endpoint, params, toAppOptions(opts)),
    post: async <TReq, TResp>(endpoint: string, data: TReq, opts: HttpRequestOptions): Promise<TResp> =>
      httpService.post<TReq, TResp>(endpoint, data, toAppOptions(opts)),
    postForm: async <TResp>(endpoint: string, data: FormData, opts: HttpRequestOptions): Promise<TResp> =>
      httpService.postForm<TResp>(endpoint, data, toAppOptions(opts)),
    put: async <TReq, TResp>(endpoint: string, data: TReq, opts: HttpRequestOptions): Promise<TResp> =>
      httpService.put<TReq, TResp>(endpoint, data, toAppOptions(opts)),
    patch: async <TReq, TResp>(endpoint: string, data: TReq, opts: HttpRequestOptions): Promise<TResp> =>
      httpService.patch<TReq, TResp>(endpoint, data, toAppOptions(opts)),
    deleteMethod: async <TReq, TResp>(endpoint: string, data: TReq, opts: HttpRequestOptions): Promise<TResp> =>
      httpService.deleteMethod<TReq, TResp>(endpoint, data, toAppOptions(opts)),
  };
}

/** Thin local binding of `@dloizides/orval-preset`'s `createHttpClient` to this */
export function createHttpClient(clientOptions: HttpClientOptions = {}): OrvalMutator {
  return createHttpClientWithTransport(buildHttpServicePort(), clientOptions);
}
