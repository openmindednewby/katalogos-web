/**
 * API function to fetch tenant theme configuration from IdentityService.
 *
 * The API returns a flat DTO shape (presetId, colors, darkColors, typography).
 * This module transforms it into the frontend TenantThemeConfig format.
 *
 * Supports ETag-based conditional requests:
 * - Sends If-None-Match header when a cached ETag is available
 * - Returns the response ETag for caching
 * - Returns null themeConfig on 304 Not Modified (caller uses cached data)
 *
 * Endpoint: GET /api/tenants/{tenantId}/theme
 */
import env from '../../../config/environment';
import { isNotEmptyString } from '../../../shared/utils/validators';
import { DEFAULT_THEME_CONFIG } from '../../../theme/presets';
import { isValueDefined } from '../../../utils/is';
import { apiClient } from '../../api/axiosInstance';

import type { TenantThemeConfig, ThemeModeColors } from '../../../theme/types';
import type { AxiosResponse } from 'axios';

// -- Constants ----------------------------------------------------------------

const DEFAULT_IDENTITY_URL = 'http://localhost:5002';

/** HTTP status range for successful responses (inclusive). */
const HTTP_SUCCESS_MIN = 200;
const HTTP_SUCCESS_MAX = 299;

/** HTTP 304 status code for Not Modified responses. */
const HTTP_NOT_MODIFIED = 304;

/** HTTP 404 status code for Not Found responses. */
const HTTP_NOT_FOUND = 404;

const ETAG_HEADER = 'etag';
const IF_NONE_MATCH_HEADER = 'If-None-Match';

// -- DTO types ----------------------------------------------------------------

/** Colors DTO returned by the API. */
interface ApiThemeColorsDto {
  primary?: string | null;
  primaryLight?: string | null;
  primaryDark?: string | null;
  secondary?: string | null;
  background?: string | null;
  surface?: string | null;
  error?: string | null;
  onPrimary?: string | null;
  onBackground?: string | null;
  onSurface?: string | null;
}

/** Raw response shape from GET /api/tenants/{tenantId}/theme */
interface ApiThemeResponseDto {
  presetId?: string | null;
  colors?: ApiThemeColorsDto | null;
  darkColors?: ApiThemeColorsDto | null;
  typography?: { fontFamily?: string | null; headerScale?: number | null; bodyScale?: number | null } | null;
  logoContentId?: string | null;
  faviconContentId?: string | null;
}

/** Options for the fetch call. */
export interface FetchTenantThemeOptions {
  signal?: AbortSignal;
  /** Cached ETag to send as If-None-Match header. */
  cachedEtag?: string;
}

/** Frontend-facing response shape consumed by useTenantTheme. */
export interface TenantThemeResponse {
  themeConfig: TenantThemeConfig | null;
  etag: string | null;
  /** True when the server returned 304 Not Modified (use cached data). */
  notModified: boolean;
}

// -- DTO mapping helpers ------------------------------------------------------

function mapColorsToMode(dto: ApiThemeColorsDto | null | undefined, fallback: ThemeModeColors): ThemeModeColors {
  if (!isValueDefined(dto)) return fallback;
  return {
    background: dto.background ?? fallback.background,
    surface: dto.surface ?? fallback.surface,
    surfaceElevated: fallback.surfaceElevated,
    text: dto.onBackground ?? fallback.text,
    textSecondary: dto.onSurface ?? fallback.textSecondary,
    border: fallback.border,
    divider: fallback.divider,
  };
}

function mapBrandColors(colors: ApiThemeColorsDto | null | undefined): Pick<TenantThemeConfig, 'primary' | 'secondary' | 'accent'> {
  return {
    primary: colors?.primary ?? DEFAULT_THEME_CONFIG.primary,
    secondary: colors?.secondary ?? DEFAULT_THEME_CONFIG.secondary,
    accent: colors?.primaryLight ?? DEFAULT_THEME_CONFIG.accent,
  };
}

function mapTypography(dto: ApiThemeResponseDto): TenantThemeConfig['typography'] {
  if (!isValueDefined(dto.typography)) return undefined;
  return {
    fontFamily: dto.typography.fontFamily ?? undefined,
    headingScale: dto.typography.headerScale ?? undefined,
  };
}

function toTenantThemeConfig(dto: ApiThemeResponseDto): TenantThemeConfig {
  return {
    ...mapBrandColors(dto.colors),
    semantic: {
      success: DEFAULT_THEME_CONFIG.semantic?.success,
      warning: DEFAULT_THEME_CONFIG.semantic?.warning,
      error: dto.colors?.error ?? DEFAULT_THEME_CONFIG.semantic?.error,
      info: DEFAULT_THEME_CONFIG.semantic?.info,
    },
    light: mapColorsToMode(dto.colors, DEFAULT_THEME_CONFIG.light),
    dark: mapColorsToMode(dto.darkColors, DEFAULT_THEME_CONFIG.dark),
    typography: mapTypography(dto),
    branding: {
      presetId: dto.presetId ?? null,
      logoContentId: dto.logoContentId ?? null,
      faviconContentId: dto.faviconContentId ?? null,
    },
  };
}

function hasThemeData(dto: ApiThemeResponseDto): boolean {
  return isValueDefined(dto.presetId) || isValueDefined(dto.colors) || isValueDefined(dto.darkColors) || isValueDefined(dto.typography);
}

// -- HTTP helpers -------------------------------------------------------------

function getIdentityBaseUrl(): string {
  return isNotEmptyString(env.IDENTITY_API_URL) ? env.IDENTITY_API_URL : DEFAULT_IDENTITY_URL;
}

function buildRequestHeaders(cachedEtag: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (isNotEmptyString(cachedEtag)) headers[IF_NONE_MATCH_HEADER] = cachedEtag;
  return headers;
}

function extractEtag(response: AxiosResponse): string | null {
  const headerValue: unknown = response.headers[ETAG_HEADER];
  if (typeof headerValue === 'string' && headerValue.length > 0) return headerValue;
  return null;
}

interface ErrorWithResponse {
  response?: { status?: unknown };
}

function isErrorWithResponse(value: unknown): value is ErrorWithResponse {
  if (!isValueDefined(value) || typeof value !== 'object') return false;
  return 'response' in value;
}

function isNotModifiedResponse(error: unknown): boolean {
  if (!isErrorWithResponse(error)) return false;
  return error.response?.status === HTTP_NOT_MODIFIED;
}

function isNotFoundResponse(error: unknown): boolean {
  if (!isErrorWithResponse(error)) return false;
  return error.response?.status === HTTP_NOT_FOUND;
}

function isSuccessOrNotModified(status: number): boolean {
  return (status >= HTTP_SUCCESS_MIN && status <= HTTP_SUCCESS_MAX) || status === HTTP_NOT_MODIFIED;
}

function buildNotModifiedResult(cachedEtag: string | undefined): TenantThemeResponse {
  return { themeConfig: null, etag: cachedEtag ?? null, notModified: true };
}

// -- Public API ---------------------------------------------------------------

/**
 * Fetch the tenant theme configuration from the Identity API.
 * Transforms the API DTO into TenantThemeConfig format.
 * Returns null config if the tenant has no theme configured.
 *
 * Supports ETag-based conditional requests:
 * - Pass cachedEtag to send If-None-Match header
 * - On 304 Not Modified, returns { notModified: true } so caller uses cached data
 */
export async function fetchTenantTheme(
  tenantId: string,
  options?: FetchTenantThemeOptions,
): Promise<TenantThemeResponse> {
  const baseURL = getIdentityBaseUrl();
  const headers = buildRequestHeaders(options?.cachedEtag);

  try {
    const response: AxiosResponse<ApiThemeResponseDto> = await apiClient.request({
      url: `/api/tenants/${tenantId}/theme`,
      method: 'GET',
      baseURL,
      headers,
      signal: options?.signal,
      validateStatus: isSuccessOrNotModified,
    });

    if (response.status === HTTP_NOT_MODIFIED)
      return buildNotModifiedResult(options?.cachedEtag);

    const dto = response.data;
    const etag = extractEtag(response);
    const hasData = isValueDefined(dto) && hasThemeData(dto);

    return { themeConfig: hasData ? toTenantThemeConfig(dto) : null, etag, notModified: false };
  } catch (error: unknown) {
    if (isNotModifiedResponse(error)) return buildNotModifiedResult(options?.cachedEtag);
    if (isNotFoundResponse(error)) return { themeConfig: null, etag: null, notModified: false };
    throw error;
  }
}
