import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { AnalyticsClient, EventProperties } from '../types';

/** Silent no-op client used when consent is denied or no providers are configured. */
export class NoOpClient implements AnalyticsClient {
  // eslint-disable-next-line no-empty-function
  track(_event: AnalyticsEventName, _properties?: EventProperties): void {
  }

  // eslint-disable-next-line no-empty-function
  identify(_distinctId: string, _traits?: EventProperties): void {
  }

  // eslint-disable-next-line no-empty-function
  page(_path: string, _properties?: EventProperties): void {
  }

  // eslint-disable-next-line no-empty-function
  reset(): void {
  }
}
