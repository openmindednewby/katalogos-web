/**
 * Helper functions for billing settings display logic.
 */
import { MS_PER_DAY } from '../../../../lib/hooks/billing/constants';
import SubscriptionStatus from '../../../../lib/hooks/billing/enums/SubscriptionStatus';
import { isValueDefined } from '../../../../utils/is';

/** Calculate the number of days remaining in a trial period. */
export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!isValueDefined(trialEndsAt)) return 0;

  const endsAt = new Date(trialEndsAt).getTime();
  const now = Date.now();
  const diffMs = endsAt - now;

  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / MS_PER_DAY);
}

/** Returns the translation key for a subscription status badge. */
export function getStatusTranslationKey(status: SubscriptionStatus): string {
  const statusKeyMap: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.Trial]: 'settings.billing.status.trial',
    [SubscriptionStatus.Active]: 'settings.billing.status.active',
    [SubscriptionStatus.PastDue]: 'settings.billing.status.pastDue',
    [SubscriptionStatus.Canceled]: 'settings.billing.status.canceled',
    [SubscriptionStatus.Expired]: 'settings.billing.status.expired',
    [SubscriptionStatus.Suspended]: 'settings.billing.status.suspended',
  };

  return statusKeyMap[status];
}

/** Whether the subscription is in an active-enough state to allow plan changes. */
export function canChangePlan(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.Trial
    || status === SubscriptionStatus.Active;
}

/** Whether the subscription can be canceled. */
export function canCancelSubscription(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.Trial
    || status === SubscriptionStatus.Active
    || status === SubscriptionStatus.PastDue;
}

/** Map a billing history item status to a localized translation key. */
export function getInvoiceStatusTranslationKey(status: string): string {
  const key = status.toLowerCase();
  const statusKeyMap: Record<string, string> = {
    succeeded: 'settings.billing.invoiceStatusValue.succeeded',
    failed: 'settings.billing.invoiceStatusValue.failed',
    pending: 'settings.billing.invoiceStatusValue.pending',
    refunded: 'settings.billing.invoiceStatusValue.refunded',
  };

  const UNKNOWN_STATUS_KEY = 'settings.billing.invoiceStatusValue.unknown';
  return statusKeyMap[key] ?? UNKNOWN_STATUS_KEY;
}

/** Calculate annual savings percentage. */
export function getAnnualSavingsPercent(monthlyPrice: number, annualPrice: number): number {
  if (monthlyPrice <= 0) return 0;

  const MONTHS_PER_YEAR = 12;
  const yearlyAtMonthlyRate = monthlyPrice * MONTHS_PER_YEAR;
  const savings = yearlyAtMonthlyRate - annualPrice;

  if (savings <= 0) return 0;

  const PERCENT = 100;
  return Math.round((savings / yearlyAtMonthlyRate) * PERCENT);
}
