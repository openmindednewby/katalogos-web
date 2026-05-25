

/**
 * Endpoint-based HTTP methods using EndpointKey for type-safe API calls.
 */
import { get, post, put, deleteMethod } from './methods';
import env from '../../../config/environment';
import { type EndpointKey, interpolateEndpoint } from '../../../server/endpointMeta';
import { Endpoints } from '../../../server/endpoints';
import { isValueDefined } from '../../../utils/is';
import { logger } from '../../../utils/logger';

import type { HttpRequestOptions } from './methods';

export async function getByEndpoint<Q, R>(
  endpointKeyOrValue: EndpointKey | Endpoints,
  options?: {
    params?: Record<string, string | number>;
    queryParameters?: Q;
  } & Omit<HttpRequestOptions, 'urlIds'>,
): Promise<R> {
  const endpointKey = resolveEndpointKey(endpointKeyOrValue);
  const path = interpolateEndpoint(endpointKey, options?.params);
  const requestOptions: HttpRequestOptions = {
    withToken: options?.withToken,
    withCredentials: options?.withCredentials,
    baseURL: options?.baseURL ?? env.API_URL,
    signal: options?.signal,
    headers: options?.headers,
    config: options?.config,
  };
  return await get<Q, R>(path, options?.queryParameters, requestOptions);
}

export async function postByEndpoint<P, R>(
  endpointKeyOrValue: EndpointKey | Endpoints,
  payload: P,
  options?: {
    params?: Record<string, string | number>;
  } & Omit<HttpRequestOptions, 'urlIds'>,
): Promise<R> {
  const endpointKey = resolveEndpointKey(endpointKeyOrValue);
  const path = interpolateEndpoint(endpointKey, options?.params);
  const requestOptions: HttpRequestOptions = {
    withToken: options?.withToken,
    withCredentials: options?.withCredentials,
    baseURL: options?.baseURL ?? env.API_URL,
    signal: options?.signal,
    headers: options?.headers,
    config: options?.config,
  };
  return await post<P, R>(path, payload, requestOptions);
}

export async function putByEndpoint<P, R>(
  endpointKeyOrValue: EndpointKey | Endpoints,
  payload: P,
  options?: {
    params?: Record<string, string | number>;
  } & Omit<HttpRequestOptions, 'urlIds'>,
): Promise<R> {
  const endpointKey = resolveEndpointKey(endpointKeyOrValue);
  const path = interpolateEndpoint(endpointKey, options?.params);
  const requestOptions: HttpRequestOptions = {
    withToken: options?.withToken,
    withCredentials: options?.withCredentials,
    baseURL: options?.baseURL ?? env.API_URL,
    signal: options?.signal,
    headers: options?.headers,
    config: options?.config,
  };
  return await put<P, R>(path, payload, requestOptions);
}

export async function deleteByEndpoint<P, R>(
  endpointKeyOrValue: EndpointKey | Endpoints,
  payload: P,
  options?: {
    params?: Record<string, string | number>;
  } & Omit<HttpRequestOptions, 'urlIds'>,
): Promise<R> {
  const endpointKey = resolveEndpointKey(endpointKeyOrValue);
  const path = interpolateEndpoint(endpointKey, options?.params);
  const requestOptions: HttpRequestOptions = {
    withToken: options?.withToken,
    withCredentials: options?.withCredentials,
    baseURL: options?.baseURL ?? env.API_URL,
    signal: options?.signal,
    headers: options?.headers,
    config: options?.config,
  };
  return await deleteMethod<P, R>(path, payload, requestOptions);
}

/**
 * Resolves an EndpointKey from either a key name or enum value.
 */
function isEndpointKey(value: string): value is EndpointKey {
  return Object.keys(Endpoints).includes(value);
}

function resolveEndpointKey(e: EndpointKey | Endpoints): EndpointKey {
  const asString = String(e);

  // If caller passed the member NAME (EndpointKey), return it.
  if (isEndpointKey(asString)) 
    return asString;
  

  // Otherwise, try to find a member name whose value equals the provided enum value
  const endpointsMap: Record<string, string> = Object.fromEntries(
    Object.entries(Endpoints).filter(([, v]) => typeof v === 'string')
  );
  const endpointKeys = Object.keys(Endpoints);
  const found = endpointKeys.find(
    (k) => endpointsMap[k] === asString
  );
  if (!isValueDefined(found) || !isEndpointKey(found)) {
    logger.error('httpService', `Cannot resolve endpoint key for ${String(e)}`);
    throw new Error(`Cannot resolve endpoint key for ${String(e)}`);
  }
  return found;
}
