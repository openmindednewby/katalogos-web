import { normalizeKeycloakUser, type BffUser, type KeycloakUserInfo, type NormalizedUser } from './keycloakTypes';
import { isValueDefined } from '../utils/is';

const SUPER_USER_ROLE = 'superUser';
const ADMIN_ROLE = 'admin';
const USER_ROLE = 'user';

type KeycloakRole = KeycloakUserInfo['roles'][number];

function isKeycloakRole(value: string): value is KeycloakRole {
  if (value === SUPER_USER_ROLE) return true;
  if (value === ADMIN_ROLE) return true;
  if (value === USER_ROLE) return true;
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && isValueDefined(value);
}

function readRealmAccessRoles(realmAccess: unknown): string[] {
  if (!isRecord(realmAccess)) return [];
  const roles = realmAccess.roles;
  if (!Array.isArray(roles)) return [];
  return roles.filter((r): r is string => typeof r === 'string');
}

function collectRoles(user: BffUser): KeycloakRole[] {
  const flat = Array.isArray(user.roles) ? user.roles.filter((r): r is string => typeof r === 'string') : [];
  const realmRoles = readRealmAccessRoles(user.realm_access);
  const merged = [...flat, ...realmRoles];
  const known = merged.filter((r): r is KeycloakRole => isKeycloakRole(r));
  return Array.from(new Set(known));
}

/** Project a `BffUser` onto `KeycloakUserInfo`. */
export function bffUserToKeycloakUserInfo(user: BffUser): KeycloakUserInfo {
  const roles = collectRoles(user);
  return {
    sub: typeof user.sub === 'string' ? user.sub : undefined,
    email: typeof user.email === 'string' ? user.email : undefined,
    email_verified: typeof user.email_verified === 'boolean' ? user.email_verified : undefined,
    name: typeof user.name === 'string' ? user.name : undefined,
    given_name: typeof user.given_name === 'string' ? user.given_name : undefined,
    family_name: typeof user.family_name === 'string' ? user.family_name : undefined,
    preferred_username: typeof user.preferred_username === 'string' ? user.preferred_username : undefined,
    tenantId: typeof user.tenantId === 'string' ? user.tenantId : undefined,
    roles,
    realm_access: roles.length > 0 ? { roles } : undefined,
  };
}

/** Project a `BffUser` straight onto `NormalizedUser` (via `KeycloakUserInfo`). */
export function bffUserToNormalizedUser(user: BffUser): NormalizedUser {
  return normalizeKeycloakUser(bffUserToKeycloakUserInfo(user));
}

/** Narrow a claim bag (`{ [claim]: unknown }`) into a typed `BffUser`. */
export function claimBagToBffUser(claims: Record<string, unknown>): BffUser {
  const stringRoles = Array.isArray(claims.roles)
    ? claims.roles.filter((r): r is string => typeof r === 'string')
    : undefined;
  return {
    ...claims,
    sub: typeof claims.sub === 'string' ? claims.sub : undefined,
    email: typeof claims.email === 'string' ? claims.email : undefined,
    email_verified: typeof claims.email_verified === 'boolean' ? claims.email_verified : undefined,
    name: typeof claims.name === 'string' ? claims.name : undefined,
    given_name: typeof claims.given_name === 'string' ? claims.given_name : undefined,
    family_name: typeof claims.family_name === 'string' ? claims.family_name : undefined,
    preferred_username:
      typeof claims.preferred_username === 'string' ? claims.preferred_username : undefined,
    tenantId: typeof claims.tenantId === 'string' ? claims.tenantId : undefined,
    roles: stringRoles,
  };
}
