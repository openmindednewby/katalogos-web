import { isValueDefined } from './is';

interface ErrorWithMessage {
  message?: unknown;
}

function isErrorWithMessage(value: unknown): value is ErrorWithMessage {
  return typeof value === 'object' && isValueDefined(value) && 'message' in value;
}

/**
 * Extracts a human-readable error message from various error types.
 * @param value - The error value (Error, string, or object with message property)
 * @param fallback - The fallback message if no message can be extracted
 * @returns A human-readable error message
 */
export function getErrorMessage(value: unknown, fallback = 'Unknown error'): string {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  if (isErrorWithMessage(value)) {
    const message = value.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}
