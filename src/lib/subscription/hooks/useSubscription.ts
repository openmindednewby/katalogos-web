/**
 * Central subscription hook for the app.
 *
 * Provides tier information, trial status, feature limits, and watermark
 * visibility. Components use this to gate features based on subscription tier.
 */
import { useMemo } from 'react';

import { isValueDefined } from '../../../utils/is';
import { useGetCurrentSubscription } from '../../hooks/billing';
import SubscriptionStatus from '../../hooks/billing/enums/SubscriptionStatus';
import { getFeatureLimits } from '../utils/featureLimits';
import SubscriptionTier from '../utils/SubscriptionTier';

import type { Subscription } from '../../hooks/billing';
import type { TierLimits } from '../utils/featureLimits';

interface UseSubscriptionResult {
  subscription: Subscription | undefined;
  tier: string;
  isFreeTier: boolean;
  isProTier: boolean;
  isEnterpriseTier: boolean;
  isTrialActive: boolean;
  showWatermark: boolean;
  limits: TierLimits;
  isLoading: boolean;
  isError: boolean;
}

/** Whether a string tier value matches a given SubscriptionTier. */
function isTier(tier: string, target: string): boolean {
  return tier === target;
}

export function useSubscription(): UseSubscriptionResult {
  const { subscription, isLoading, isError } = useGetCurrentSubscription();

  // When subscription data is available, use it. When the API errors (service
  // unavailable, 401, etc.), default to Pro so users aren't locked out of
  // features. Only default to Free when still loading (not yet resolved).
  const fallbackTier = isError ? SubscriptionTier.Pro : SubscriptionTier.Free;
  const tier = isValueDefined(subscription)
    ? subscription.planTier
    : fallbackTier;

  const isTrialActive = isValueDefined(subscription)
    && subscription.status === SubscriptionStatus.Trial;

  const showWatermark = subscription?.showWatermark ?? true;

  const limits = useMemo(() => getFeatureLimits(tier), [tier]);

  return {
    subscription,
    tier,
    isFreeTier: isTier(tier, SubscriptionTier.Free),
    isProTier: isTier(tier, SubscriptionTier.Pro),
    isEnterpriseTier: isTier(tier, SubscriptionTier.Enterprise),
    isTrialActive,
    showWatermark,
    limits,
    isLoading,
    isError,
  };
}
