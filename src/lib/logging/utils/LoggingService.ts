import { isValueDefined } from '@dloizides/utils';

import { LogTransport } from './LogTransport';
import { OfflineQueue } from './OfflineQueue';
import LogLevel from '../../../shared/enums/LogLevel';
import { enrichWithDevice } from '../enrichers/DeviceEnricher';
import { generateSessionId } from '../enrichers/SessionEnricher';

import type { LogEntry, LoggingConfig } from '../types';

/** Numeric weight for each log level used for minimum-level filtering. */
const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  [LogLevel.Debug]: 0,
  [LogLevel.Info]: 1,
  [LogLevel.Warn]: 2,
  [LogLevel.Error]: 3,
  [LogLevel.Fatal]: 4,
};

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_OFFLINE_QUEUE_MAX_SIZE = 100;
const DEFAULT_REMOTE_URL = '/api/logs';

/** Keys whose values must be redacted before logging. */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apikey', 'creditcard'];
const REDACTED_VALUE = '***REDACTED***';

const DEFAULT_CONFIG: LoggingConfig = {
  minLevel: LogLevel.Info,
  enableRemote: true,
  remoteUrl: DEFAULT_REMOTE_URL,
  batchSize: DEFAULT_BATCH_SIZE,
  flushIntervalMs: DEFAULT_FLUSH_INTERVAL_MS,
  offlineQueueMaxSize: DEFAULT_OFFLINE_QUEUE_MAX_SIZE,
};

interface LogParams {
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
}

/**
 * Central logging service that batches log entries, sanitises sensitive data,
 * logs to console in development, and queues entries for remote transport.
 */
export class LoggingService {
  private readonly config: LoggingConfig;
  private queue: LogEntry[] = [];
  private readonly transport: LogTransport;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly sessionId: string;
  private correlationId: string | null = null;
  private userId: string | null = null;
  private tenantId: string | null = null;

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = generateSessionId();

    const offlineQueue = new OfflineQueue(this.config.offlineQueueMaxSize);
    this.transport = new LogTransport({
      remoteUrl: this.config.remoteUrl,
      offlineQueue,
    });

    this.startFlushTimer();
  }

  /** Sets a correlation ID that will be attached to all subsequent log entries. */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /** Clears the current correlation ID. */
  clearCorrelationId(): void {
    this.correlationId = null;
  }

  /** Sets a user ID that will be attached to all subsequent log entries. */
  setUserId(id: string): void {
    this.userId = id;
  }

  /** Sets a tenant ID that will be attached to all subsequent log entries. */
  setTenantId(id: string): void {
    this.tenantId = id;
  }

  debug(context: string, message: string, data?: Record<string, unknown>): void {
    this.log({ level: LogLevel.Debug, context, message, data });
  }

  info(context: string, message: string, data?: Record<string, unknown>): void {
    this.log({ level: LogLevel.Info, context, message, data });
  }

  warn(context: string, message: string, data?: Record<string, unknown>): void {
    this.log({ level: LogLevel.Warn, context, message, data });
  }

  error(context: string, message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log({ level: LogLevel.Error, context, message, data, error });
  }

  fatal(context: string, message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log({ level: LogLevel.Fatal, context, message, data, error });
    this.flush().catch(() => undefined);
  }

  /** Flushes the current batch of queued entries to the remote transport. */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const entries = [...this.queue];
    this.queue = [];

    if (this.config.enableRemote)
      await this.transport.send(entries);
  }

  /** Stops the flush timer and flushes remaining entries. */
  destroy(): void {
    if (isValueDefined(this.flushTimer)) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush().catch(() => undefined);
  }

  /** Returns the current queue length (useful for testing). */
  getQueueLength(): number {
    return this.queue.length;
  }

  /** Returns the session ID (useful for testing). */
  getSessionId(): string {
    return this.sessionId;
  }

  private log(params: LogParams): void {
    if (!this.shouldLog(params.level)) return;

    const entry = this.buildEntry(params);

    this.logToConsoleIfDev(entry);
    this.enqueueEntry(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[this.config.minLevel];
  }

  private buildEntry(params: LogParams): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: params.level,
      message: params.message,
      context: params.context,
      correlationId: this.correlationId ?? undefined,
      userId: this.userId ?? undefined,
      tenantId: this.tenantId ?? undefined,
      sessionId: this.sessionId,
      data: sanitizeData(params.data),
      error: params.error
        ? { name: params.error.name, message: params.error.message, stack: params.error.stack }
        : undefined,
      device: enrichWithDevice(),
    };
  }

  private logToConsoleIfDev(entry: LogEntry): void {
    const isDev = typeof __DEV__ === 'boolean' ? __DEV__ : false;
    if (!isDev) return;

    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]`;
    const formatted = `${prefix} ${entry.message}`;

    logToConsoleByLevel(entry.level, formatted, entry);
  }

  private enqueueEntry(entry: LogEntry): void {
    if (!this.config.enableRemote) return;

    this.queue.push(entry);

    if (this.queue.length >= this.config.batchSize)
      this.flush().catch(() => undefined);
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(() => undefined);
    }, this.config.flushIntervalMs);
  }
}

/** Redacts values whose keys match known sensitive patterns. */
export function sanitizeData(
  data?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!data) return undefined;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const isKeyMatch = SENSITIVE_KEYS.some((k) =>
      key.toLowerCase().includes(k),
    );
    sanitized[key] = isKeyMatch ? REDACTED_VALUE : value;
  }

  return sanitized;
}

function logToConsoleByLevel(level: LogLevel, formatted: string, entry: LogEntry): void {
  switch (level) {
    case LogLevel.Debug:
    case LogLevel.Info:
      // eslint-disable-next-line no-console
      console.log(formatted, entry.data ?? '');
      break;
    case LogLevel.Warn:
      console.warn(formatted, entry.data ?? '');
      break;
    case LogLevel.Error:
    case LogLevel.Fatal:
      console.error(formatted, entry.error ?? entry.data ?? '');
      break;
    default:
      console.warn(formatted, entry.data ?? '');
      break;
  }
}
