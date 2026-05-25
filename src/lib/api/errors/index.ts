export {
  ErrorActionType,
  ErrorSeverity,
} from './errorTypes';

export type {
  HttpMethod,
  ClassifiedError,
  StatusRange,
  ErrorMatcher,
  ErrorAction,
  ErrorRule,
  ErrorMatchResult,
} from './errorTypes';

export {
  getErrorRules,
  registerErrorRule,
  resetErrorRules,
  DEFAULT_ERROR_RULES,
  isAuthEndpoint,
  PRIORITY_ROUTE_SPECIFIC,
  PRIORITY_FEATURE_GATED,
  PRIORITY_MAINTENANCE,
  PRIORITY_DEFAULT,
} from './errorRegistry';

export { classifyError } from './errorClassifier';

export { matchError } from './errorMatcher';

export {
  executeErrorAction,
  resolveMessage,
  registerCustomHandler,
  unregisterCustomHandler,
} from './errorActions';

export { reportToMonitoring } from './errorReporter';
