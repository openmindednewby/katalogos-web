import { ANALYTICS_LOG_CONTEXT } from '../constants';

import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { LoggingService } from '../../logging';
import type { AnalyticsClient, EventProperties, FeatureFlagValue } from '../types';

function getProviderFeatureFlag(provider: AnalyticsClient, key: string): FeatureFlagValue {
  if (typeof provider.getFeatureFlag !== 'function') return undefined;
  return provider.getFeatureFlag(key);
}

/** Fans out analytics calls to all configured providers. One failing never blocks another. */
export class MultiProviderClient implements AnalyticsClient {
  constructor(
    private readonly providers: AnalyticsClient[],
    private readonly logger: LoggingService,
  ) {}

  track(event: AnalyticsEventName, properties?: EventProperties): void {
    for (const provider of this.providers) 
      try {
        provider.track(event, properties);
      } catch (error: unknown) {
        this.logProviderError('track', error);
      }
    
  }

  identify(distinctId: string, traits?: EventProperties): void {
    for (const provider of this.providers) 
      try {
        provider.identify(distinctId, traits);
      } catch (error: unknown) {
        this.logProviderError('identify', error);
      }
    
  }

  page(path: string, properties?: EventProperties): void {
    for (const provider of this.providers) 
      try {
        provider.page(path, properties);
      } catch (error: unknown) {
        this.logProviderError('page', error);
      }
    
  }

  reset(): void {
    for (const provider of this.providers) 
      try {
        provider.reset();
      } catch (error: unknown) {
        this.logProviderError('reset', error);
      }
    
  }

  getFeatureFlag(key: string): FeatureFlagValue {
    for (const provider of this.providers) 
      try {
        const result = getProviderFeatureFlag(provider, key);
        if (typeof result === 'boolean' || typeof result === 'string') return result;
      } catch (error: unknown) {
        this.logProviderError('getFeatureFlag', error);
      }
    
    return undefined;
  }

  private logProviderError(method: string, error: unknown): void {
    this.logger.warn(ANALYTICS_LOG_CONTEXT, `Provider error in ${method}`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
