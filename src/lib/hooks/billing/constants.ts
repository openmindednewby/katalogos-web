/** React Query cache keys for billing-related queries. */
export const BILLING_QUERY_KEYS = {
  pricingPlans: ['billing', 'pricing-plans'] as const,
  currentSubscription: ['billing', 'subscription', 'current'] as const,
  billingHistory: (page: number, pageSize: number) =>
    ['billing', 'history', page, pageSize] as const,
  featureAccess: (featureCode: string) =>
    ['billing', 'feature-access', featureCode] as const,
} as const;

/** Default page size for billing history pagination. */
export const BILLING_HISTORY_PAGE_SIZE = 20;

/** First page index. */
export const FIRST_PAGE = 1;

/** Number of days considered a short trial remaining. */
export const TRIAL_WARNING_DAYS = 3;

/** Milliseconds in a single day. */
export const MS_PER_DAY = 86400000;
