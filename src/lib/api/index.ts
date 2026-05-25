/**
 * Public API for the modular HTTP interceptor system.
 *
 * This barrel re-exports everything consumers need:
 * - apiClient: the shared Axios instance (no interceptors pre-registered)
 * - registerInterceptors: call once at bootstrap to install all interceptors
 * - errors/: error classification, matching, and action execution
 * - events/: typed event bus bridging interceptors to React UI
 *
 * Post-BFF-cutover there is no client-side token refresh: the BFF refreshes
 * tokens server-side; a 401 is handled by the session-expiry interceptor.
 */

// --- Core Axios instance and interceptor registration ---
export { apiClient } from './axiosInstance';
export { registerInterceptors } from './interceptors';

// --- Error system ---
export {
  ErrorActionType,
  ErrorSeverity,
  getErrorRules,
  registerErrorRule,
  resetErrorRules,
  DEFAULT_ERROR_RULES,
  isAuthEndpoint,
  PRIORITY_ROUTE_SPECIFIC,
  PRIORITY_FEATURE_GATED,
  PRIORITY_MAINTENANCE,
  PRIORITY_DEFAULT,
  classifyError,
  matchError,
  executeErrorAction,
  resolveMessage,
  registerCustomHandler,
  unregisterCustomHandler,
  reportToMonitoring,
} from './errors';

export type {
  HttpMethod,
  ClassifiedError,
  StatusRange,
  ErrorMatcher,
  ErrorAction,
  ErrorRule,
  ErrorMatchResult,
} from './errors';

// --- Event bus ---
export { apiEventBus, ApiEventBus, useApiEvents, ApiEventsProvider } from './events';

export type {
  ApiEventListener,
  ToastEvent,
  ModalEvent,
  RedirectEvent,
  SessionExpiredEvent,
  MaintenanceModeEvent,
  ApiEvent,
  ApiEventType,
  UseApiEventsResult,
} from './events';
