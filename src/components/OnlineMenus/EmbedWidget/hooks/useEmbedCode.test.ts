import { generateEmbedCode } from './useEmbedCode';

import type { EmbedWidgetConfig } from './useEmbedCode';

describe('generateEmbedCode', () => {
  const publicUrl = 'https://app.example.com';
  const menuId = 'menu-42';
  const testOrigin = window.location.origin;

  const baseConfig: EmbedWidgetConfig = {
    width: '100%',
    height: 600,
    themeOverride: null,
    accentColor: null,
  };

  it('generates iframe code with correct attributes', () => {
    const { iframeCode } = generateEmbedCode(baseConfig, publicUrl, menuId);
    expect(iframeCode).toContain('<iframe');
    expect(iframeCode).toContain('</iframe>');
    expect(iframeCode).toContain(`src="${publicUrl}/public/menu/embed/${menuId}?embed=1`);
    expect(iframeCode).toContain(`origin=${encodeURIComponent(testOrigin)}`);
    expect(iframeCode).toContain('width="100%"');
    expect(iframeCode).toContain('height="600"');
    expect(iframeCode).toContain('sandbox="allow-scripts allow-same-origin"');
  });

  it('generates JS code with data-menu-widget div and script tag', () => {
    const { jsCode } = generateEmbedCode(baseConfig, publicUrl, menuId);
    expect(jsCode).toContain('data-menu-widget');
    expect(jsCode).toContain(`data-menu-id="${menuId}"`);
    expect(jsCode).toContain(`data-origin="${publicUrl}"`);
    expect(jsCode).toContain(`<script src="${publicUrl}/widget.js"></script>`);
  });

  it('includes theme in URL params when themeOverride is set', () => {
    const config: EmbedWidgetConfig = { ...baseConfig, themeOverride: 'dark' };
    const { iframeCode, jsCode } = generateEmbedCode(config, publicUrl, menuId);
    expect(iframeCode).toContain('theme=dark');
    expect(jsCode).toContain('data-theme="dark"');
  });

  it('includes accentColor in URL params when set', () => {
    const config: EmbedWidgetConfig = { ...baseConfig, accentColor: '#ff0000' };
    const { iframeCode, jsCode } = generateEmbedCode(config, publicUrl, menuId);
    expect(iframeCode).toContain('accentColor=%23ff0000');
    expect(jsCode).toContain('data-accent-color="#ff0000"');
  });

  it('omits theme data attribute when themeOverride is null', () => {
    const { jsCode } = generateEmbedCode(baseConfig, publicUrl, menuId);
    expect(jsCode).not.toContain('data-theme');
  });

  it('omits accentColor data attribute when accentColor is null', () => {
    const { jsCode } = generateEmbedCode(baseConfig, publicUrl, menuId);
    expect(jsCode).not.toContain('data-accent-color');
  });

  it('returns a valid embedUrl with origin param', () => {
    const { embedUrl } = generateEmbedCode(baseConfig, publicUrl, menuId);
    expect(embedUrl).toContain(`${publicUrl}/public/menu/embed/${menuId}?embed=1`);
    expect(embedUrl).toContain(`origin=${encodeURIComponent(testOrigin)}`);
  });

  it('uses custom width and height in generated code', () => {
    const config: EmbedWidgetConfig = { ...baseConfig, width: '500px', height: 800 };
    const { iframeCode, jsCode } = generateEmbedCode(config, publicUrl, menuId);
    expect(iframeCode).toContain('width="500px"');
    expect(iframeCode).toContain('height="800"');
    expect(jsCode).toContain('data-width="500px"');
    expect(jsCode).toContain('data-height="800"');
  });
});
