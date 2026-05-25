import type LogLevel from '../../shared/enums/LogLevel';

/** Shape of a single log entry sent to the remote transport. */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: string;
  correlationId?: string;
  tenantId?: string;
  userId?: string;
  sessionId?: string;
  data?: Record<string, unknown>;
  error?: LogEntryError;
  device?: LogEntryDevice;
}

/** Serialised error attached to a log entry. */
export interface LogEntryError {
  name: string;
  message: string;
  stack?: string;
}

/** Device metadata attached to a log entry. */
export interface LogEntryDevice {
  platform: string;
  version: string;
  model?: string;
}

/** Configuration for the logging service. */
export interface LoggingConfig {
  minLevel: LogLevel;
  enableRemote: boolean;
  remoteUrl: string;
  batchSize: number;
  flushIntervalMs: number;
  offlineQueueMaxSize: number;
}
