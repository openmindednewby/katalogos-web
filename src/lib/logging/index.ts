/**
 * Re-export shim. The implementation now lives in the shared
 * `@dloizides/logging-web` package (extracted from the byte-identical
 * `lib/logging` modules in katalogos-web + erevna-web).
 */
export {
  LoggingService,
  sanitizeData,
  LogTransport,
  OfflineQueue,
  enrichWithDevice,
  generateSessionId,
  loggingService,
} from '@dloizides/logging-web';

export type {
  LogEntry,
  LogEntryDevice,
  LogEntryError,
  LoggingConfig,
  QueueStorage,
} from '@dloizides/logging-web';
