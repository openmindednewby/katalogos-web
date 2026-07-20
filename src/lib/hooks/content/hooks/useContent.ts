


/**
 * Hook for fetching a single content item by ID.
 *
 * @param contentId - The ID of the content to fetch
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * const { data: content, isLoading } = useContent('content-123');
 *
 * if (isLoading) return <Loading />;
 * if (content) return <Image source={{ uri: content.url }} />;
 * ```
 */
/**
 * Hooks for fetching content from the Content Service.
 */
import { useQuery } from '@tanstack/react-query';

import { mapRawContentToDto } from '../types';
import { getContentListQueryKey, getContentQueryKey } from './useUploadContent';
import { BFF_API_BASE } from '../../../../server/bffRoutes';
import { isValueDefined } from '../../../../utils/is';
import { get } from '../../../http/utils/methods';


import type {
  ContentDto,
  ContentListParams,
  ContentListResponse,
  ContentUrlResponse,
  RawContentDto,
} from '../types';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

// ContentService is reached same-origin through the BFF (`/bff/api/content`).
// See uploadUtils.ts / server/httpClientContent.ts — post-BFF-cutover the SPA
// holds no token to send (`withToken` is a no-op), so a direct cross-origin
// call to content-api.dloizides.com arrives unauthenticated.
// NOTE: CORS is *not* the blocker — content-api does return
// `Access-Control-Allow-Origin` for the deployed app hosts (verified
// 2026-07-20). An earlier version of this comment claimed otherwise and led a
// follow-up investigation to the wrong root cause.
const CONTENT_API_BASE = BFF_API_BASE.content;

/**
 * Time constants for stale time calculation.
 */
const MINUTES_5 = 5;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;

/**
 * Default stale time for content URLs (5 minutes).
 */
const CONTENT_URL_STALE_TIME_MS = MINUTES_5 * SECONDS_PER_MINUTE * MS_PER_SECOND;

/**
 * Raw content list response from the API.
 */
interface RawContentListResponse {
  items: RawContentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Fetches a single content item by ID.
 */
async function fetchContent(contentId: string): Promise<ContentDto> {
  const raw = await get<undefined, RawContentDto>(`/api/v1/content/${contentId}`, undefined, {
    withToken: false,
    withCredentials: true, // BFF session cookie — token attached server-side
    baseURL: CONTENT_API_BASE,
  });
  return mapRawContentToDto(raw);
}

/**
 * Returns the authenticated content access URL.
 *
 * Resolves to the same-origin BFF *streaming* path (`/content/{id}/download`)
 * rather than the backend `/url` endpoint's presigned S3 URL. S3 is internal-
 * only (no public ingress), so a presigned URL points at an unreachable host
 * and the browser can't load the image. The streaming path proxies the bytes
 * through content-api (public via the BFF); the BFF session cookie carries auth.
 */
async function fetchContentUrl(contentId: string): Promise<ContentUrlResponse> {
  return Promise.resolve({
    url: `${CONTENT_API_BASE}/api/v1/content/${contentId}/download`,
    expiresAt: '',
  });
}

/**
 * Returns the public (unauthenticated) content access URL — the same-origin BFF
 * `/content/{id}/public-download` streaming path (see {@link fetchContentUrl}).
 */
async function fetchPublicContentUrl(contentId: string): Promise<ContentUrlResponse> {
  return Promise.resolve({
    url: `${CONTENT_API_BASE}/api/v1/content/${contentId}/public-download`,
    expiresAt: '',
  });
}

/**
 * Fetches a list of content items.
 */
async function fetchContentList(params: ContentListParams): Promise<ContentListResponse> {
  const raw = await get<ContentListParams, RawContentListResponse>('/api/v1/content', params, {
    withToken: false,
    withCredentials: true, // BFF session cookie — token attached server-side
    baseURL: CONTENT_API_BASE,
  });
  return {
    items: raw.items.map(mapRawContentToDto),
    totalCount: raw.totalCount,
    page: raw.page,
    pageSize: raw.pageSize,
  };
}

export function useContent(
  contentId: string | undefined,
  options?: Omit<UseQueryOptions<ContentDto>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ContentDto> {
  return useQuery({
    queryKey: getContentQueryKey(contentId ?? ''),
    queryFn: async () => fetchContent(contentId ?? ''),
    enabled: isValueDefined(contentId) && contentId !== '',
    ...options,
  });
}

/**
 * Query key for content URL queries.
 */
export function getContentUrlQueryKey(contentId: string): string[] {
  return ['content', contentId, 'url'];
}

/**
 * Query key for public content URL queries.
 */
export function getPublicContentUrlQueryKey(contentId: string): string[] {
  return ['content', contentId, 'public-url'];
}

/**
 * Hook for fetching a content access URL.
 * The URL may be a signed URL with expiration for private content.
 *
 * @param contentId - The ID of the content
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * const { data: urlData, isLoading } = useContentUrl('content-123');
 *
 * if (isLoading) return <Loading />;
 * if (urlData) {
 *   // URL expires at urlData.expiresAt
 *   return <Image source={{ uri: urlData.url }} />;
 * }
 * ```
 */
export function useContentUrl(
  contentId: string | undefined,
  options?: Omit<UseQueryOptions<ContentUrlResponse>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ContentUrlResponse> {
  return useQuery({
    queryKey: getContentUrlQueryKey(contentId ?? ''),
    queryFn: async () => fetchContentUrl(contentId ?? ''),
    enabled: isValueDefined(contentId) && contentId !== '',
    // Refresh URL before expiration (default stale time of 5 minutes)
    staleTime: CONTENT_URL_STALE_TIME_MS,
    ...options,
  });
}

/**
 * Hook for fetching a public content access URL (no authentication required).
 * Used for public pages where users may not be logged in.
 * The URL is for content that has been marked as public.
 *
 * @param contentId - The ID of the content
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * // On a public menu page
 * const { data: urlData, isLoading } = usePublicContentUrl('content-123');
 *
 * if (isLoading) return <Loading />;
 * if (urlData) {
 *   return <Image source={{ uri: urlData.url }} />;
 * }
 * ```
 */
export function usePublicContentUrl(
  contentId: string | undefined,
  options?: Omit<UseQueryOptions<ContentUrlResponse>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ContentUrlResponse> {
  return useQuery({
    queryKey: getPublicContentUrlQueryKey(contentId ?? ''),
    queryFn: async () => fetchPublicContentUrl(contentId ?? ''),
    enabled: isValueDefined(contentId) && contentId !== '',
    // Refresh URL before expiration (default stale time of 5 minutes)
    staleTime: CONTENT_URL_STALE_TIME_MS,
    ...options,
  });
}

/**
 * Hook for fetching a paginated list of content items.
 *
 * @param params - Filter and pagination parameters
 * @param options - Additional React Query options
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useContentList({
 *   category: 'Image',
 *   page: 1,
 *   pageSize: 20,
 * });
 *
 * if (isLoading) return <Loading />;
 * if (data) {
 *   return data.items.map(item => <ContentPreview key={item.id} content={item} />);
 * }
 * ```
 */
export function useContentList(
  params: ContentListParams = {},
  options?: Omit<UseQueryOptions<ContentListResponse>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ContentListResponse> {
  const { category, page = 1, pageSize = 20 } = params;

  return useQuery({
    queryKey: [...getContentListQueryKey(category), page, pageSize],
    queryFn: async () => fetchContentList({ category, page, pageSize }),
    ...options,
  });
}

export default useContent;
