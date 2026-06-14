import {
  createHttpClient as createHttpClientWithTransport,
  type HttpRequestOptions,
  type HttpServicePort,
  type OrvalMutator,
  type OrvalRequest,
} from '@dloizides/orval-preset';

import * as httpService from '../lib/httpService';

// Re-export types for backward compatibility with existing imports.
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

/**
 * Maps the package's base request options onto the app's `httpService` option
 * shape. Every field the Orval-generated hooks ever set (`withCredentials`,
 * `baseURL`, `signal`, `headers`) is forwarded verbatim. `config` is left off:
 * the generated hooks never populate it, so this is behaviour-identical and
 * avoids a type assertion (the app's `config` is a concrete `AxiosRequestConfig`
 * while the port's options do not carry one).
 */
function toAppOptions(opts: HttpRequestOptions): AppRequestOptions {
  return {
    withCredentials: opts.withCredentials,
    baseURL: opts.baseURL,
    signal: opts.signal,
    headers: opts.headers,
  };
}

/**
 * Adapter binding this app's `httpService` to the package's `HttpServicePort`.
 *
 * The shared factory takes the transport as a port (it imports no product);
 * this adapter maps the app's axios bridge onto the port without any type
 * assertions. The mutator http client stays SEPARATE from the UI axios by
 * design — sharing the instance is a future optimization.
 */
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

/**
 * Thin local binding of `@dloizides/orval-preset`'s `createHttpClient` to this
 * app's `httpService` transport. Keeps the existing
 * `createHttpClient({ baseURL, withCredentials })` call shape used by the six
 * per-service `httpClient*.ts` files.
 */
export function createHttpClient(clientOptions: HttpClientOptions = {}): OrvalMutator {
  return createHttpClientWithTransport(buildHttpServicePort(), clientOptions);
}
