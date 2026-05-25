/**
 * Additional unit tests for resolveLogoUrl edge cases.
 *
 * Complements TenantLogo.test.ts by testing URL formats not covered:
 * undefined input (runtime safety), whitespace-only, query strings,
 * and protocol-relative URLs.
 */
import { resolveLogoUrl } from './TenantLogo';

describe('resolveLogoUrl - additional URL formats', () => {
  it('returns null when logoUrl is undefined (runtime safety)', () => {
    // The type signature is string | null, but runtime callers may pass undefined
    const result = resolveLogoUrl(undefined as unknown as string | null);
    expect(result).toBeNull();
  });

  it('returns the URL for a protocol-relative URL', () => {
    const url = '//cdn.example.com/logo.png';
    expect(resolveLogoUrl(url)).toBe(url);
  });

  it('returns the URL for a URL with query parameters', () => {
    const url = 'https://example.com/logo.png?v=2&format=webp';
    expect(resolveLogoUrl(url)).toBe(url);
  });

  it('returns the URL for a URL with hash fragment', () => {
    const url = 'https://example.com/logo.svg#icon';
    expect(resolveLogoUrl(url)).toBe(url);
  });

  it('returns the URL for a GUID-style content ID', () => {
    const guid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(resolveLogoUrl(guid)).toBe(guid);
  });

  it('returns whitespace-only string as-is (not treated as empty)', () => {
    // resolveLogoUrl checks for '' but not whitespace-only
    const whitespace = '   ';
    expect(resolveLogoUrl(whitespace)).toBe(whitespace);
  });

  it('returns the URL for an HTTP URL', () => {
    const url = 'http://example.com/logo.png';
    expect(resolveLogoUrl(url)).toBe(url);
  });

  it('returns the URL for a blob URL', () => {
    const blobUrl = 'blob:http://localhost:8082/abc123';
    expect(resolveLogoUrl(blobUrl)).toBe(blobUrl);
  });
});
