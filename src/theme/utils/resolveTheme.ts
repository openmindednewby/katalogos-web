


/**
 * Build a fully resolved theme from config and mode.
 * Callers should memoize the result to avoid recomputation.
 */
/**
 * Builds a ResolvedTheme from a TenantThemeConfig and a ThemeMode.
 * Pure function with no side effects.
 */
import { generateThemePalette } from './palette-generator';
import { DEFAULT_THEME_CONFIG } from '../presets';

import type ThemeMode from '../../shared/enums/ThemeMode';
import type { ResolvedTheme, TenantThemeConfig } from '../types';

const DEFAULT_FONT_FAMILY = 'System';
const DEFAULT_HEADING_SCALE = 1.0;

export function resolveTheme(
  config: TenantThemeConfig | null,
  mode: ThemeMode,
): ResolvedTheme {
  const effectiveConfig = config ?? DEFAULT_THEME_CONFIG;
  const paletteResult = generateThemePalette(effectiveConfig);

  return {
    colors: effectiveConfig[mode],
    palette: {
      primary: paletteResult.primary,
      secondary: paletteResult.secondary,
      accent: paletteResult.accent,
    },
    semantic: paletteResult.semantic,
    typography: {
      fontFamily: effectiveConfig.typography?.fontFamily ?? DEFAULT_FONT_FAMILY,
      headingScale: effectiveConfig.typography?.headingScale ?? DEFAULT_HEADING_SCALE,
    },
    mode,
    branding: {
      logoUrl: effectiveConfig.branding.logoContentId,
      faviconUrl: effectiveConfig.branding.faviconContentId,
    },
  };
}
