import type AnalyticsEventName from '../../shared/enums/AnalyticsEventName';

/** Properties attached to analytics events. */
export type EventProperties = Record<string, string | number | boolean>;

/** Callback signature for tracking analytics events. Used to pass `track` into non-hook code. */
export type AnalyticsTrackFn = (event: AnalyticsEventName, properties?: EventProperties) => void;

/** Return type for feature flag lookups: boolean for on/off, string for multivariate, undefined if unknown. */
export type FeatureFlagValue = boolean | string | undefined;

/** Minimal interface that every analytics provider must implement. */
export interface AnalyticsClient {
  /** Track a named event with optional properties. */
  track: (event: AnalyticsEventName, properties?: EventProperties) => void;
  /** Identify the current user by a unique ID (no PII). */
  identify: (distinctId: string, traits?: EventProperties) => void;
  /** Track a page view. */
  page: (path: string, properties?: EventProperties) => void;
  /** Reset all provider state (call on logout). */
  reset: () => void;
  /** Evaluate a feature flag by key. Optional -- not all providers support feature flags. */
  getFeatureFlag?: (key: string) => FeatureFlagValue;
}

/** Configuration for analytics providers. */
export interface AnalyticsConfig {
  umamiUrl: string;
  umamiWebsiteId: string;
  postHogKey: string;
  postHogHost: string;
  postHogEnabled: boolean;
}
