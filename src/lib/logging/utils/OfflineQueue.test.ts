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

describe('OfflineQueue', () => {
  describe('enqueue', () => {
    it('persists entries to storage', async () => {
      const storage = createMockStorage();
      const queue = new OfflineQueue(100, storage);

      await queue.enqueue([createEntry('msg1'), createEntry('msg2')]);

      expect(storage.setItem).toHaveBeenCalledTimes(1);

      const stored = JSON.parse(
        storage.store.get('@logging/offline_queue') ?? '[]',
      ) as LogEntry[];

      expect(stored).toHaveLength(2);
      expect(stored[0].message).toBe('msg1');
      expect(stored[1].message).toBe('msg2');
    });

    it('appends to existing entries', async () => {
      const storage = createMockStorage();
      const queue = new OfflineQueue(100, storage);

      await queue.enqueue([createEntry('first')]);
      await queue.enqueue([createEntry('second')]);

      const stored = JSON.parse(
        storage.store.get('@logging/offline_queue') ?? '[]',
      ) as LogEntry[];

      expect(stored).toHaveLength(2);
      expect(stored[0].message).toBe('first');
      expect(stored[1].message).toBe('second');
    });
  });

  describe('dequeueAll', () => {
    it('returns and clears all entries', async () => {
      const storage = createMockStorage();
      const queue = new OfflineQueue(100, storage);

      await queue.enqueue([createEntry('msg1'), createEntry('msg2')]);

      const entries = await queue.dequeueAll();

      expect(entries).toHaveLength(2);
      expect(entries[0].message).toBe('msg1');
      expect(storage.removeItem).toHaveBeenCalled();

      // Verify the storage is now empty
      const remaining = await queue.dequeueAll();
      expect(remaining).toHaveLength(0);
    });

    it('returns empty array when queue is empty', async () => {
      const storage = createMockStorage();
      const queue = new OfflineQueue(100, storage);

      const entries = await queue.dequeueAll();

      expect(entries).toHaveLength(0);
    });
  });

  describe('maxSize limit', () => {
    it('drops oldest entries when exceeding maxSize', async () => {
      const maxSize = 3;
      const storage = createMockStorage();
      const queue = new OfflineQueue(maxSize, storage);

      await queue.enqueue([
        createEntry('msg1'),
        createEntry('msg2'),
        createEntry('msg3'),
      ]);

      await queue.enqueue([createEntry('msg4'), createEntry('msg5')]);

      const entries = await queue.dequeueAll();

      expect(entries).toHaveLength(maxSize);
      expect(entries[0].message).toBe('msg3');
      expect(entries[1].message).toBe('msg4');
      expect(entries[2].message).toBe('msg5');
    });
  });

  describe('storage error handling', () => {
    it('handles getItem errors gracefully in enqueue', async () => {
      const storage = createMockStorage();
      (storage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('read failed'),
      );

      const queue = new OfflineQueue(100, storage);

      // Should not throw
      await expect(
        queue.enqueue([createEntry('msg')]),
      ).resolves.toBeUndefined();
    });

    it('handles getItem errors gracefully in dequeueAll', async () => {
      const storage = createMockStorage();
      (storage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('read failed'),
      );

      const queue = new OfflineQueue(100, storage);

      const entries = await queue.dequeueAll();
      expect(entries).toHaveLength(0);
    });

    it('handles corrupted JSON in storage', async () => {
      const storage = createMockStorage();
      storage.store.set('@logging/offline_queue', 'not-valid-json');

      const queue = new OfflineQueue(100, storage);

      const entries = await queue.dequeueAll();
      expect(entries).toHaveLength(0);
    });

    it('handles non-array JSON in storage', async () => {
      const storage = createMockStorage();
      storage.store.set(
        '@logging/offline_queue',
        JSON.stringify({ not: 'an array' }),
      );

      const queue = new OfflineQueue(100, storage);

      const entries = await queue.dequeueAll();
      expect(entries).toHaveLength(0);
    });
  });

  describe('size', () => {
    it('returns the current queue size', async () => {
      const storage = createMockStorage();
      const queue = new OfflineQueue(100, storage);

      expect(await queue.size()).toBe(0);

      await queue.enqueue([createEntry('msg1'), createEntry('msg2')]);

      expect(await queue.size()).toBe(2);
    });
  });
});
