/**
 * Re-export shim for @dloizides/api-client-base error matcher.
 *
 * The runtime implementation lives in the shared `@dloizides/api-client-base`
 * package. This file is kept for backward compatibility with existing
 * imports inside BaseClient.
 */
export {
  matchError,
  matchesMethod,
  matchesPath,
  matchesRule,
  matchesStatus,
} from '@dloizides/api-client-base';
