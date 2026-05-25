/**
 * Maps subscription tiers to feature limits.
 *
 * These limits define what each tier can do. They serve as a client-side
 * fallback; the server is the source of truth via the feature access API.
 */
import FeatureCode from './FeatureCode';
import SubscriptionTier from './SubscriptionTier';

/** Feature limit definition for a single tier. */
interface TierLimits {
  maxMenus: number;
  maxItemsPerMenu: number;
  hasCustomDomain: boolean;
  hasPremiumThemes: boolean;
  hasAnalytics: boolean;
  hasApiAccess: boolean;
  hasWhiteLabel: boolean;
  hasMultiLocation: boolean;
  hasPrioritySupport: boolean;
  showWatermark: boolean;
}

const FREE_MAX_MENUS = 1;
const FREE_MAX_ITEMS = 10;
const UNLIMITED = 999999;

const FREE_LIMITS: TierLimits = {
  maxMenus: FREE_MAX_MENUS,
  maxItemsPerMenu: FREE_MAX_ITEMS,
  hasCustomDomain: false,
  hasPremiumThemes: false,
  hasAnalytics: false,
  hasApiAccess: false,
  hasWhiteLabel: false,
  hasMultiLocation: false,
  hasPrioritySupport: false,
  showWatermark: true,
};

const PRO_LIMITS: TierLimits = {
  maxMenus: UNLIMITED,
  maxItemsPerMenu: UNLIMITED,
  hasCustomDomain: true,
  hasPremiumThemes: true,
  hasAnalytics: true,
  hasApiAccess: false,
  hasWhiteLabel: false,
  hasMultiLocation: false,
  hasPrioritySupport: false,
  showWatermark: false,
};

const ENTERPRISE_LIMITS: TierLimits = {
  maxMenus: UNLIMITED,
  maxItemsPerMenu: UNLIMITED,
  hasCustomDomain: true,
  hasPremiumThemes: true,
  hasAnalytics: true,
  hasApiAccess: true,
  hasWhiteLabel: true,
  hasMultiLocation: true,
  hasPrioritySupport: true,
  showWatermark: false,
};

const TIER_LIMITS_MAP: Record<string, TierLimits> = {
  [SubscriptionTier.Free]: FREE_LIMITS,
  [SubscriptionTier.Pro]: PRO_LIMITS,
  [SubscriptionTier.Enterprise]: ENTERPRISE_LIMITS,
};

/** Get feature limits for a given subscription tier. */
export function getFeatureLimits(tier: string): TierLimits {
  return TIER_LIMITS_MAP[tier] ?? FREE_LIMITS;
}

/** Get the minimum tier required for a specific feature. */
export function getRequiredTier(featureCode: FeatureCode): SubscriptionTier {
  const requirementMap: Record<string, SubscriptionTier> = {
    [FeatureCode.MenuCount]: SubscriptionTier.Pro,
    [FeatureCode.ItemsPerMenu]: SubscriptionTier.Pro,
    [FeatureCode.CustomDomain]: SubscriptionTier.Pro,
    [FeatureCode.PremiumThemes]: SubscriptionTier.Pro,
    [FeatureCode.Analytics]: SubscriptionTier.Pro,
    [FeatureCode.ApiAccess]: SubscriptionTier.Enterprise,
    [FeatureCode.WhiteLabel]: SubscriptionTier.Enterprise,
    [FeatureCode.MultiLocation]: SubscriptionTier.Enterprise,
    [FeatureCode.PrioritySupport]: SubscriptionTier.Enterprise,
    [FeatureCode.AiNutrition]: SubscriptionTier.Pro,
  };

  return requirementMap[featureCode] ?? SubscriptionTier.Pro;
}

export type { TierLimits };
