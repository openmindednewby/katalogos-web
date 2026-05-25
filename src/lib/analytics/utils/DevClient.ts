import { ANALYTICS_LOG_CONTEXT } from '../constants';

import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { LoggingService } from '../../logging';
import type { AnalyticsClient, EventProperties } from '../types';

/** Dev-only client that logs analytics events to the console and LoggingService. */
export class DevClient implements AnalyticsClient {
  constructor(private readonly logger: LoggingService) {}

  track(event: AnalyticsEventName, properties?: EventProperties): void {
    this.logger.info(ANALYTICS_LOG_CONTEXT, `track: ${event}`, properties);
  }

  identify(distinctId: string, traits?: EventProperties): void {
    this.logger.info(ANALYTICS_LOG_CONTEXT, `identify: ${distinctId}`, traits);
  }

  page(path: string, properties?: EventProperties): void {
    this.logger.info(ANALYTICS_LOG_CONTEXT, `page: ${path}`, properties);
  }

  reset(): void {
    this.logger.info(ANALYTICS_LOG_CONTEXT, 'reset');
  }
}
