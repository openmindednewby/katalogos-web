import { KeycloakRoles, normalizeKeycloakUser, type KeycloakUserInfo } from './keycloakTypes';

describe('keycloakTypes', () => {
  it('normalizeKeycloakUser returns empty roles when undefined', () => {
    expect(normalizeKeycloakUser(undefined)).toEqual({ roles: [] });
  });

  it('normalizes fields and dedupes roles across access blocks', () => {
    const u: KeycloakUserInfo = {
      sub: 'u1',
      email: 'u1@example.com',
      email_verified: true,
      preferred_username: 'user1',
      given_name: 'A',
      family_name: 'B',
      realm_access: { roles: [KeycloakRoles.Admin, KeycloakRoles.User] },
      resource_access: {
        app: { roles: [KeycloakRoles.Admin, KeycloakRoles.SuperUser] },
      },
      roles: [],
    };

    const out = normalizeKeycloakUser(u);
    expect(out.id).toBe('u1');
    expect(out.username).toBe('user1');
    expect(out.email).toBe('u1@example.com');
    expect(out.displayName).toBe('A B');
    expect(out.emailVerified).toBe(true);
    expect(out.roles.sort()).toEqual([KeycloakRoles.Admin, KeycloakRoles.SuperUser, KeycloakRoles.User].sort());
    expect(out.raw).toBe(u);
  });

  it('displayName falls back to preferred_username/name/email', () => {
    const out = normalizeKeycloakUser({ roles: [], email: 'x@y.com' });
    expect(out.username).toBe('x@y.com');
    expect(out.displayName).toBe('x@y.com');
  });
});
