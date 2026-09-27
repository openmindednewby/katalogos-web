/**
 * Utility functions for content upload operations.
 *
 * Architecture (task #39, 2026-05-24): single-shot multipart POST to the
 * ContentService proxy endpoint `/api/v1/content/upload` via the BFF. The
 * server streams the bytes into SeaweedFS internally, so the browser never
 * sees a SeaweedFS URL. Replaces the broken presigned-PUT flow whose signed
 * URLs pointed at internal K8s DNS (`http://seaweedfs-s3:8333`).
 *
 * The transport is `@dloizides/content-upload` (KEFI-PEOPLE-1 T11 "adopt the
 * shared upload client"); this file keeps only katalogos-specific validation,
 * the endpoint, and the post-upload metadata fetch.
 */
import { BFF_API_BASE } from '../../../../server/bffRoutes';
import { get } from '../../../http/utils/methods';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, mapRawContentToDto } from '../types';


import type {
  ContentCategory,
  ContentDto,
  FileInfo,
  RawContentDto,
} from '../types';

// ContentService is reached same-origin through the BFF (`/bff/api/content`),
// exactly like the auto-generated content hooks in `server/httpClientContent.ts`.
// The BFF attaches the `Authorization: Bearer` server-side from its token vault,
// so these calls use the cookie-based BFF session (`withCredentials: true`) and
// never carry a browser-side token. A direct call to `content-api.dloizides.com`
// would be cross-origin from the staging host and is CORS-blocked.
const CONTENT_API_BASE = BFF_API_BASE.content;

/** Bytes per kilobyte */
const BYTES_PER_KB = 1024;
/** Bytes per megabyte */
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

export const PROGRESS_COMPLETE = 100;

/**
 * Validates a file before upload.
 */
export function validateFile(
  file: FileInfo,
  category: ContentCategory,
): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = MAX_FILE_SIZES[category];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / BYTES_PER_MB);
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxSizeMB}MB)`,
    };
  }

  // Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[category];
  if (!allowedTypes.includes(file.type))
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed for ${category}`,
    };


  return { valid: true };
}

/**
 * Same-origin ContentService upload endpoint (BFF proxy). The multipart POST itself
 * (fields `File`, `Category`, `IsPublic`; `X-BFF-Csrf` header; cookie credentials;
 * XHR progress + abort) is done by `@dloizides/content-upload`'s `uploadImage`.
 */
export const CONTENT_UPLOAD_ENDPOINT = `${CONTENT_API_BASE}/api/v1/content/upload`;

/**
 * Fetches the content metadata after upload completion.
 */
export async function fetchContent(contentId: string): Promise<ContentDto> {
  const raw = await get<undefined, RawContentDto>(`/api/v1/content/${contentId}`, undefined, {
    withToken: false,
    withCredentials: true,
    baseURL: CONTENT_API_BASE,
  });
  return mapRawContentToDto(raw);
}
