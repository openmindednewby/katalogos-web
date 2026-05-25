/**
 * Tests for SVG template rendering.
 * Verifies each template returns valid SVG with correct structure and content.
 */

import {
  escapeXml,
  renderTableTentTemplate,
  renderStickerTemplate,
  renderPosterTemplate,
  renderTemplate,
} from './designerTemplates';
import { TEMPLATE_DIMENSIONS } from './qrDesignerConstants';
import { TemplateType } from '../enums/TemplateType';

import type { TemplateRenderOptions } from './designerTemplates';

const BASE_OPTIONS: TemplateRenderOptions = {
  restaurantName: 'Test Restaurant',
  tagline: 'Best food in town',
  callToAction: 'Scan for Menu',
  qrFgColor: '#000000',
  qrBgColor: '#ffffff',
  accentColor: '#1a73e8',
  qrDataUri: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
  logoDataUri: '',
};

describe('escapeXml', () => {
  it('escapes ampersands', () => {
    expect(escapeXml('A & B')).toBe('A &amp; B');
  });

  it('escapes angle brackets', () => {
    expect(escapeXml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    expect(escapeXml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes apostrophes', () => {
    expect(escapeXml("it's")).toBe('it&apos;s');
  });

  it('handles combined special characters', () => {
    expect(escapeXml('<"A & B">')).toBe('&lt;&quot;A &amp; B&quot;&gt;');
  });

  it('passes through safe text unchanged', () => {
    expect(escapeXml('Hello World 123')).toBe('Hello World 123');
  });
});

describe('renderTableTentTemplate', () => {
  it('returns a valid SVG string', () => {
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('uses correct viewBox dimensions', () => {
    const dims = TEMPLATE_DIMENSIONS[TemplateType.TableTent];
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
  });

  it('includes restaurant name', () => {
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    expect(svg).toContain('Test Restaurant');
  });

  it('includes tagline', () => {
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    expect(svg).toContain('Best food in town');
  });

  it('includes call to action', () => {
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    expect(svg).toContain('Scan for Menu');
  });

  it('includes QR data URI in image element', () => {
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    expect(svg).toContain('href="data:image/svg+xml;base64,');
  });

  it('includes logo when provided', () => {
    const opts = { ...BASE_OPTIONS, logoDataUri: 'data:image/png;base64,abc' };
    const svg = renderTableTentTemplate(opts);
    expect(svg).toContain('data:image/png;base64,abc');
  });

  it('omits logo image element when logo is empty', () => {
    const svg = renderTableTentTemplate(BASE_OPTIONS);
    const imageCount = (svg.match(/<image/g) ?? []).length;
    expect(imageCount).toBe(1); // Only the QR image
  });

  it('escapes special characters in restaurant name', () => {
    const opts = { ...BASE_OPTIONS, restaurantName: 'Joe\'s <Grill> & Bar' };
    const svg = renderTableTentTemplate(opts);
    expect(svg).toContain('Joe&apos;s &lt;Grill&gt; &amp; Bar');
    expect(svg).not.toContain('<Grill>');
  });
});

describe('renderStickerTemplate', () => {
  it('returns a valid SVG string', () => {
    const svg = renderStickerTemplate(BASE_OPTIONS);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('uses correct viewBox for square sticker', () => {
    const dims = TEMPLATE_DIMENSIONS[TemplateType.Sticker];
    const svg = renderStickerTemplate(BASE_OPTIONS);
    expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
  });

  it('includes restaurant name', () => {
    const svg = renderStickerTemplate(BASE_OPTIONS);
    expect(svg).toContain('Test Restaurant');
  });

  it('includes accent-color border ring', () => {
    const svg = renderStickerTemplate(BASE_OPTIONS);
    expect(svg).toContain('stroke="#1a73e8"');
  });
});

describe('renderPosterTemplate', () => {
  it('returns a valid SVG string', () => {
    const svg = renderPosterTemplate(BASE_OPTIONS);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('uses correct viewBox dimensions', () => {
    const dims = TEMPLATE_DIMENSIONS[TemplateType.Poster];
    const svg = renderPosterTemplate(BASE_OPTIONS);
    expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
  });

  it('includes restaurant name and CTA', () => {
    const svg = renderPosterTemplate(BASE_OPTIONS);
    expect(svg).toContain('Test Restaurant');
    expect(svg).toContain('Scan for Menu');
  });

  it('includes logo when provided', () => {
    const opts = { ...BASE_OPTIONS, logoDataUri: 'data:image/png;base64,xyz' };
    const svg = renderPosterTemplate(opts);
    expect(svg).toContain('data:image/png;base64,xyz');
  });
});

describe('renderTemplate dispatcher', () => {
  it('dispatches to table tent for TableTent type', () => {
    const svg = renderTemplate(TemplateType.TableTent, BASE_OPTIONS);
    const dims = TEMPLATE_DIMENSIONS[TemplateType.TableTent];
    expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
  });

  it('dispatches to sticker for Sticker type', () => {
    const svg = renderTemplate(TemplateType.Sticker, BASE_OPTIONS);
    const dims = TEMPLATE_DIMENSIONS[TemplateType.Sticker];
    expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
  });

  it('dispatches to poster for Poster type', () => {
    const svg = renderTemplate(TemplateType.Poster, BASE_OPTIONS);
    const dims = TEMPLATE_DIMENSIONS[TemplateType.Poster];
    expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
  });
});
