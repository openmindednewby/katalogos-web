import { isValueDefined } from '../../../utils/is';

import type ContentCategory from '../../../shared/enums/ContentCategory';
import type ContentStatus from '../../../shared/enums/ContentStatus';

export { default as ContentCategory } from '../../../shared/enums/ContentCategory';
export { default as ContentStatus } from '../../../shared/enums/ContentStatus';

/**
 * Raw content metadata as returned from the API.
 * Note: The API uses 'externalId' instead of 'id'.
 */
export interface RawContentDto {
  externalId: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  category: ContentCategory;
  status: ContentStatus;
  fileSizeBytes: number;
  isPublic: boolean;
  metadataJson?: string;
  createdDate: string;
  lastUpdatedDate?: string;
}

/**
 * Content metadata normalized for frontend use.
 * Maps API's 'externalId' to 'id' for consistency.
 */
export interface ContentDto {
  id: string;
  fileName: string;
  contentType: string;
  category: ContentCategory;
  status: ContentStatus;
  url?: string;
  thumbnailUrl?: string;
  fileSizeBytes?: number;
  metadata?: Record<string, string | undefined>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * File size constants.
 */
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

/** Maximum image file size in MB */
const MAX_IMAGE_SIZE_MB = 10;

/**
 * Response from the single-shot multipart proxy upload
 * (`POST /api/v1/content/upload`). Mirrors `UploadContentResponse` in
 * `ContentService/Content/src/Content.Web/Upload/UploadContent.cs`.
 */
export interface UploadContentResponse {
  contentId: string;
  status: ContentStatus;
  url?: string;
}

/**
 * Response containing a content access URL.
 */
export interface ContentUrlResponse {
  url: string;
  expiresAt: string;
}

/**
 * Parameters for listing content.
 */
export interface ContentListParams {
  category?: ContentCategory;
  page?: number;
  pageSize?: number;
}

/**
 * Paginated content list response.
 */
export interface ContentListResponse {
  items: ContentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Options for the upload content hook.
 */
export interface UploadContentOptions {
  category: ContentCategory;
  isPublic?: boolean;
  onProgress?: (progress: number) => void;
  onSuccess?: (content: ContentDto) => void;
  onError?: (error: Error) => void;
}

/**
 * File information for upload.
 */
export interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Upload state for tracking upload progress.
 */
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  contentId: string | null;
}
/** Maximum video file size in MB */
const MAX_VIDEO_SIZE_MB = 500;
/** Maximum document file size in MB */
const MAX_DOCUMENT_SIZE_MB = 50;

function isMetadataRecord(value: unknown): value is Record<string, string | undefined> {
  return isValueDefined(value) && typeof value === 'object';
}

function parseMetadataJson(json: string | undefined): Record<string, string | undefined> | undefined {
  if (!isValueDefined(json) || json === '') return undefined;
  const parsed: unknown = JSON.parse(json);
  return isMetadataRecord(parsed) ? parsed : undefined;
}

/**
 * Maps raw API response to ContentDto.
 */
export function mapRawContentToDto(raw: RawContentDto): ContentDto {
  return {
    id: raw.externalId,
    fileName: raw.originalFileName !== '' ? raw.originalFileName : raw.fileName,
    contentType: raw.contentType,
    category: raw.category,
    status: raw.status,
    fileSizeBytes: raw.fileSizeBytes,
    createdAt: raw.createdDate,
    updatedAt: raw.lastUpdatedDate,
    metadata: parseMetadataJson(raw.metadataJson),
  };
}

/**
 * Maximum file sizes by category (in bytes).
 */
export const MAX_FILE_SIZES: Record<ContentCategory, number> = {
  Image: MAX_IMAGE_SIZE_MB * BYTES_PER_MB,
  Video: MAX_VIDEO_SIZE_MB * BYTES_PER_MB,
  Document: MAX_DOCUMENT_SIZE_MB * BYTES_PER_MB,
};

/**
 * Allowed MIME types by category.
 */
export const ALLOWED_MIME_TYPES: Record<ContentCategory, string[]> = {
  Image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  Video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  Document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};
