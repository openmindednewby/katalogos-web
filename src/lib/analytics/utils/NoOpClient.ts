import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { AnalyticsClient, EventProperties } from '../types';

/** Silent no-op client used when consent is denied or no providers are configured. */
export class NoOpClient implements AnalyticsClient {
  track(_event: AnalyticsEventName, _properties?: EventProperties): void {
    // intentionally empty
  }

  identify(_distinctId: string, _traits?: EventProperties): void {
    // intentionally empty
  }

  page(_path: string, _properties?: EventProperties): void {
    // intentionally empty
  }

  reset(): void {
    // intentionally empty
  }
}
