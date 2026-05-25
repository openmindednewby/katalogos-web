/**
 * Unit tests for billing helper functions.
 * Tests logic: trial day calculations, status keys, permissions.
 */
import {
  getTrialDaysRemaining,
  getStatusTranslationKey,
  canChangePlan,
  canCancelSubscription,
  getAnnualSavingsPercent,
  getInvoiceStatusTranslationKey,
} from './billingHelpers';
import { MS_PER_DAY } from '../../../../lib/hooks/billing/constants';
import SubscriptionStatus from '../../../../lib/hooks/billing/enums/SubscriptionStatus';

describe('getTrialDaysRemaining', () => {
  it('returns 0 for null trialEndsAt', () => {
    expect(getTrialDaysRemaining(null)).toBe(0);
  });

  it('returns 0 when trial has already ended', () => {
    const pastDate = new Date(Date.now() - MS_PER_DAY).toISOString();
    expect(getTrialDaysRemaining(pastDate)).toBe(0);
  });

  it('returns correct days for future trial end', () => {
    const fiveDaysLater = new Date(Date.now() + MS_PER_DAY * 5).toISOString();
    const result = getTrialDaysRemaining(fiveDaysLater);
    expect(result).toBe(5);
  });

  it('rounds up partial days', () => {
    const halfDayLater = new Date(Date.now() + MS_PER_DAY / 2).toISOString();
    const result = getTrialDaysRemaining(halfDayLater);
    expect(result).toBe(1);
  });
});

describe('getStatusTranslationKey', () => {
  it('returns correct key for Trial status', () => {
    expect(getStatusTranslationKey(SubscriptionStatus.Trial)).toBe('settings.billing.status.trial');
  });

  it('returns correct key for Active status', () => {
    expect(getStatusTranslationKey(SubscriptionStatus.Active)).toBe('settings.billing.status.active');
  });

  it('returns correct key for PastDue status', () => {
    expect(getStatusTranslationKey(SubscriptionStatus.PastDue)).toBe('settings.billing.status.pastDue');
  });

  it('returns correct key for Canceled status', () => {
    expect(getStatusTranslationKey(SubscriptionStatus.Canceled)).toBe('settings.billing.status.canceled');
  });

  it('returns correct key for Expired status', () => {
    expect(getStatusTranslationKey(SubscriptionStatus.Expired)).toBe('settings.billing.status.expired');
  });

  it('returns correct key for Suspended status', () => {
    expect(getStatusTranslationKey(SubscriptionStatus.Suspended)).toBe('settings.billing.status.suspended');
  });
});

describe('canChangePlan', () => {
  it('allows plan change for Trial status', () => {
    expect(canChangePlan(SubscriptionStatus.Trial)).toBe(true);
  });

  it('allows plan change for Active status', () => {
    expect(canChangePlan(SubscriptionStatus.Active)).toBe(true);
  });

  it('disallows plan change for PastDue status', () => {
    expect(canChangePlan(SubscriptionStatus.PastDue)).toBe(false);
  });

  it('disallows plan change for Canceled status', () => {
    expect(canChangePlan(SubscriptionStatus.Canceled)).toBe(false);
  });

  it('disallows plan change for Expired status', () => {
    expect(canChangePlan(SubscriptionStatus.Expired)).toBe(false);
  });

  it('disallows plan change for Suspended status', () => {
    expect(canChangePlan(SubscriptionStatus.Suspended)).toBe(false);
  });
});

describe('canCancelSubscription', () => {
  it('allows cancel for Trial status', () => {
    expect(canCancelSubscription(SubscriptionStatus.Trial)).toBe(true);
  });

  it('allows cancel for Active status', () => {
    expect(canCancelSubscription(SubscriptionStatus.Active)).toBe(true);
  });

  it('allows cancel for PastDue status', () => {
    expect(canCancelSubscription(SubscriptionStatus.PastDue)).toBe(true);
  });

  it('disallows cancel for Canceled status', () => {
    expect(canCancelSubscription(SubscriptionStatus.Canceled)).toBe(false);
  });

  it('disallows cancel for Expired status', () => {
    expect(canCancelSubscription(SubscriptionStatus.Expired)).toBe(false);
  });

  it('disallows cancel for Suspended status', () => {
    expect(canCancelSubscription(SubscriptionStatus.Suspended)).toBe(false);
  });
});

describe('getInvoiceStatusTranslationKey', () => {
  it('returns correct key for succeeded status', () => {
    expect(getInvoiceStatusTranslationKey('succeeded')).toBe('settings.billing.invoiceStatusValue.succeeded');
  });

  it('returns correct key for failed status', () => {
    expect(getInvoiceStatusTranslationKey('Failed')).toBe('settings.billing.invoiceStatusValue.failed');
  });

  it('returns unknown key for unrecognized status', () => {
    expect(getInvoiceStatusTranslationKey('disputed')).toBe('settings.billing.invoiceStatusValue.unknown');
  });
});

describe('getAnnualSavingsPercent', () => {
  it('returns 0 when monthly price is 0', () => {
    expect(getAnnualSavingsPercent(0, 0)).toBe(0);
  });

  it('returns 0 when annual price equals 12x monthly', () => {
    expect(getAnnualSavingsPercent(10, 120)).toBe(0);
  });

  it('calculates correct savings for standard discount', () => {
    // $29/mo = $348/yr, annual price $290 = $58 savings = ~17%
    expect(getAnnualSavingsPercent(29, 290)).toBe(17);
  });

  it('returns 0 when annual is more expensive than monthly', () => {
    expect(getAnnualSavingsPercent(10, 200)).toBe(0);
  });

  it('handles negative monthly price', () => {
    expect(getAnnualSavingsPercent(-10, 100)).toBe(0);
  });
});
