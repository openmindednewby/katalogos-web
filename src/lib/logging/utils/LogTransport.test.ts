import { LogTransport } from './LogTransport';
import { OfflineQueue, type QueueStorage } from './OfflineQueue';
import LogLevel from '../../../shared/enums/LogLevel';

import type { LogEntry } from '../types';

function createMockStorage(): QueueStorage & {
  store: Map<string, string>;
} {
  const store = new Map<string, string>();

  return {
    store,
    getItem: jest.fn(async (key: string): Promise<string | null> =>
      store.get(key) ?? null,
    ),
    setItem: jest.fn(async (key: string, value: string): Promise<void> => {
      store.set(key, value);
    }),
    removeItem: jest.fn(async (key: string): Promise<void> => {
      store.delete(key);
    }),
  };
}

function createEntry(message: string): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level: LogLevel.Info,
    message,
    context: 'test',
    sessionId: 'session-1',
  };
}

describe('LogTransport', () => {
  const remoteUrl = '/api/logs';

  describe('send', () => {
    it('sends POST with correct Content-Type and body', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const storage = createMockStorage();
      const offlineQueue = new OfflineQueue(100, storage);
      const transport = new LogTransport({ remoteUrl, offlineQueue });

      const entries = [createEntry('msg1'), createEntry('msg2')];
      await transport.send(entries);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: entries }),
      });
    });

    it('queues entries to offline storage on network error', async () => {
      const mockFetch = jest
        .fn()
        .mockRejectedValue(new Error('Network failure'));
      global.fetch = mockFetch;

      const storage = createMockStorage();
      const offlineQueue = new OfflineQueue(100, storage);
      const transport = new LogTransport({ remoteUrl, offlineQueue });

      const entries = [createEntry('msg1')];
      await transport.send(entries);

      const queued = await offlineQueue.dequeueAll();
      expect(queued).toHaveLength(1);
      expect(queued[0].message).toBe('msg1');
    });

    it('queues entries to offline storage on non-OK response', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValue({ ok: false, status: 500 });
      global.fetch = mockFetch;

      const storage = createMockStorage();
      const offlineQueue = new OfflineQueue(100, storage);
      const transport = new LogTransport({ remoteUrl, offlineQueue });

      const entries = [createEntry('msg1')];
      await transport.send(entries);

      const queued = await offlineQueue.dequeueAll();
      expect(queued).toHaveLength(1);
    });
  });

  describe('replayOfflineQueue', () => {
    it('sends previously queued entries on successful connection', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const storage = createMockStorage();
      const offlineQueue = new OfflineQueue(100, storage);
      const transport = new LogTransport({ remoteUrl, offlineQueue });

      // Pre-populate offline queue
      await offlineQueue.enqueue([createEntry('offline1')]);

      await transport.replayOfflineQueue();

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Queue should now be empty
      const remaining = await offlineQueue.dequeueAll();
      expect(remaining).toHaveLength(0);
    });

    it('re-queues entries if replay fails', async () => {
      const mockFetch = jest
        .fn()
        .mockRejectedValue(new Error('Still offline'));
      global.fetch = mockFetch;

      const storage = createMockStorage();
      const offlineQueue = new OfflineQueue(100, storage);
      const transport = new LogTransport({ remoteUrl, offlineQueue });

      await offlineQueue.enqueue([createEntry('offline1')]);

      await transport.replayOfflineQueue();

      const queued = await offlineQueue.dequeueAll();
      expect(queued).toHaveLength(1);
      expect(queued[0].message).toBe('offline1');
    });

    it('does nothing when offline queue is empty', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      const storage = createMockStorage();
      const offlineQueue = new OfflineQueue(100, storage);
      const transport = new LogTransport({ remoteUrl, offlineQueue });

      await transport.replayOfflineQueue();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
