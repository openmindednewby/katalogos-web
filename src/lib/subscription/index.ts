/**
 * Subscription module barrel export.
 *
 * Provides hooks, enums, and utilities for subscription-based feature gating.
 */
export { useSubscription } from './hooks/useSubscription';
export { getFeatureLimits, getRequiredTier } from './utils/featureLimits';
export { default as SubscriptionTier } from './utils/SubscriptionTier';
export { default as FeatureCode } from './utils/FeatureCode';

export type { TierLimits } from './utils/featureLimits';
