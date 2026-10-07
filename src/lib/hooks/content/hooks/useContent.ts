


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

const CONTENT_API_BASE = BFF_API_BASE.content;

const MINUTES_5 = 5;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;

const CONTENT_URL_STALE_TIME_MS = MINUTES_5 * SECONDS_PER_MINUTE * MS_PER_SECOND;

interface RawContentListResponse {
  items: RawContentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

async function fetchContent(contentId: string): Promise<ContentDto> {
  const raw = await get<undefined, RawContentDto>(`/api/v1/content/${contentId}`, undefined, {
    withToken: false,
    withCredentials: true,
    baseURL: CONTENT_API_BASE,
  });
  return mapRawContentToDto(raw);
}

async function fetchContentUrl(contentId: string): Promise<ContentUrlResponse> {
  return Promise.resolve({
    url: `${CONTENT_API_BASE}/api/v1/content/${contentId}/download`,
    expiresAt: '',
  });
}

async function fetchPublicContentUrl(contentId: string): Promise<ContentUrlResponse> {
  return Promise.resolve({
    url: `${CONTENT_API_BASE}/api/v1/content/${contentId}/public-download`,
    expiresAt: '',
  });
}

async function fetchContentList(params: ContentListParams): Promise<ContentListResponse> {
  const raw = await get<ContentListParams, RawContentListResponse>('/api/v1/content', params, {
    withToken: false,
    withCredentials: true,
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

/** Hook for fetching a content access URL. */
export function useContentUrl(
  contentId: string | undefined,
  options?: Omit<UseQueryOptions<ContentUrlResponse>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ContentUrlResponse> {
  return useQuery({
    queryKey: getContentUrlQueryKey(contentId ?? ''),
    queryFn: async () => fetchContentUrl(contentId ?? ''),
    enabled: isValueDefined(contentId) && contentId !== '',
    staleTime: CONTENT_URL_STALE_TIME_MS,
    ...options,
  });
}

/** Hook for fetching a public content access URL (no authentication required). */
export function usePublicContentUrl(
  contentId: string | undefined,
  options?: Omit<UseQueryOptions<ContentUrlResponse>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ContentUrlResponse> {
  return useQuery({
    queryKey: getPublicContentUrlQueryKey(contentId ?? ''),
    queryFn: async () => fetchPublicContentUrl(contentId ?? ''),
    enabled: isValueDefined(contentId) && contentId !== '',
    staleTime: CONTENT_URL_STALE_TIME_MS,
    ...options,
  });
}

/** Hook for fetching a paginated list of content items. */
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
