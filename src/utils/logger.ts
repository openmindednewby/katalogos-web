/**
 * @deprecated Use `loggingService` from `@/lib/logging` instead.
 * This module is kept for backward compatibility and delegates
 * all calls to the new LoggingService.
 *
 * Migration:
 *   import { loggingService } from '@/lib/logging';
 *   loggingService.error('Auth', 'Failed to refresh token', error);
 */

import { isValueDefined } from '@dloizides/utils';

import { loggingService } from '../lib/logging';

function toRecord(data: unknown): Record<string, unknown> | undefined {
  if (!isValueDefined(data)) return undefined;
  if (typeof data === 'object' && !Array.isArray(data)) {
    const record: Record<string, unknown> = {};
    Object.assign(record, data);
    return record;
  }

  return { value: data };
}

interface Logger {
  debug: (context: string, message: string, data?: unknown) => void;
  info: (context: string, message: string, data?: unknown) => void;
  warn: (context: string, message: string, data?: unknown) => void;
  error: (context: string, message: string, error?: unknown) => void;
}

/** @deprecated Use `loggingService` from `@/lib/logging` instead. */
export const logger: Logger = {
  debug(context: string, message: string, data?: unknown) {
    loggingService.debug(context, message, toRecord(data));
  },

  info(context: string, message: string, data?: unknown) {
    loggingService.info(context, message, toRecord(data));
  },

  warn(context: string, message: string, data?: unknown) {
    loggingService.warn(context, message, toRecord(data));
  },

  error(context: string, message: string, error?: unknown) {
    loggingService.error(context, message, error instanceof Error ? error : undefined);
  },
};
