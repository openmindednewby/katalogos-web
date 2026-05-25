/**
 * BaseClient compatibility shim. The real implementation lives in
 * `@dloizides/auth-client` so that future apps in the dloizides.com portfolio
 * (Questioner-realm, OnlineMenu-realm, etc.) can share the same realm-aware
 * type contract.
 *
 * Existing imports in BaseClient continue to work unchanged via this re-export.
 */
export {
  isKeycloakRole,
  KeycloakRoles,
  normalizeKeycloakUser,
} from '@dloizides/auth-client';

export type { BffUser, KeycloakUserInfo, NormalizedUser } from '@dloizides/auth-client';
