import * as httpService from '../lib/httpService';

import type { AxiosRequestConfig } from 'axios';

/**
 * Orval mutator adapter interface for HTTP requests.
 */
export interface OrvalRequest<Req = unknown, Qry = unknown> {
  url: string;
  method?: string;
  data?: Req | FormData;
  params?: Qry;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

export type OrvalMutator = <TResp = unknown, TReq = unknown, TQry = unknown>(
  opts: OrvalRequest<TReq, TQry>,
) => Promise<TResp>;

interface HttpClientOptions {
  baseURL?: string;
  withCredentials?: boolean;
}

/**
 * Request options passed to httpService methods.
 */
interface HttpRequestOptions {
  withCredentials?: boolean;
  baseURL?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

/**
 * Creates request options with common defaults.
 *
 * `withCredentials` is always on — the BFF session cookie must travel with
 * every same-origin API call. There is no `withToken`: the SPA holds no
 * token, the BFF attaches the `Bearer` server-side.
 */
function createRequestOptions(
  opts: OrvalRequest,
  clientOptions: HttpClientOptions,
): HttpRequestOptions {
  return {
    withCredentials: clientOptions.withCredentials ?? true,
    baseURL: clientOptions.baseURL,
    signal: opts.signal,
    headers: opts.headers,
    config: opts.config,
  };
}

/**
 * Handles GET requests.
 */
async function handleGet<TResp, TQry>(
  endpoint: string,
  params: TQry,
  reqOpts: HttpRequestOptions,
): Promise<TResp> {
  return httpService.get<TQry, TResp>(endpoint, params, reqOpts);
}

/**
 * Handles POST requests, including FormData.
 */
async function handlePost<TResp, TReq>(
  endpoint: string,
  data: TReq | FormData | undefined,
  reqOpts: HttpRequestOptions,
): Promise<TResp> {
  if (typeof FormData !== 'undefined' && data instanceof FormData) 
    return httpService.postForm<TResp>(endpoint, data, reqOpts);
  
  // data is TReq | undefined here since FormData case is handled above
  const payload: TReq | undefined = data instanceof FormData ? undefined : data;
  return httpService.post<TReq | undefined, TResp>(endpoint, payload, reqOpts);
}

/**
 * Handles PUT requests.
 */
async function handlePut<TResp, TReq>(
  endpoint: string,
  data: TReq | undefined,
  reqOpts: HttpRequestOptions,
): Promise<TResp> {
  return httpService.put<TReq | undefined, TResp>(endpoint, data, reqOpts);
}

/**
 * Handles PATCH requests.
 */
async function handlePatch<TResp, TReq>(
  endpoint: string,
  data: TReq | undefined,
  reqOpts: HttpRequestOptions,
): Promise<TResp> {
  return httpService.patch<TReq | undefined, TResp>(endpoint, data, reqOpts);
}

/**
 * Handles DELETE requests.
 */
async function handleDelete<TResp, TReq>(
  endpoint: string,
  data: TReq | undefined,
  reqOpts: HttpRequestOptions,
): Promise<TResp> {
  return httpService.deleteMethod<TReq | undefined, TResp>(endpoint, data, reqOpts);
}

/**
 * Creates an HTTP client instance for Orval-generated hooks.
 * @param clientOptions - Configuration options for the client (baseURL, auth settings)
 * @returns An async function that handles HTTP requests
 */
export function createHttpClient(clientOptions: HttpClientOptions = {}): OrvalMutator {
  return async <TResp = unknown, TReq = unknown, TQry = unknown>(
    opts: OrvalRequest<TReq, TQry>,
  ): Promise<TResp> => {
    const { url, method = 'GET', data, params } = opts;
    const m = method.toUpperCase();
    const endpoint = url;
    const reqOpts = createRequestOptions(opts, clientOptions);

    if (m === 'GET') 
      return handleGet<TResp, TQry | undefined>(endpoint, params, reqOpts);
    

    if (m === 'POST') 
      return handlePost<TResp, TReq>(endpoint, data, reqOpts);
    

    if (m === 'PUT') {
      // data could be TReq | FormData | undefined, but PUT doesn't use FormData
      const putData: TReq | undefined = data instanceof FormData ? undefined : data;
      return handlePut<TResp, TReq>(endpoint, putData, reqOpts);
    }

    if (m === 'PATCH') {
      const patchData: TReq | undefined = data instanceof FormData ? undefined : data;
      return handlePatch<TResp, TReq>(endpoint, patchData, reqOpts);
    }

    if (m === 'DELETE') {
      const deleteData: TReq | undefined = data instanceof FormData ? undefined : data;
      return handleDelete<TResp, TReq>(endpoint, deleteData, reqOpts);
    }

    // Fallback to POST for unsupported methods
    return handlePost<TResp, TReq>(endpoint, data, reqOpts);
  };
}
