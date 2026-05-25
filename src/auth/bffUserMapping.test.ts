/**
 * Unit tests for the BFF user mapping — the projection from the `BffUser`
 * returned by `BffAuthClient` onto the app's `KeycloakUserInfo` /
 * `NormalizedUser` shapes. Pure logic: role narrowing, `realm_access`
 * reconstruction, claim copying.
 */
import { bffUserToKeycloakUserInfo, bffUserToNormalizedUser } from './bffUserMapping';

import type { BffUser } from '@dloizides/auth-client';

const FULL_BFF_USER: BffUser = {
  sub: 'user-123',
  email: 'jim@example.com',
  email_verified: true,
  name: 'Jim Doe',
  given_name: 'Jim',
  family_name: 'Doe',
  preferred_username: 'jim',
  tenantId: 'tenant-9',
  roles: ['admin', 'user'],
};

describe('bffUserToKeycloakUserInfo', () => {
  it('copies every claim straight across', () => {
    const info = bffUserToKeycloakUserInfo(FULL_BFF_USER);
    expect(info.sub).toBe('user-123');
    expect(info.email).toBe('jim@example.com');
    expect(info.email_verified).toBe(true);
    expect(info.name).toBe('Jim Doe');
    expect(info.given_name).toBe('Jim');
    expect(info.family_name).toBe('Doe');
    expect(info.preferred_username).toBe('jim');
    expect(info.tenantId).toBe('tenant-9');
  });

  it('narrows roles to known Keycloak roles and dedupes', () => {
    const info = bffUserToKeycloakUserInfo({ ...FULL_BFF_USER, roles: ['admin', 'admin', 'bogus', 'user'] });
    expect(info.roles).toEqual(['admin', 'user']);
  });

  it('merges flat roles with realm_access.roles', () => {
    const info = bffUserToKeycloakUserInfo({
      sub: 's',
      roles: ['user'],
      realm_access: { roles: ['admin'] },
    });
    expect(info.roles.sort()).toEqual(['admin', 'user']);
  });

  it('reconstructs realm_access from the resolved roles', () => {
    const info = bffUserToKeycloakUserInfo(FULL_BFF_USER);
    expect(info.realm_access).toEqual({ roles: ['admin', 'user'] });
  });

  it('omits realm_access when there are no known roles', () => {
    const info = bffUserToKeycloakUserInfo({ sub: 's', roles: ['bogus'] });
    expect(info.realm_access).toBeUndefined();
    expect(info.roles).toEqual([]);
  });

  it('leaves missing claims undefined rather than null', () => {
    const info = bffUserToKeycloakUserInfo({ sub: 's' });
    expect(info.email).toBeUndefined();
    expect(info.name).toBeUndefined();
    expect(info.tenantId).toBeUndefined();
  });

  it('ignores non-string claim values', () => {
    const info = bffUserToKeycloakUserInfo({ sub: 's', email: 42 as unknown as string });
    expect(info.email).toBeUndefined();
  });
});

describe('bffUserToNormalizedUser', () => {
  it('produces a NormalizedUser carrying the narrowed roles', () => {
    const user = bffUserToNormalizedUser(FULL_BFF_USER);
    expect(user.roles).toEqual(['admin', 'user']);
  });

  it('produces an empty roles array when no known roles are present', () => {
    const user = bffUserToNormalizedUser({ sub: 's', roles: ['nope'] });
    expect(user.roles).toEqual([]);
  });
});
