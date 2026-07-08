import { loadPostHog } from './loadPostHog';
import { sanitizeProperties } from './sanitizeProperties';
import { isValueDefined } from '../../../utils/is';

import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { AnalyticsClient, EventProperties, FeatureFlagValue } from '../types';
import type { PostHog } from 'posthog-js';

/**
 * Analytics client that sends events to PostHog via the posthog-js SDK.
 *
 * PERFORMANCE (UX Move 6 — "speed as a feature"): posthog-js (~180 kB) is now
 * loaded through the lazy `loadPostHog` seam so it lives in its own async chunk
 * rather than the shared entry bundle, keeping it off the first-paint critical
 * path. Calls made before the SDK finishes loading are queued and flushed once
 * it is ready.
 */
export class PostHogClient implements AnalyticsClient {
  /** Resolves once the SDK has loaded and `init` has run. Awaited in tests. */
  readonly ready: Promise<void>;
  private posthog: PostHog | null = null;
  private readonly queue: Array<(ph: PostHog) => void> = [];

  constructor(apiKey: string, host: string) {
    this.ready = loadPostHog()
      .then((posthog) => {
        posthog.init(apiKey, {
          api_host: host,
          capture_pageview: false,
          capture_pageleave: true,
          persistence: 'localStorage',
        });
        this.posthog = posthog;
        while (this.queue.length > 0) {
          const fn = this.queue.shift();
          if (isValueDefined(fn)) fn(posthog);
        }
      })
      .catch(() => undefined);
  }

  private run(fn: (ph: PostHog) => void): void {
    if (isValueDefined(this.posthog)) fn(this.posthog);
    else this.queue.push(fn);
  }

  track(event: AnalyticsEventName, properties?: EventProperties): void {
    this.run((ph) => ph.capture(event, sanitizeProperties(properties)));
  }

  identify(distinctId: string, traits?: EventProperties): void {
    this.run((ph) => ph.identify(distinctId, sanitizeProperties(traits)));
  }

  page(path: string, _properties?: EventProperties): void {
    this.run((ph) => ph.capture('$pageview', { $current_url: path }));
  }

  reset(): void {
    this.run((ph) => ph.reset());
  }

  getFeatureFlag(key: string): FeatureFlagValue {
    // Flags need a synchronous answer; before the SDK loads none are known.
    if (!isValueDefined(this.posthog)) return undefined;
    return this.posthog.getFeatureFlag(key) ?? undefined;
  }
}
