/**
 * Unit tests for featureLimits utility.
 * Tests tier-to-limits mapping and required tier lookup.
 */
import FeatureCode from './FeatureCode';
import { getFeatureLimits, getRequiredTier } from './featureLimits';
import SubscriptionTier from './SubscriptionTier';

describe('getFeatureLimits', () => {
  it('returns Free tier limits', () => {
    const limits = getFeatureLimits(SubscriptionTier.Free);

    expect(limits.maxMenus).toBe(1);
    expect(limits.maxItemsPerMenu).toBe(10);
    expect(limits.hasCustomDomain).toBe(false);
    expect(limits.hasPremiumThemes).toBe(false);
    expect(limits.hasAnalytics).toBe(false);
    expect(limits.showWatermark).toBe(true);
  });

  it('returns Pro tier limits', () => {
    const limits = getFeatureLimits(SubscriptionTier.Pro);

    expect(limits.maxMenus).toBeGreaterThan(1);
    expect(limits.maxItemsPerMenu).toBeGreaterThan(10);
    expect(limits.hasCustomDomain).toBe(true);
    expect(limits.hasPremiumThemes).toBe(true);
    expect(limits.hasAnalytics).toBe(true);
    expect(limits.showWatermark).toBe(false);
  });

  it('returns Enterprise tier limits', () => {
    const limits = getFeatureLimits(SubscriptionTier.Enterprise);

    expect(limits.hasApiAccess).toBe(true);
    expect(limits.hasWhiteLabel).toBe(true);
    expect(limits.hasMultiLocation).toBe(true);
    expect(limits.hasPrioritySupport).toBe(true);
    expect(limits.showWatermark).toBe(false);
  });

  it('defaults unknown tier to Free limits', () => {
    const limits = getFeatureLimits('UnknownTier');

    expect(limits.maxMenus).toBe(1);
    expect(limits.showWatermark).toBe(true);
  });
});

describe('getRequiredTier', () => {
  it('requires Pro for premium themes', () => {
    expect(getRequiredTier(FeatureCode.PremiumThemes)).toBe(SubscriptionTier.Pro);
  });

  it('requires Pro for custom domain', () => {
    expect(getRequiredTier(FeatureCode.CustomDomain)).toBe(SubscriptionTier.Pro);
  });

  it('requires Pro for analytics', () => {
    expect(getRequiredTier(FeatureCode.Analytics)).toBe(SubscriptionTier.Pro);
  });

  it('requires Enterprise for API access', () => {
    expect(getRequiredTier(FeatureCode.ApiAccess)).toBe(SubscriptionTier.Enterprise);
  });

  it('requires Enterprise for white label', () => {
    expect(getRequiredTier(FeatureCode.WhiteLabel)).toBe(SubscriptionTier.Enterprise);
  });

  it('requires Enterprise for multi-location', () => {
    expect(getRequiredTier(FeatureCode.MultiLocation)).toBe(SubscriptionTier.Enterprise);
  });

  it('requires Pro for AI nutrition', () => {
    expect(getRequiredTier(FeatureCode.AiNutrition)).toBe(SubscriptionTier.Pro);
  });
});
