import { parseRealmFromIssuer } from '@dloizides/auth-client';

import env from '../config/environment';

/**
 * Existing-shape Keycloak config. Kept for backwards compatibility with the
 * (currently dormant) PKCE flow in `useKeycloakExchange.ts` and any other
 * consumer that already destructures `{ issuer, clientId, redirectUri, scopes }`.
 */
export const keycloakConfig = {
  issuer: env.KEYCLOAK_ISSUER,
  clientId: env.KEYCLOAK_CLIENT_ID,
  redirectUri: env.KEYCLOAK_REDIRECT_URI,
  scopes: env.KEYCLOAK_SCOPES.split(' '),
};

/**
 * Realm name parsed out of the issuer URL.
 *
 * Phase 2 of the product split (Questioner ⇄ OnlineMenu) will give each app
 * its own realm; consumers that need to reason about the realm at runtime
 * (e.g. a route guard that gates by realm-issued claim) read from here so we
 * have one canonical, package-validated source.
 */
export const keycloakRealm: string | null = parseRealmFromIssuer(env.KEYCLOAK_ISSUER);
