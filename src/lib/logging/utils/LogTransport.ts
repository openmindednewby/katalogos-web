import { type OfflineQueue } from './OfflineQueue';

import type { LogEntry } from '../types';

const CONTENT_TYPE_JSON = 'application/json';

interface TransportConfig {
  remoteUrl: string;
  offlineQueue: OfflineQueue;
}

/**
 * HTTP transport that sends batches of log entries to the remote
 * ingestion endpoint. Failed deliveries are persisted to the
 * offline queue for later replay.
 */
export class LogTransport {
  private readonly remoteUrl: string;
  private readonly offlineQueue: OfflineQueue;

  constructor(config: TransportConfig) {
    this.remoteUrl = config.remoteUrl;
    this.offlineQueue = config.offlineQueue;
  }

  /** Sends a batch of log entries to the remote endpoint. */
  async send(entries: LogEntry[]): Promise<void> {
    try {
      const response = await fetch(this.remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': CONTENT_TYPE_JSON },
        body: JSON.stringify({ logs: entries }),
      });

      if (!response.ok) 
        throw new Error(`Log transport failed: ${String(response.status)}`);
      

      await this.replayOfflineQueue();
    } catch {
      await this.offlineQueue.enqueue(entries);
    }
  }

  /** Attempts to send any previously queued offline entries. */
  async replayOfflineQueue(): Promise<void> {
    const offlineLogs = await this.offlineQueue.dequeueAll();
    if (offlineLogs.length === 0) return;

    try {
      const response = await fetch(this.remoteUrl, {
        method: 'POST',
        headers: { 'Content-Type': CONTENT_TYPE_JSON },
        body: JSON.stringify({ logs: offlineLogs }),
      });

      if (!response.ok) 
        await this.offlineQueue.enqueue(offlineLogs);
      
    } catch {
      await this.offlineQueue.enqueue(offlineLogs);
    }
  }
}
