import { ANALYTICS_LOG_CONTEXT } from '../constants';
import { sanitizeProperties } from './sanitizeProperties';

import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { LoggingService } from '../../logging';
import type { AnalyticsClient, EventProperties } from '../types';

/** Client that sends events to the Umami tracking API. */
export class UmamiClient implements AnalyticsClient {
  private readonly apiUrl: string;

  constructor(
    umamiUrl: string,
    private readonly websiteId: string,
    private readonly logger: LoggingService,
  ) {
    this.apiUrl = `${umamiUrl}/api/send`;
  }

  track(event: AnalyticsEventName, properties?: EventProperties): void {
    this.send('event', { name: event, data: sanitizeProperties(properties) });
  }

  identify(_distinctId: string, _traits?: EventProperties): void {
    // Umami does not support user identification — no-op
  }

  page(path: string, properties?: EventProperties): void {
    this.send('event', { url: path, data: sanitizeProperties(properties) });
  }

  reset(): void {
    // Umami is stateless on the client side — no-op
  }

  private send(type: string, payload: Record<string, unknown>): void {
    const body = JSON.stringify({
      type,
      payload: { website: this.websiteId, ...payload },
    });

    fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch((error: unknown) => {
      this.logger.warn(ANALYTICS_LOG_CONTEXT, 'Umami send failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }
}
