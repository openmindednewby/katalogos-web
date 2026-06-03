/**
 * The app's role → post-login route table for `resolvePostLoginRoute`.
 *
 * The unified-auth plan replaces each app's ad-hoc `router.replace(...)` after
 * login with a data-driven router: the BFF surfaces the user's roles, the app
 * supplies this table, and `resolvePostLoginRoute` picks the destination.
 *
 * Phase 1c is a no-behaviour-change port — katalogos-web currently sends every
 * signed-in user to `/(protected)` regardless of role, so every entry here
 * resolves to that same route and `fallback` covers a role-less user. The table
 * exists so a future phase can split per-role dashboards by editing data only.
 *
 * Entry order is priority (most privileged first), per the `RoleRouteTable`
 * contract — irrelevant while every route is identical, but correct for later.
 */
import { KeycloakRoles } from '@dloizides/auth-client';
import { resolvePostLoginRoute } from '@dloizides/auth-web';

import { featureFlags } from '../config/featureFlags';
import { isValueDefined } from '../utils/is';

import type { BffUser } from '@dloizides/auth-client';
import type { RoleRouteTable } from '@dloizides/auth-web';

/** The protected-area landing route every signed-in user reaches today. */
const PROTECTED_HOME_ROUTE = '/(protected)';

/** katalogos-web role → route table consumed by `resolvePostLoginRoute`. */
const postLoginRouteTable: RoleRouteTable = {
  routes: [
    { role: KeycloakRoles.SuperUser, route: PROTECTED_HOME_ROUTE },
    { role: KeycloakRoles.Admin, route: PROTECTED_HOME_ROUTE },
    { role: KeycloakRoles.User, route: PROTECTED_HOME_ROUTE },
  ],
  fallback: PROTECTED_HOME_ROUTE,
};

/**
 * Resolve where to send a freshly-signed-in user.
 *
 * With the `unifiedAuthWeb` flag on, the destination is data-driven —
 * `resolvePostLoginRoute` against `postLoginRouteTable`. With the flag off, or
 * when no user was surfaced, it falls back to the legacy fixed protected route.
 * Every table entry resolves to `PROTECTED_HOME_ROUTE` today, so both paths are
 * behaviour-identical — Phase 1c is a no-behaviour-change port.
 */
export function resolvePostLoginDestination(user: BffUser | undefined): string {
  if (!featureFlags.unifiedAuthWeb || !isValueDefined(user)) 
    return PROTECTED_HOME_ROUTE;
  
  return resolvePostLoginRoute(user, postLoginRouteTable) ?? PROTECTED_HOME_ROUTE;
}
