/**
 * Unit tests for useWhiteLabelConfig hook utilities.
 * Tests the toWhiteLabelConfig mapping function.
 */
import { toWhiteLabelConfig } from './useWhiteLabelConfig';

describe('toWhiteLabelConfig', () => {
  it('maps all fields from API response', () => {
    const response = {
      customLogoUrl: 'https://example.com/logo.png',
      customFaviconUrl: 'https://example.com/favicon.ico',
      customCss: 'body { color: red; }',
      headerHtml: '<header>Custom</header>',
      footerHtml: '<footer>Custom</footer>',
      showPoweredBy: false,
      companyName: 'Acme Corp',
      supportEmail: 'support@acme.com',
    };

    const result = toWhiteLabelConfig(response);

    expect(result.customLogoUrl).toBe('https://example.com/logo.png');
    expect(result.customFaviconUrl).toBe('https://example.com/favicon.ico');
    expect(result.customCss).toBe('body { color: red; }');
    expect(result.headerHtml).toBe('<header>Custom</header>');
    expect(result.footerHtml).toBe('<footer>Custom</footer>');
    expect(result.showPoweredBy).toBe(false);
    expect(result.companyName).toBe('Acme Corp');
    expect(result.supportEmail).toBe('support@acme.com');
  });

  it('defaults null/undefined fields correctly', () => {
    const response = {};

    const result = toWhiteLabelConfig(response);

    expect(result.customLogoUrl).toBeNull();
    expect(result.customFaviconUrl).toBeNull();
    expect(result.customCss).toBeNull();
    expect(result.headerHtml).toBeNull();
    expect(result.footerHtml).toBeNull();
    expect(result.showPoweredBy).toBe(true);
    expect(result.companyName).toBeNull();
    expect(result.supportEmail).toBeNull();
  });

  it('defaults showPoweredBy to true when undefined', () => {
    const response = { showPoweredBy: undefined };

    const result = toWhiteLabelConfig(response);

    expect(result.showPoweredBy).toBe(true);
  });

  it('preserves showPoweredBy false when explicitly set', () => {
    const response = { showPoweredBy: false };

    const result = toWhiteLabelConfig(response);

    expect(result.showPoweredBy).toBe(false);
  });

  it('handles explicit null values', () => {
    const response = {
      customLogoUrl: null,
      companyName: null,
      showPoweredBy: true,
    };

    const result = toWhiteLabelConfig(response);

    expect(result.customLogoUrl).toBeNull();
    expect(result.companyName).toBeNull();
    expect(result.showPoweredBy).toBe(true);
  });
});
