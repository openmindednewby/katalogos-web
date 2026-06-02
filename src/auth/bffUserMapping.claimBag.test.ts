/**
 * Unit tests for `claimBagToBffUser` — the device-PIN unlock → `BffUser` bridge
 * (unified-login Increment 3 Batch 3). Tests the narrowing logic: known claims
 * are projected with `typeof` guards, malformed claims are dropped, and unknown
 * claims survive through the index signature.
 */
import { claimBagToBffUser } from './bffUserMapping';

describe('claimBagToBffUser', () => {
  it('projects well-typed known claims onto the BffUser', () => {
    const result = claimBagToBffUser({
      sub: 'user-123',
      email: 'a@b.com',
      email_verified: true,
      name: 'Ada Lovelace',
      given_name: 'Ada',
      family_name: 'Lovelace',
      preferred_username: 'ada',
      tenantId: 'tenant-1',
      roles: ['admin', 'user'],
    });

    expect(result.sub).toBe('user-123');
    expect(result.email).toBe('a@b.com');
    expect(result.email_verified).toBe(true);
    expect(result.name).toBe('Ada Lovelace');
    expect(result.given_name).toBe('Ada');
    expect(result.family_name).toBe('Lovelace');
    expect(result.preferred_username).toBe('ada');
    expect(result.tenantId).toBe('tenant-1');
    expect(result.roles).toEqual(['admin', 'user']);
  });

  it('drops claims of the wrong primitive type rather than leaking them', () => {
    const result = claimBagToBffUser({
      sub: 42,
      email: null,
      email_verified: 'yes',
      name: { nested: true },
      tenantId: 7,
    });

    expect(result.sub).toBeUndefined();
    expect(result.email).toBeUndefined();
    expect(result.email_verified).toBeUndefined();
    expect(result.name).toBeUndefined();
    expect(result.tenantId).toBeUndefined();
  });

  it('keeps only string entries from a roles array and drops non-strings', () => {
    const result = claimBagToBffUser({ roles: ['admin', 5, null, 'user'] });
    expect(result.roles).toEqual(['admin', 'user']);
  });

  it('sets roles to undefined when the roles claim is not an array', () => {
    const result = claimBagToBffUser({ roles: 'admin' });
    expect(result.roles).toBeUndefined();
  });

  it('preserves unknown claims through the index signature', () => {
    const result = claimBagToBffUser({ sub: 'x', custom_claim: 'kept', scope: 'openid' });
    expect(result.custom_claim).toBe('kept');
    expect(result.scope).toBe('openid');
  });

  it('returns an all-undefined-but-valid user for an empty claim bag', () => {
    const result = claimBagToBffUser({});
    expect(result.sub).toBeUndefined();
    expect(result.roles).toBeUndefined();
  });
});
