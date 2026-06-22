import { HTTP_STATUS } from '../../../shared/constants';
import { isValueDefined } from '../../../utils/is';

interface ErrorWithResponse {
  response?: { status?: number };
}

function hasResponse(error: unknown): error is ErrorWithResponse {
  return typeof error === 'object' && isValueDefined(error) && 'response' in error;
}

/**
 * True when an API error is the backend's "paid plan required" refusal (HTTP 403)
 * for an AI feature. The OnlineMenu AI endpoints (description / nutrition / import
 * / translate) return 403 for free-tier tenants; the UI uses this to show an
 * upgrade prompt instead of a generic failure.
 */
export function isPaidFeatureError(error: unknown): boolean {
  return hasResponse(error) && error.response?.status === HTTP_STATUS.FORBIDDEN;
}
