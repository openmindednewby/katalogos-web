/**
 * Subscription error handler utilities.
 *
 * Extracts plan and feature information from 402/403 responses
 * to provide context for upgrade modals and feature gate UI.
 */

import { isValueDefined } from '../../../../utils/is';

import type { ClassifiedError } from '../errorTypes';

/** HTTP 402 Payment Required */
const STATUS_PAYMENT_REQUIRED = 402;

/** HTTP 403 Forbidden */
const STATUS_FORBIDDEN = 403;

/** Error code indicating a gated feature */
const FEATURE_GATED_CODE = 'FEATURE_GATED';

/** Subscription context extracted from the error response */
interface SubscriptionErrorInfo {
  isSubscriptionError: boolean;
  isFeatureGated: boolean;
  requiredPlan: string | undefined;
  currentPlan: string | undefined;
  featureName: string | undefined;
  trialExpired: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object' && !Array.isArray(value);
}

function extractStringField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key];
  if (typeof value === 'string' && value !== '') return value;
  return undefined;
}

/**
 * Extract subscription/payment context from a classified error.
 * Looks for plan names, feature info, and trial status in the response body.
 */
function extractSubscriptionInfo(error: ClassifiedError): SubscriptionErrorInfo {
  const isSubscriptionError = error.status === STATUS_PAYMENT_REQUIRED;
  const isFeatureGated = error.status === STATUS_FORBIDDEN && error.errorCode === FEATURE_GATED_CODE;

  const defaultResult: SubscriptionErrorInfo = {
    isSubscriptionError,
    isFeatureGated,
    requiredPlan: undefined,
    currentPlan: undefined,
    featureName: undefined,
    trialExpired: false,
  };

  const body = error.body;
  if (!isRecord(body)) return defaultResult;

  return {
    isSubscriptionError,
    isFeatureGated,
    requiredPlan: extractStringField(body, 'requiredPlan'),
    currentPlan: extractStringField(body, 'currentPlan'),
    featureName: extractStringField(body, 'featureName') ?? extractStringField(body, 'feature'),
    trialExpired: body.trialExpired === true,
  };
}

export { extractSubscriptionInfo, FEATURE_GATED_CODE };
export type { SubscriptionErrorInfo };
