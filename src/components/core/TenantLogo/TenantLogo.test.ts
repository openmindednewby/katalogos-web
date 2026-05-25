import { resolveFallbackText, resolveLogoUrl } from './TenantLogo';

describe('resolveLogoUrl', () => {
  it('returns the logo URL when a valid URL is provided', () => {
    const url = 'https://example.com/logo.png';
    expect(resolveLogoUrl(url)).toBe(url);
  });

  it('returns null when logoUrl is null', () => {
    expect(resolveLogoUrl(null)).toBeNull();
  });

  it('returns null when logoUrl is an empty string', () => {
    expect(resolveLogoUrl('')).toBeNull();
  });

  it('returns the URL for a relative path', () => {
    const url = '/images/tenant-logo.png';
    expect(resolveLogoUrl(url)).toBe(url);
  });

  it('returns the URL for a data URI', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
    expect(resolveLogoUrl(dataUri)).toBe(dataUri);
  });
});

describe('resolveFallbackText', () => {
  const PRODUCT = 'Katalogos';

  it('returns the tenant name when present', () => {
    expect(resolveFallbackText("Joe's Pizza", PRODUCT)).toBe("Joe's Pizza");
  });

  it('returns the product name when tenantName is null', () => {
    expect(resolveFallbackText(null, PRODUCT)).toBe(PRODUCT);
  });

  it('returns the product name when tenantName is an empty string', () => {
    expect(resolveFallbackText('', PRODUCT)).toBe(PRODUCT);
  });

  it('returns the product name when tenantName is whitespace only', () => {
    expect(resolveFallbackText('   ', PRODUCT)).toBe(PRODUCT);
  });

  it('does NOT trim non-empty tenant names (UI shows what the API returned)', () => {
    expect(resolveFallbackText("Joe's Pizza  ", PRODUCT)).toBe("Joe's Pizza  ");
  });
});
