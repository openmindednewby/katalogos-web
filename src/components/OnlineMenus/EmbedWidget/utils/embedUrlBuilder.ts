import { isValueDefined } from '../../../../utils/is';

interface EmbedUrlOptions {
  themeOverride: 'light' | 'dark' | null;
  accentColor: string | null;
  origin?: string | null;
}

/**
 * Builds the full embed URL for a given menu external ID and configuration.
 * Pure function with no side effects.
 */
export function buildEmbedUrl(
  publicUrl: string,
  menuExternalId: string,
  options: EmbedUrlOptions,
): string {
  const base = `${publicUrl}/public/menu/embed/${encodeURIComponent(menuExternalId)}`;
  const params: string[] = ['embed=1'];

  if (isValueDefined(options.themeOverride))
    params.push(`theme=${encodeURIComponent(options.themeOverride)}`);

  if (isValueDefined(options.accentColor) && options.accentColor.trim() !== '')
    params.push(`accentColor=${encodeURIComponent(options.accentColor)}`);

  if (isValueDefined(options.origin) && options.origin.trim() !== '')
    params.push(`origin=${encodeURIComponent(options.origin)}`);

  return `${base}?${params.join('&')}`;
}
