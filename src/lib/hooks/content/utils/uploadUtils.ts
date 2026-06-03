/**
 * Utility functions for content upload operations.
 *
 * Architecture (task #39, 2026-05-24): single-shot multipart POST to the
 * ContentService proxy endpoint `/api/v1/content/upload` via the BFF. The
 * server streams the bytes into SeaweedFS internally, so the browser never
 * sees a SeaweedFS URL. Replaces the broken presigned-PUT flow whose signed
 * URLs pointed at internal K8s DNS (`http://seaweedfs-s3:8333`).
 *
 * XHR (not axios) is used so we can keep `onProgress` for large files and a
 * cheap `signal.addEventListener('abort')` cancellation path.
 */
import { BFF_API_BASE } from '../../../../server/bffRoutes';
import { isValueDefined } from '../../../../utils/is';
import { get } from '../../../http/utils/methods';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, mapRawContentToDto } from '../types';


import type {
  ContentCategory,
  ContentDto,
  FileInfo,
  RawContentDto,
  UploadContentResponse,
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

/** HTTP success status range start */
const HTTP_SUCCESS_MIN = 200;
/** HTTP success status range end (exclusive) */
const HTTP_SUCCESS_MAX = 300;

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

/** Arguments for `proxyUploadContent`. */
interface ProxyUploadArgs {
  file: FileInfo;
  category: ContentCategory;
  isPublic: boolean;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * Uploads a file to ContentService via the BFF proxy in a single multipart
 * POST. Returns the new content's metadata (`{ contentId, status, url? }`).
 *
 * - URL: `${BFF_API_BASE.content}/api/v1/content/upload`
 * - Method: POST `multipart/form-data` with fields `File`, `Category`, `IsPublic`
 * - Credentials: BFF session cookie (`withCredentials`); BFF attaches the
 *   downstream `Authorization: Bearer` server-side.
 */
export async function proxyUploadContent(args: ProxyUploadArgs): Promise<UploadContentResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    setupProxyXhrEventListeners(xhr, args.onProgress, resolve, reject);
    if (isValueDefined(args.signal))
      args.signal.addEventListener('abort', () => xhr.abort());

    xhr.open('POST', `${CONTENT_API_BASE}/api/v1/content/upload`);
    xhr.withCredentials = true;
    // Bff.AspNetCore's BffAntiForgeryMiddleware rejects mutating requests
    // without this header (header-presence check — any value works, mirrors
    // `csrfInterceptor.ts`). The XHR bypasses the axios interceptor chain, so
    // we set it manually.
    xhr.setRequestHeader('X-BFF-Csrf', '1');
    fetchAndSendMultipart(xhr, args, reject);
  });
}

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

/**
 * XHR event listeners for the proxy upload (progress + load + error + abort).
 * On success, parses the JSON body into `UploadContentResponse`.
 */
function setupProxyXhrEventListeners(
  xhr: XMLHttpRequest,
  onProgress: ((progress: number) => void) | undefined,
  resolve: (value: UploadContentResponse) => void,
  reject: (error: Error) => void,
): void {
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable && isValueDefined(onProgress)) {
      const progress = Math.round((event.loaded / event.total) * PROGRESS_COMPLETE);
      onProgress(progress);
    }
  });
  xhr.addEventListener('load', () => {
    const isSuccess = xhr.status >= HTTP_SUCCESS_MIN && xhr.status < HTTP_SUCCESS_MAX;
    if (!isSuccess) {
      reject(new Error(`Upload failed with status ${xhr.status}`));
      return;
    }
    parseUploadResponse(xhr.responseText, resolve, reject);
  });
  xhr.addEventListener('error', () => reject(new Error('Upload failed due to network error')));
  xhr.addEventListener('abort', () => reject(new Error('Upload was cancelled')));
}

/** Parse the JSON response body into `UploadContentResponse`. */
function parseUploadResponse(
  responseText: string,
  resolve: (value: UploadContentResponse) => void,
  reject: (error: Error) => void,
): void {
  try {
    const parsed: unknown = JSON.parse(responseText);
    if (!isUploadContentResponse(parsed)) {
      reject(new Error('Upload response shape was invalid'));
      return;
    }
    resolve(parsed);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    reject(err);
  }
}

/** Type guard for the proxy-upload response. */
function isUploadContentResponse(value: unknown): value is UploadContentResponse {
  if (!isPlainObject(value)) return false;
  return typeof value.contentId === 'string' && typeof value.status === 'string';
}

/** Narrow `unknown` to a plain-object record without a type assertion (project lint
 *  rule `consistent-type-assertions: never` bans `as`). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && isValueDefined(value) && !Array.isArray(value);
}

/**
 * Reads the file at `args.file.uri` as a Blob and POSTs it as multipart/form-data.
 * The browser sets the `Content-Type: multipart/form-data; boundary=...` header
 * automatically when FormData is the body — never set it manually.
 */
function fetchAndSendMultipart(
  xhr: XMLHttpRequest,
  args: ProxyUploadArgs,
  reject: (error: Error) => void,
): void {
  fetch(args.file.uri)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      return response.blob();
    })
    .then((blob) => {
      if (blob.size === 0) throw new Error('File blob is empty');
      const form = new FormData();
      form.append('File', blob, args.file.name);
      form.append('Category', args.category);
      form.append('IsPublic', String(args.isPublic));
      xhr.send(form);
    })
    .catch((error: unknown) => {
      console.error('Upload error:', error);
      const err = error instanceof Error ? error : new Error(String(error));
      reject(err);
    });
}
