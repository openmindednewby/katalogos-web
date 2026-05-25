


/**
 * Validates a single file against size and type constraints.
 * Use this before appending files to FormData.
 */
/**
 * File validation utilities for HTTP uploads.
 */
import { FM } from '../../../localization/helpers';
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, FILE_UPLOAD_ERROR_KEYS } from '../../../shared/constants';
import { isNotEmptyString } from '../../../utils/is';
import { logger } from '../../../utils/logger';

import type { FileValidationResult } from '../types';

/** Bytes per kilobyte */
const BYTES_PER_KB = 1024;
/** Bytes per megabyte */
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

export function validateFile(
  file: { name?: string; size?: number; type?: string },
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES,
  allowedTypes: readonly string[] = ALLOWED_FILE_TYPES
): FileValidationResult {
  const fileName = file.name ?? 'unknown';
  const fileSize = file.size ?? 0;

  // Check for empty file
  if (fileSize === 0) {
    logger.warn('httpService', `Empty file detected: ${fileName}`);
    return { valid: false, error: `${FM(FILE_UPLOAD_ERROR_KEYS.EMPTY_FILE)}: ${fileName}` };
  }

  // Check file size
  if (fileSize > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / BYTES_PER_MB);
    logger.warn('httpService', `File too large: ${fileName} (${fileSize} bytes)`);
    return { valid: false, error: `${FM(FILE_UPLOAD_ERROR_KEYS.FILE_TOO_LARGE)} (max ${maxSizeMB}MB): ${fileName}` };
  }

  // Check file type if type is available
  const fileType: string | undefined = file.type;
  if (isNotEmptyString(fileType) && !allowedTypes.includes(fileType)) {
    logger.warn('httpService', `Invalid file type: ${fileName} (${fileType})`);
    return { valid: false, error: `${FM(FILE_UPLOAD_ERROR_KEYS.INVALID_FILE_TYPE)}: ${fileName} (${fileType})` };
  }

  return { valid: true };
}
