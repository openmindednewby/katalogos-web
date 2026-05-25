/**
 * Billing hooks barrel export.
 *
 * All hooks wrap Orval-generated payment API hooks and expose
 * a stable interface for UI components.
 */
export { useGetPricingPlans } from './hooks/useGetPricingPlans';
export { useGetCurrentSubscription, SUBSCRIPTION_QUERY_KEY } from './hooks/useGetCurrentSubscription';
export { useCreateSubscription } from './hooks/useCreateSubscription';
export { useCancelSubscription } from './hooks/useCancelSubscription';
export { useChangePlan } from './hooks/useChangePlan';
export { useCheckFeatureAccess } from './hooks/useCheckFeatureAccess';
export { useGetBillingHistory } from './hooks/useGetBillingHistory';
export { useCreatePortalSession } from './hooks/useCreatePortalSession';

export type {
  PricingPlan,
  PlanFeature,
  FeatureLimit,
  Subscription,
  CreateSubscriptionRequest,
  ChangePlanRequest,
  FeatureAccessResult,
  BillingHistoryItem,
  BillingHistoryResponse,
  PortalSessionRequest,
  PortalSessionResponse,
} from './types';

export { BILLING_QUERY_KEYS, BILLING_HISTORY_PAGE_SIZE, FIRST_PAGE, TRIAL_WARNING_DAYS, MS_PER_DAY } from './constants';
