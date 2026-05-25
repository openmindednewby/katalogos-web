/**
 * Network error handler utilities.
 *
 * Distinguishes between offline, timeout, and DNS resolution errors.
 * Uses navigator.onLine when available to detect offline status.
 */

import type { ClassifiedError } from '../errorTypes';

/** Error code Axios uses for request timeouts */
const TIMEOUT_ERROR_CODE = 'ECONNABORTED';

/** Status code indicating no response was received */
const NETWORK_ERROR_STATUS = 0;

/** Network error classification result */
interface NetworkErrorInfo {
  isOffline: boolean;
  isTimeout: boolean;
  isDnsFailure: boolean;
  isNetworkError: boolean;
}

/**
 * Check if the browser/device is currently offline.
 * Falls back to false if navigator is unavailable (SSR, tests).
 */
function checkIsOffline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator)
    return !navigator.onLine;

  return false;
}

/**
 * Classify a network-level error into specific categories.
 */
function classifyNetworkError(error: ClassifiedError): NetworkErrorInfo {
  const isTimeout = error.errorCode === TIMEOUT_ERROR_CODE;
  const isOffline = error.status === NETWORK_ERROR_STATUS && checkIsOffline();
  const isNetworkError = error.status === NETWORK_ERROR_STATUS;
  const isDnsFailure = isNetworkError && !isOffline && !isTimeout;

  return { isOffline, isTimeout, isDnsFailure, isNetworkError };
}

export { classifyNetworkError, checkIsOffline, TIMEOUT_ERROR_CODE, NETWORK_ERROR_STATUS };
export type { NetworkErrorInfo };
