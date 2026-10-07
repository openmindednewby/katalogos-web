import { KeycloakRoles } from '@dloizides/auth-client';
import { resolvePostLoginRoute } from '@dloizides/auth-web';

import { featureFlags } from '../config/featureFlags';
import { isValueDefined } from '../utils/is';

import type { BffUser } from '@dloizides/auth-client';
import type { RoleRouteTable } from '@dloizides/auth-web';

const PROTECTED_HOME_ROUTE = '/(protected)';

const postLoginRouteTable: RoleRouteTable = {
  routes: [
    { role: KeycloakRoles.SuperUser, route: PROTECTED_HOME_ROUTE },
    { role: KeycloakRoles.Admin, route: PROTECTED_HOME_ROUTE },
    { role: KeycloakRoles.User, route: PROTECTED_HOME_ROUTE },
  ],
  fallback: PROTECTED_HOME_ROUTE,
};

/** Resolve where to send a freshly-signed-in user. */
export function resolvePostLoginDestination(user: BffUser | undefined): string {
  if (!featureFlags.unifiedAuthWeb || !isValueDefined(user)) 
    return PROTECTED_HOME_ROUTE;
  
  return resolvePostLoginRoute(user, postLoginRouteTable) ?? PROTECTED_HOME_ROUTE;
}
