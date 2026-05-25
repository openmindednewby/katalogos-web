/**
 * Unit tests for billing DTO mappers.
 * Tests mapping from Orval-generated API DTOs to frontend types.
 */
import { mapSubscription, mapPricingPlan, mapBillingHistory, mapFeatureAccess } from './mappers';
import BillingCycle from '../enums/BillingCycle';
import SubscriptionStatus from '../enums/SubscriptionStatus';

describe('mapSubscription', () => {
  it('maps a full subscription DTO', () => {
    const dto = {
      externalId: 'sub-123',
      planExternalId: 'plan-456',
      planName: 'Pro',
      planTier: 'Pro',
      status: 'Active',
      billingCycle: 'Monthly',
      currentPeriodStart: '2026-01-01T00:00:00Z',
      currentPeriodEnd: '2026-02-01T00:00:00Z',
      trialEndDate: null,
      cancellationDate: null,
      showWatermark: false,
      features: [{ featureCode: 'menu_count', limitType: 'Unlimited', limitValue: null, isEnabled: true }],
    };

    const result = mapSubscription(dto);

    expect(result.id).toBe('sub-123');
    expect(result.planId).toBe('plan-456');
    expect(result.planName).toBe('Pro');
    expect(result.planTier).toBe('Pro');
    expect(result.status).toBe(SubscriptionStatus.Active);
    expect(result.billingCycle).toBe(BillingCycle.Monthly);
    expect(result.showWatermark).toBe(false);
    expect(result.featureLimits).toHaveLength(1);
    expect(result.featureLimits[0].featureCode).toBe('menu_count');
  });

  it('defaults missing fields', () => {
    const result = mapSubscription({});

    expect(result.id).toBe('');
    expect(result.planId).toBe('');
    expect(result.planName).toBe('Unknown');
    expect(result.showWatermark).toBe(false);
    expect(result.featureLimits).toHaveLength(0);
  });

  it('maps trial status correctly', () => {
    const result = mapSubscription({ status: 'Trial', trialEndDate: '2026-04-01T00:00:00Z' });

    expect(result.status).toBe(SubscriptionStatus.Trial);
    expect(result.trialEndsAt).toBe('2026-04-01T00:00:00Z');
  });

  it('maps annual billing cycle', () => {
    const result = mapSubscription({ billingCycle: 'Annual' });
    expect(result.billingCycle).toBe(BillingCycle.Annual);
  });

  it('defaults unknown status to Expired', () => {
    const result = mapSubscription({ status: 'InvalidStatus' });
    expect(result.status).toBe(SubscriptionStatus.Expired);
  });
});

describe('mapPricingPlan', () => {
  it('maps a full pricing plan DTO', () => {
    const dto = {
      externalId: 'plan-456',
      name: 'Pro',
      description: 'Professional plan',
      tier: 'Pro',
      monthlyPriceUsd: 29,
      annualPriceUsd: 290,
      currency: 'USD',
      displayOrder: 2,
      features: [{ featureCode: 'custom_domain', limitType: 'Boolean', limitValue: null, isEnabled: true }],
    };

    const result = mapPricingPlan(dto);

    expect(result.id).toBe('plan-456');
    expect(result.name).toBe('Pro');
    expect(result.tier).toBe('Pro');
    expect(result.monthlyPrice).toBe(29);
    expect(result.annualPrice).toBe(290);
    expect(result.isPopular).toBe(true);
    expect(result.sortOrder).toBe(2);
    expect(result.features).toHaveLength(1);
    expect(result.featureLimits).toHaveLength(1);
  });

  it('marks Pro tier as popular', () => {
    const result = mapPricingPlan({ tier: 'Pro' });
    expect(result.isPopular).toBe(true);
  });

  it('does not mark Free tier as popular', () => {
    const result = mapPricingPlan({ tier: 'Free' });
    expect(result.isPopular).toBe(false);
  });

  it('defaults missing fields', () => {
    const result = mapPricingPlan({});

    expect(result.id).toBe('');
    expect(result.name).toBe('Unknown');
    expect(result.monthlyPrice).toBe(0);
    expect(result.currency).toBe('USD');
  });
});

describe('mapBillingHistory', () => {
  const PAGE = 1;
  const PAGE_SIZE = 20;

  it('maps payments to billing history items', () => {
    const dto = {
      payments: [
        {
          externalId: 'pay-1',
          amount: 29,
          currency: 'USD',
          status: 'Succeeded',
          processedDate: '2026-01-15T00:00:00Z',
          invoiceUrl: 'https://example.com/invoice',
          receiptUrl: null,
        },
      ],
      totalCount: 1,
    };

    const result = mapBillingHistory(dto, PAGE, PAGE_SIZE);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('pay-1');
    expect(result.items[0].amount).toBe(29);
    expect(result.items[0].date).toBe('2026-01-15T00:00:00Z');
    expect(result.totalCount).toBe(1);
    expect(result.page).toBe(PAGE);
    expect(result.pageSize).toBe(PAGE_SIZE);
  });

  it('defaults empty history', () => {
    const result = mapBillingHistory({}, PAGE, PAGE_SIZE);

    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});

describe('mapFeatureAccess', () => {
  it('maps a full feature access result', () => {
    const dto = {
      canAccess: true,
      limit: 10,
      isUnlimited: false,
      requiredPlan: 'Pro',
      currentPlan: 'Free',
    };

    const result = mapFeatureAccess(dto);

    expect(result.canAccess).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.isUnlimited).toBe(false);
    expect(result.requiredPlan).toBe('Pro');
    expect(result.currentPlan).toBe('Free');
  });

  it('defaults missing fields', () => {
    const result = mapFeatureAccess({});

    expect(result.canAccess).toBe(false);
    expect(result.limit).toBeNull();
    expect(result.isUnlimited).toBe(false);
    expect(result.requiredPlan).toBeNull();
    expect(result.currentPlan).toBeNull();
  });
});
