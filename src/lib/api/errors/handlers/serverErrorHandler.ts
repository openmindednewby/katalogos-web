/**
 * Server error handler utilities.
 *
 * Provides helpers for 5xx server errors including
 * maintenance mode detection and Retry-After header parsing.
 */

import { isValueDefined } from '../../../../utils/is';

import type { ClassifiedError } from '../errorTypes';

/** HTTP 503 Service Unavailable */
const STATUS_SERVICE_UNAVAILABLE = 503;

/** HTTP 502 Bad Gateway */
const STATUS_BAD_GATEWAY = 502;

/** HTTP 504 Gateway Timeout */
const STATUS_GATEWAY_TIMEOUT = 504;

/** Retry-After header name (lowercase for normalized headers) */
const RETRY_AFTER_HEADER = 'retry-after';

/** Server error info extracted from response */
interface ServerErrorInfo {
  isMaintenanceMode: boolean;
  retryAfterSeconds: number | undefined;
  isGatewayError: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Parse the Retry-After header value.
 * Supports both seconds (numeric) and HTTP-date format.
 */
function parseRetryAfter(headerValue: string): number | undefined {
  const asNumber = Number(headerValue);
  if (!Number.isNaN(asNumber) && asNumber > 0)
    return asNumber;

  const asDate = Date.parse(headerValue);
  if (!Number.isNaN(asDate)) {
    const diffMs = asDate - Date.now();
    const MS_PER_SECOND = 1000;
    if (diffMs > 0) return Math.ceil(diffMs / MS_PER_SECOND);
  }

  return undefined;
}

function extractRetryAfter(error: ClassifiedError): number | undefined {
  const originalError = error.originalError;
  if (!isRecord(originalError)) return undefined;

  const response: unknown = originalError.response;
  if (!isRecord(response)) return undefined;

  const headers: unknown = response.headers;
  if (!isRecord(headers)) return undefined;

  const retryAfter: unknown = headers[RETRY_AFTER_HEADER];
  if (typeof retryAfter === 'string') return parseRetryAfter(retryAfter);

  return undefined;
}

/**
 * Extract server error information from a classified error.
 * Detects maintenance mode (503) and gateway errors (502/504).
 */
function extractServerErrorInfo(error: ClassifiedError): ServerErrorInfo {
  const isMaintenanceMode = error.status === STATUS_SERVICE_UNAVAILABLE;
  const isGatewayError = error.status === STATUS_BAD_GATEWAY || error.status === STATUS_GATEWAY_TIMEOUT;
  const retryAfterSeconds = extractRetryAfter(error);

  return { isMaintenanceMode, retryAfterSeconds, isGatewayError };
}

export { extractServerErrorInfo, parseRetryAfter };
export type { ServerErrorInfo };
