import { LoggingService, sanitizeData } from './LoggingService';
import LogLevel from '../../../shared/enums/LogLevel';

jest.mock('react-native', () => ({
  Platform: { OS: 'web', Version: '1.0' },
}));

const FLUSH_INTERVAL_MS = 60000;

function createTestService(
  overrides: Record<string, unknown> = {},
): LoggingService {
  return new LoggingService({
    enableRemote: false,
    flushIntervalMs: FLUSH_INTERVAL_MS,
    ...overrides,
  });
}

describe('LoggingService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('log level filtering', () => {
    it('respects minimum level and filters out lower levels', () => {
      const service = createTestService({
        minLevel: LogLevel.Warn,
        enableRemote: true,
      });

      service.debug('ctx', 'debug msg');
      service.info('ctx', 'info msg');

      expect(service.getQueueLength()).toBe(0);

      service.destroy();
    });

    it('allows entries at or above the minimum level', () => {
      const service = createTestService({
        minLevel: LogLevel.Warn,
        enableRemote: true,
      });

      service.warn('ctx', 'warn msg');
      service.error('ctx', 'error msg');

      expect(service.getQueueLength()).toBe(2);

      service.destroy();
    });

    it('allows all levels when minLevel is debug', () => {
      const service = createTestService({
        minLevel: LogLevel.Debug,
        enableRemote: true,
      });

      service.debug('ctx', 'debug');
      service.info('ctx', 'info');
      service.warn('ctx', 'warn');
      service.error('ctx', 'error');

      expect(service.getQueueLength()).toBe(4);

      service.destroy();
    });
  });

  describe('flush', () => {
    it('sends batch to transport when remote is enabled', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        remoteUrl: '/api/logs',
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'test message');
      await service.flush();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      service.destroy();
    });

    it('does nothing when queue is empty', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      const service = createTestService({ enableRemote: true });
      await service.flush();

      expect(mockFetch).not.toHaveBeenCalled();

      service.destroy();
    });

    it('auto-flushes when batch size is reached', () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const batchSize = 3;
      const service = new LoggingService({
        enableRemote: true,
        batchSize,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'msg1');
      service.info('ctx', 'msg2');

      expect(mockFetch).not.toHaveBeenCalled();

      service.info('ctx', 'msg3');

      expect(mockFetch).toHaveBeenCalledTimes(1);

      service.destroy();
    });
  });

  describe('sanitizeData', () => {
    it('redacts sensitive keys', () => {
      const data = {
        username: 'john',
        password: 'secret123',
        authToken: 'abc',
        apiKey: 'key-123',
        creditCardNumber: '4111111111111111',
        normalField: 'visible',
      };

      const result = sanitizeData(data);

      expect(result).toEqual({
        username: 'john',
        password: '***REDACTED***',
        authToken: '***REDACTED***',
        apiKey: '***REDACTED***',
        creditCardNumber: '***REDACTED***',
        normalField: 'visible',
      });
    });

    it('returns undefined for undefined input', () => {
      expect(sanitizeData(undefined)).toBeUndefined();
    });

    it('performs case-insensitive key matching', () => {
      const data = {
        PASSWORD: 'secret',
        UserToken: 'tok',
        MySecret: 'shh',
      };

      const result = sanitizeData(data);

      expect(result).toEqual({
        PASSWORD: '***REDACTED***',
        UserToken: '***REDACTED***',
        MySecret: '***REDACTED***',
      });
    });
  });

  describe('setCorrelationId', () => {
    it('includes correlation ID in log entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const correlationId = 'req-12345';
      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.setCorrelationId(correlationId);
      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ correlationId?: string }>;
      };

      expect(body.logs[0].correlationId).toBe(correlationId);

      service.destroy();
    });

    it('excludes correlation ID when not set', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ correlationId?: string }>;
      };

      expect(body.logs[0].correlationId).toBeUndefined();

      service.destroy();
    });
  });

  describe('setUserId', () => {
    it('includes user ID in log entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.setUserId('user-42');
      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ userId?: string }>;
      };

      expect(body.logs[0].userId).toBe('user-42');

      service.destroy();
    });

    it('excludes user ID when not set', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ userId?: string }>;
      };

      expect(body.logs[0].userId).toBeUndefined();

      service.destroy();
    });
  });

  describe('setTenantId', () => {
    it('includes tenant ID in log entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.setTenantId('tenant-99');
      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ tenantId?: string }>;
      };

      expect(body.logs[0].tenantId).toBe('tenant-99');

      service.destroy();
    });

    it('excludes tenant ID when not set', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ tenantId?: string }>;
      };

      expect(body.logs[0].tenantId).toBeUndefined();

      service.destroy();
    });
  });

  describe('destroy', () => {
    it('clears the flush timer and triggers a final flush', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'pre-destroy');
      service.destroy();

      // Wait for the void flush promise
      await Promise.resolve();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('session ID', () => {
    it('generates a session ID on construction', () => {
      const service = createTestService();
      const sessionId = service.getSessionId();

      expect(sessionId).toBeTruthy();
      expect(sessionId).toMatch(/^\d+-[a-z0-9]+$/);

      service.destroy();
    });

    it('includes session ID in log entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.info('ctx', 'test');
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{ sessionId?: string }>;
      };

      expect(body.logs[0].sessionId).toBe(service.getSessionId());

      service.destroy();
    });
  });

  describe('stress test', () => {
    it('handles rapid log calls without losing entries', () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const logCount = 1000;
      const batchSize = 50;
      const service = new LoggingService({
        enableRemote: true,
        batchSize,
        flushIntervalMs: FLUSH_INTERVAL_MS,
        minLevel: LogLevel.Debug,
      });

      for (let i = 0; i < logCount; i++)
        service.debug('stress', `message ${String(i)}`);

      // Auto-flushes happen at every batchSize boundary
      const expectedAutoFlushes = Math.floor(logCount / batchSize);
      expect(mockFetch).toHaveBeenCalledTimes(expectedAutoFlushes);

      // 1000 / 50 = 20 exactly, so no remainder
      expect(service.getQueueLength()).toBe(0);

      service.destroy();
    });

    it('flushes remaining entries that do not fill a batch', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const logCount = 73;
      const batchSize = 50;
      const service = new LoggingService({
        enableRemote: true,
        batchSize,
        flushIntervalMs: FLUSH_INTERVAL_MS,
        minLevel: LogLevel.Debug,
      });

      for (let i = 0; i < logCount; i++)
        service.debug('stress', `message ${String(i)}`);

      // 73 / 50 = 1 auto-flush, 23 remaining
      const expectedAutoFlushes = 1;
      const expectedRemainder = 23;
      expect(mockFetch).toHaveBeenCalledTimes(expectedAutoFlushes);
      expect(service.getQueueLength()).toBe(expectedRemainder);

      await service.flush();
      expect(mockFetch).toHaveBeenCalledTimes(expectedAutoFlushes + 1);
      expect(service.getQueueLength()).toBe(0);

      service.destroy();
    });
  });

  describe('fatal', () => {
    it('triggers an immediate flush', () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      service.fatal('ctx', 'critical error', new Error('boom'));

      expect(mockFetch).toHaveBeenCalledTimes(1);

      service.destroy();
    });
  });

  describe('error entries', () => {
    it('serialises the error object into the entry', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const service = new LoggingService({
        enableRemote: true,
        batchSize: 100,
        flushIntervalMs: FLUSH_INTERVAL_MS,
      });

      const testError = new Error('test error');
      service.error('ctx', 'something failed', testError);
      await service.flush();

      const body = JSON.parse(mockFetch.mock.calls[0][1].body) as {
        logs: Array<{
          error?: { name: string; message: string; stack?: string };
        }>;
      };

      expect(body.logs[0].error).toEqual({
        name: 'Error',
        message: 'test error',
        stack: expect.any(String),
      });

      service.destroy();
    });
  });
});
