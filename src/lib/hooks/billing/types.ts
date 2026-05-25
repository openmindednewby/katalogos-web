/**
 * Types for billing and subscription hooks.
 *
 * These types are the frontend-facing shapes consumed by UI components.
 * The hooks map Orval-generated API DTOs to these types.
 */
import type BillingCycle from './enums/BillingCycle';
import type SubscriptionStatus from './enums/SubscriptionStatus';

/** A single feature limit attached to a plan or subscription. */
export interface FeatureLimit {
  featureCode: string;
  limitType: string;
  limitValue: number | null;
  isEnabled: boolean;
}

/** A single feature included in a pricing plan (display-facing). */
export interface PlanFeature {
  code: string;
  name: string;
  limit: number | null;
}

/** Pricing plan returned by GET /api/pricing-plans. */
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  tier: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: PlanFeature[];
  featureLimits: FeatureLimit[];
  isPopular: boolean;
  sortOrder: number;
}

/** Current subscription returned by GET /api/subscriptions/current. */
export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  planTier: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt: string | null;
  canceledAt: string | null;
  showWatermark: boolean;
  featureLimits: FeatureLimit[];
}

/** Request body for POST /api/subscriptions. */
export interface CreateSubscriptionRequest {
  planId: string;
  billingCycle: BillingCycle;
}

/** Request body for PATCH /api/subscriptions/current/plan. */
export interface ChangePlanRequest {
  planId: string;
  billingCycle: BillingCycle;
}

/** Feature access check result from GET /api/subscriptions/features/{featureCode}. */
export interface FeatureAccessResult {
  canAccess: boolean;
  limit: number | null;
  isUnlimited: boolean;
  requiredPlan: string | null;
  currentPlan: string | null;
}

/** A single billing history entry from GET /api/billing/history. */
export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl: string | null;
}

/** Paginated billing history response. */
export interface BillingHistoryResponse {
  items: BillingHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Request body for POST /api/billing/portal-session. */
export interface PortalSessionRequest {
  returnUrl: string;
}

/** Response from POST /api/billing/portal-session. */
export interface PortalSessionResponse {
  url: string;
}
