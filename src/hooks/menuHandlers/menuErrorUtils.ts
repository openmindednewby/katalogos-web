/**
 * Error handling utilities for menu operations.
 */
import { isValueDefined } from '../../utils/is';

const HTTP_CONFLICT = 409;

interface ErrorWithMessage {
  message?: unknown;
}

interface AxiosLikeError {
  response?: { status?: number };
}

function isErrorWithMessage(value: unknown): value is ErrorWithMessage {
  return typeof value === 'object' && isValueDefined(value) && 'message' in value;
}

function isAxiosLikeError(value: unknown): value is AxiosLikeError {
  return typeof value === 'object' && isValueDefined(value) && 'response' in value;
}

/** Returns the HTTP status code from an Axios-like error, or undefined. */
export function getHttpStatus(value: unknown): number | undefined {
  if (!isAxiosLikeError(value)) return undefined;
  const status = value.response?.status;
  return typeof status === 'number' ? status : undefined;
}

/** Returns true when the error represents an HTTP 409 Conflict. */
export function isDuplicateNameError(value: unknown): boolean {
  return getHttpStatus(value) === HTTP_CONFLICT;
}

export function getErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  if (isErrorWithMessage(value)) {
    const message = value.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return 'Error loading menus';
}
