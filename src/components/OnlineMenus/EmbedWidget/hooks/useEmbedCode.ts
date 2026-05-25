import { useMemo } from 'react';

import { isValueDefined } from '../../../../utils/is';
import { EMBED_SANDBOX_ATTRS } from '../utils/embedCodeConstants';
import { buildEmbedUrl } from '../utils/embedUrlBuilder';

export interface EmbedWidgetConfig {
  width: string;
  height: number;
  themeOverride: 'light' | 'dark' | null;
  accentColor: string | null;
}

interface EmbedCodeResult {
  iframeCode: string;
  jsCode: string;
  embedUrl: string;
}

function buildIframeCode(embedUrl: string, config: EmbedWidgetConfig): string {
  return [
    `<iframe`,
    `  src="${embedUrl}"`,
    `  width="${config.width}"`,
    `  height="${String(config.height)}"`,
    `  frameborder="0"`,
    `  scrolling="no"`,
    `  loading="lazy"`,
    `  title="Embedded Menu"`,
    `  sandbox="${EMBED_SANDBOX_ATTRS}"`,
    `></iframe>`,
  ].join('\n');
}

function buildJsCode(config: EmbedWidgetConfig, publicUrl: string, menuId: string): string {
  const dataAttrs = [
    `data-menu-widget`,
    `data-menu-id="${menuId}"`,
    `data-origin="${publicUrl}"`,
    `data-width="${config.width}"`,
    `data-height="${String(config.height)}"`,
  ];

  if (isValueDefined(config.themeOverride))
    dataAttrs.push(`data-theme="${config.themeOverride}"`);

  if (isValueDefined(config.accentColor) && config.accentColor.trim() !== '')
    dataAttrs.push(`data-accent-color="${config.accentColor}"`);

  return [
    `<div ${dataAttrs.join(' ')}></div>`,
    `<script src="${publicUrl}/widget.js"></script>`,
  ].join('\n');
}

/**
 * Generates iframe and JS widget embed code snippets from the given configuration.
 * Pure computation, no side effects.
 */
export function generateEmbedCode(config: EmbedWidgetConfig, publicUrl: string, menuId: string): EmbedCodeResult {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = buildEmbedUrl(publicUrl, menuId, {
    themeOverride: config.themeOverride,
    accentColor: config.accentColor,
    origin,
  });

  return {
    iframeCode: buildIframeCode(embedUrl, config),
    jsCode: buildJsCode(config, publicUrl, menuId),
    embedUrl,
  };
}

/** React hook wrapper around generateEmbedCode with memoization. */
export function useEmbedCode(config: EmbedWidgetConfig, publicUrl: string, menuId: string): EmbedCodeResult {
  return useMemo(
    () => generateEmbedCode(config, publicUrl, menuId),
    [config, publicUrl, menuId],
  );
}
