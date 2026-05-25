/**
 * Re-export shim for @dloizides/api-client-base error registry.
 *
 * The default rules, registry mutators, and priority constants live in the
 * shared `@dloizides/api-client-base` package. This file is kept for
 * backward compatibility with existing imports inside BaseClient.
 *
 * BaseClient overrides the session-expired redirect target to the
 * expo-router login route on module load.
 */
import {
  setLoginRedirectPath,
  resetErrorRules,
} from '@dloizides/api-client-base';

const BASE_CLIENT_LOGIN_PATH = '/(auth)/login';

setLoginRedirectPath(BASE_CLIENT_LOGIN_PATH);
// Apply the override to the in-memory ruleset so the existing default rules
// emit the BaseClient-specific redirect target without requiring a manual
// reset by the caller.
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
