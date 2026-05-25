import { useContext } from 'react';

import { AnalyticsContext } from '../components/AnalyticsProvider';

import type { FeatureFlagValue } from '../types';

/** Returns `true` when the boolean feature flag identified by `key` is enabled, `false` otherwise. */
export function useFeatureFlag(key: string): boolean {
  const client = useContext(AnalyticsContext);
  if (!client.getFeatureFlag) return false;
  return client.getFeatureFlag(key) === true;
}

/** Returns the raw feature flag value (boolean, string variant, or undefined). */
export function useFeatureFlagValue(key: string): FeatureFlagValue {
  const client = useContext(AnalyticsContext);
  if (!client.getFeatureFlag) return undefined;
  return client.getFeatureFlag(key);
}
