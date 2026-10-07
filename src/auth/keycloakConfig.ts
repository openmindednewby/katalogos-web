import { parseRealmFromIssuer } from '@dloizides/auth-client';

import env from '../config/environment';

/** Existing-shape Keycloak config. Kept for backwards compatibility with the */
export const keycloakConfig = {
  issuer: env.KEYCLOAK_ISSUER,
  clientId: env.KEYCLOAK_CLIENT_ID,
  redirectUri: env.KEYCLOAK_REDIRECT_URI,
  scopes: env.KEYCLOAK_SCOPES.split(' '),
};

/** Realm name parsed out of the issuer URL. */
export const keycloakRealm: string | null = parseRealmFromIssuer(env.KEYCLOAK_ISSUER);
