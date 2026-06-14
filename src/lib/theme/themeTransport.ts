/**
 * App-owned ports for `@dloizides/tenant-theme-web`.
 *
 * The shared package owns the tenant-theme fetch/cache/mapper logic; this module
 * supplies the per-app concerns: the HTTP transport (wired to the app's
 * BFF `apiClient` and the Identity Orval mutator), the API base URL, the
 * product's fallback palette, and the cache-failure logger.
 */
import { configureThemeCacheLogger } from '@dloizides/tenant-theme-web';

import env from '../../config/environment';
import { identityInstance } from '../../server/mutators/identityMutator';
import { isNotEmptyString } from '../../shared/utils/validators';
import { DEFAULT_THEME_CONFIG } from '../../theme/presets';
import { logger } from '../../utils/logger';
import { apiClient } from '../api/apiClient';

import type {
  HttpGetArgs,
  HttpPut,
  HttpPutArgs,
  HttpResponse,
  TenantThemeConfig,
} from '@dloizides/tenant-theme-web';
import type { AxiosResponse } from 'axios';

const DEFAULT_IDENTITY_URL = 'http://localhost:5002';

/** Resolve the Identity API base URL from app config. */
export function getIdentityBaseUrl(): string {
  return isNotEmptyString(env.IDENTITY_API_URL) ? env.IDENTITY_API_URL : DEFAULT_IDENTITY_URL;
}

/** The product's fallback palette (theme preset values stay per-app). */
export const defaultThemeConfig: TenantThemeConfig = DEFAULT_THEME_CONFIG;

/** GET transport wired to the BFF apiClient (axios). */
export async function httpGet<TData = unknown>(args: HttpGetArgs): Promise<HttpResponse<TData>> {
  const response: AxiosResponse<TData> = await apiClient.request<TData>({
    url: args.url,
    method: 'GET',
    baseURL: args.baseURL,
    headers: args.headers,
    signal: args.signal,
    validateStatus: args.validateStatus,
  });
  return { status: response.status, data: response.data, headers: response.headers };
}

/** PUT transport wired to the Identity Orval mutator. */
export const httpPut: HttpPut = async <TResp = unknown, TBody = unknown>(
  args: HttpPutArgs<TBody>,
): Promise<TResp> =>
  identityInstance<TResp, TBody>({
    url: args.url,
    method: 'PUT',
    headers: args.headers,
    data: args.data,
  });

// Route the package's cache-failure warnings through the app logging service.
configureThemeCacheLogger((context, message, error) => logger.warn(context, message, error));
