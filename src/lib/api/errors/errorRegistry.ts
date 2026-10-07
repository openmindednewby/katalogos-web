import {
  setLoginRedirectPath,
  resetErrorRules,
} from '@dloizides/api-client-base';

const BASE_CLIENT_LOGIN_PATH = '/(auth)/login';

setLoginRedirectPath(BASE_CLIENT_LOGIN_PATH);
resetErrorRules();

export {
  DEFAULT_ERROR_RULES,
  PRIORITY_DEFAULT,
  PRIORITY_FEATURE_GATED,
  PRIORITY_MAINTENANCE,
  PRIORITY_ROUTE_SPECIFIC,
  getErrorRules,
  isAuthEndpoint,
  registerErrorRule,
  resetErrorRules,
} from '@dloizides/api-client-base';
