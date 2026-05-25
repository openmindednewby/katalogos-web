/**
 * Unit tests for useWhiteLabelMutation hook utilities.
 * Tests the toApiPayload mapping function.
 */
import { toApiPayload } from './useWhiteLabelMutation';

import type { WhiteLabelFormState } from '../types';

describe('toApiPayload', () => {
  it('maps filled form to API payload with values', () => {
    const form: WhiteLabelFormState = {
      customLogoUrl: 'https://example.com/logo.png',
      customFaviconUrl: 'https://example.com/favicon.ico',
      customCss: '.header { color: blue; }',
      headerHtml: '<div>Header</div>',
      footerHtml: '<div>Footer</div>',
      showPoweredBy: false,
      companyName: 'Test Corp',
      supportEmail: 'help@test.com',
    };

    const result = toApiPayload(form);

    expect(result.customLogoUrl).toBe('https://example.com/logo.png');
    expect(result.customFaviconUrl).toBe('https://example.com/favicon.ico');
    expect(result.customCss).toBe('.header { color: blue; }');
    expect(result.headerHtml).toBe('<div>Header</div>');
    expect(result.footerHtml).toBe('<div>Footer</div>');
    expect(result.showPoweredBy).toBe(false);
    expect(result.companyName).toBe('Test Corp');
    expect(result.supportEmail).toBe('help@test.com');
  });

  it('converts empty strings to null', () => {
    const form: WhiteLabelFormState = {
      customLogoUrl: '',
      customFaviconUrl: '',
      customCss: '',
      headerHtml: '',
      footerHtml: '',
      showPoweredBy: true,
      companyName: '',
      supportEmail: '',
    };

    const result = toApiPayload(form);

    expect(result.customLogoUrl).toBeNull();
    expect(result.customFaviconUrl).toBeNull();
    expect(result.customCss).toBeNull();
    expect(result.headerHtml).toBeNull();
    expect(result.footerHtml).toBeNull();
    expect(result.showPoweredBy).toBe(true);
    expect(result.companyName).toBeNull();
    expect(result.supportEmail).toBeNull();
  });

  it('preserves showPoweredBy boolean value', () => {
    const formTrue: WhiteLabelFormState = {
      customLogoUrl: '',
      customFaviconUrl: '',
      customCss: '',
      headerHtml: '',
      footerHtml: '',
      showPoweredBy: true,
      companyName: '',
      supportEmail: '',
    };

    const formFalse: WhiteLabelFormState = {
      ...formTrue,
      showPoweredBy: false,
    };

    expect(toApiPayload(formTrue).showPoweredBy).toBe(true);
    expect(toApiPayload(formFalse).showPoweredBy).toBe(false);
  });

  it('handles partial form with mixed empty and filled fields', () => {
    const form: WhiteLabelFormState = {
      customLogoUrl: 'https://logo.png',
      customFaviconUrl: '',
      customCss: 'body {}',
      headerHtml: '',
      footerHtml: '<footer/>',
      showPoweredBy: false,
      companyName: 'Corp',
      supportEmail: '',
    };

    const result = toApiPayload(form);

    expect(result.customLogoUrl).toBe('https://logo.png');
    expect(result.customFaviconUrl).toBeNull();
    expect(result.customCss).toBe('body {}');
    expect(result.headerHtml).toBeNull();
    expect(result.footerHtml).toBe('<footer/>');
    expect(result.companyName).toBe('Corp');
    expect(result.supportEmail).toBeNull();
  });
});
