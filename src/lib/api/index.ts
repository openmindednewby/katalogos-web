/** Public API for the modular HTTP interceptor system. */

export { apiClient, registerAllInterceptors } from './apiClient';

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
