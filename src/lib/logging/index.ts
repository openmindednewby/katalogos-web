/** Re-export shim. The implementation now lives in the shared */
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
