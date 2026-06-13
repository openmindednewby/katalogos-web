import { isCustomDomainHost } from './isCustomDomainHost';

describe('isCustomDomainHost', () => {
  it.each([
    'katalogos.dloizides.com',
    'staging.katalogos.dloizides.com',
    'katalogos-api.dloizides.com',
    'dloizides.com',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '[::1]',
  ])('treats canonical/local host %s as NOT a custom domain', (host) => {
    expect(isCustomDomainHost(host)).toBe(false);
  });

  it.each([
    'menu.acme.com',
    'food.restaurant.co.uk',
    'eat.bistro.io',
    'MENU.ACME.COM',
  ])('treats tenant host %s as a custom domain', (host) => {
    expect(isCustomDomainHost(host)).toBe(true);
  });

  it('is a safe no-op for empty/unknown hosts', () => {
    expect(isCustomDomainHost('')).toBe(false);
    expect(isCustomDomainHost('   ')).toBe(false);
    expect(isCustomDomainHost(undefined)).toBe(false);
    expect(isCustomDomainHost(null)).toBe(false);
  });

  it('does not mistake a lookalike suffix for the platform zone', () => {
    // notdloizides.com must NOT match `.dloizides.com`
    expect(isCustomDomainHost('notdloizides.com')).toBe(true);
    expect(isCustomDomainHost('evil-dloizides.com')).toBe(true);
  });
});
