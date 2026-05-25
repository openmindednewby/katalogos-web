import { isValueDefined } from '@dloizides/utils';

import type { LogEntry } from '../types';

const STORAGE_KEY = '@logging/offline_queue';
const DEFAULT_MAX_SIZE = 100;

/**
 * Storage abstraction so the queue works in both React Native (AsyncStorage)
 * and test environments (in-memory fallback).
 */
export interface QueueStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Persists failed log entries to storage so they can be replayed
 * when the network is restored. Respects a configurable max size
 * and drops the oldest entries when the limit is exceeded.
 */
export class OfflineQueue {
  private readonly maxSize: number;
  private readonly storage: QueueStorage;

  constructor(maxSize: number = DEFAULT_MAX_SIZE, storage?: QueueStorage) {
    this.maxSize = maxSize;
    this.storage = storage ?? createInMemoryStorage();
  }

  /** Appends entries to the persisted queue, dropping oldest if over capacity. */
  async enqueue(entries: LogEntry[]): Promise<void> {
    try {
      const existing = await this.readQueue();
      const combined = [...existing, ...entries];
      const trimmed =
        combined.length > this.maxSize
          ? combined.slice(combined.length - this.maxSize)
          : combined;

      await this.storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Storage failure is non-fatal; silently drop to avoid cascading errors.
    }
  }

  /** Returns all queued entries and clears the persisted queue. */
  async dequeueAll(): Promise<LogEntry[]> {
    try {
      const entries = await this.readQueue();
      await this.storage.removeItem(STORAGE_KEY);
      return entries;
    } catch {
      return [];
    }
  }

  /** Returns the number of currently queued entries. */
  async size(): Promise<number> {
    const entries = await this.readQueue();
    return entries.length;
  }

  private async readQueue(): Promise<LogEntry[]> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (!isValueDefined(raw) || raw === '') return [];

    try {
      return parseLogEntries(raw);
    } catch {
      return [];
    }
  }
}

/** Parses a JSON string into an array of LogEntry. Returns empty if invalid. */
function parseLogEntries(raw: string): LogEntry[] {
  const parsed: unknown = JSON.parse(raw);
  // Data was serialised by our own enqueue(); trust the shape if array
  if (!Array.isArray(parsed)) return [];

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- narrowed via Array.isArray
  return parsed as LogEntry[];
}

/** Creates a simple in-memory storage fallback. */
function createInMemoryStorage(): QueueStorage {
  const store = new Map<string, string>();

  return {
    getItem: async (key: string): Promise<string | null> =>
      Promise.resolve(store.get(key) ?? null),
    setItem: async (key: string, value: string): Promise<void> => {
      store.set(key, value);
      return Promise.resolve();
    },
    removeItem: async (key: string): Promise<void> => {
      store.delete(key);
      return Promise.resolve();
    },
  };
}
