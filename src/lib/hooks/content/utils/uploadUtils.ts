import { BFF_API_BASE } from '../../../../server/bffRoutes';
import { get } from '../../../http/utils/methods';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, mapRawContentToDto } from '../types';


import type {
  ContentCategory,
  ContentDto,
  FileInfo,
  RawContentDto,
} from '../types';

const CONTENT_API_BASE = BFF_API_BASE.content;

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

export const PROGRESS_COMPLETE = 100;

/**
 * Validates a file before upload.
 */
export function validateFile(
  file: FileInfo,
  category: ContentCategory,
): { valid: boolean; error?: string } {
  const maxSize = MAX_FILE_SIZES[category];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / BYTES_PER_MB);
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxSizeMB}MB)`,
    };
  }

  const allowedTypes = ALLOWED_MIME_TYPES[category];
  if (!allowedTypes.includes(file.type))
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed for ${category}`,
    };


  return { valid: true };
}

/** Same-origin ContentService upload endpoint (BFF proxy). The multipart POST itself */
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
