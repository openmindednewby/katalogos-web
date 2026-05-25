import { LoggingService } from './utils/LoggingService';

export { LoggingService, sanitizeData } from './utils/LoggingService';
export { LogTransport } from './utils/LogTransport';
export { OfflineQueue } from './utils/OfflineQueue';
export type { LogEntry, LogEntryDevice, LogEntryError, LoggingConfig } from './types';
export type { QueueStorage } from './utils/OfflineQueue';
export { enrichWithDevice } from './enrichers/DeviceEnricher';
export { generateSessionId } from './enrichers/SessionEnricher';

/** Default singleton instance for application-wide use. */
export const loggingService = new LoggingService();
