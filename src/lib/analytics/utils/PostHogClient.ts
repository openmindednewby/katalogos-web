import posthog from 'posthog-js';

import { sanitizeProperties } from './sanitizeProperties';

import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { AnalyticsClient, EventProperties, FeatureFlagValue } from '../types';

/** Client that sends events to PostHog via the posthog-js SDK. */
export class PostHogClient implements AnalyticsClient {
  constructor(apiKey: string, host: string) {
    posthog.init(apiKey, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage',
    });
  }

  track(event: AnalyticsEventName, properties?: EventProperties): void {
    posthog.capture(event, sanitizeProperties(properties));
  }

  identify(distinctId: string, traits?: EventProperties): void {
    posthog.identify(distinctId, sanitizeProperties(traits));
  }

  page(path: string, _properties?: EventProperties): void {
    posthog.capture('$pageview', { $current_url: path });
  }

  reset(): void {
    posthog.reset();
  }

  getFeatureFlag(key: string): FeatureFlagValue {
    return posthog.getFeatureFlag(key) ?? undefined;
  }
}
