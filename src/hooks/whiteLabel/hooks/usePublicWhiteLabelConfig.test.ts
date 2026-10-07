import { toWhiteLabelConfig } from './useWhiteLabelConfig';

describe('usePublicWhiteLabelConfig (tenantId gating)', () => {
  it('reuses toWhiteLabelConfig for field mapping', () => {
    const response = {
      customLogoUrl: 'https://logo.png',
      showPoweredBy: false,
      companyName: 'Test Corp',
    };

    const result = toWhiteLabelConfig(response);

    expect(result.customLogoUrl).toBe('https://logo.png');
    expect(result.showPoweredBy).toBe(false);
    expect(result.companyName).toBe('Test Corp');
    expect(result.customCss).toBeNull();
  });

  it('defaults all nullable fields to null when response is empty', () => {
    const result = toWhiteLabelConfig({});

    expect(result.customLogoUrl).toBeNull();
    expect(result.customFaviconUrl).toBeNull();
    expect(result.customCss).toBeNull();
    expect(result.headerHtml).toBeNull();
    expect(result.footerHtml).toBeNull();
    expect(result.showPoweredBy).toBe(true);
    expect(result.companyName).toBeNull();
    expect(result.supportEmail).toBeNull();
  });
});
