/**
 * Resolves which public menu theme preset to apply.
 *
 * Resolution order:
 * 1. If the menu contents include a `themePresetId`, use that preset
 * 2. Otherwise fall back to DEFAULT_PUBLIC_MENU_THEME
 *
 * Per-menu color overrides (backgroundColor, textColor) from
 * the legacy schema are merged on top of the resolved preset.
 */
import {
  DEFAULT_PUBLIC_MENU_THEME,
  PUBLIC_MENU_THEME_PRESETS,
} from './publicMenuThemePresets';
import { isValueDefined } from '../../../utils/is';

import type { PublicMenuTheme } from './publicMenuThemeTypes';

/**
 * Minimal shape accepted by the theme resolver.
 * Both the generated MenuContents and the local MenuContents satisfy this.
 */
interface ThemeableContents {
  backgroundColor?: string | null;
  textColor?: string | null;
  themePresetId?: string;
  colorScheme?: { background?: string; text?: string } | null;
}

/** Finds a theme preset by its ID, or returns null. */
export function findThemeById(id: string): PublicMenuTheme | null {
  return PUBLIC_MENU_THEME_PRESETS.find((t) => t.id === id) ?? null;
}

/**
 * Resolves the full public menu theme to apply.
 *
 * @param menuContents - The menu contents (may contain themePresetId)
 * @param overrideThemeId - Explicit theme ID override (e.g. from query param)
 * @returns A fully resolved PublicMenuTheme
 */
export function resolvePublicMenuTheme(
  menuContents: ThemeableContents | undefined,
  overrideThemeId?: string,
): PublicMenuTheme {
  // 1. Explicit override takes highest priority
  if (isValueDefined(overrideThemeId) && overrideThemeId !== '') {
    const override = findThemeById(overrideThemeId);
    if (override) return override;
  }

  // 2. Theme ID stored in menu contents
  const contentsThemeId = menuContents?.themePresetId;
  if (isValueDefined(contentsThemeId) && contentsThemeId !== '') {
    const preset = findThemeById(contentsThemeId);
    if (preset) return preset;
  }

  // 3. Legacy color scheme detection
  const scheme = menuContents?.colorScheme;
  if (isValueDefined(scheme)) {
    const hasBg = isValueDefined(scheme.background);
    const hasText = isValueDefined(scheme.text);
    if (hasBg || hasText)
      return applyLegacyOverrides(DEFAULT_PUBLIC_MENU_THEME, menuContents);
  }

  // 4. Default
  return DEFAULT_PUBLIC_MENU_THEME;
}

/**
 * Merges legacy per-menu color overrides onto a base theme.
 * Only overrides colors that are explicitly set in the menu contents.
 */
function applyLegacyOverrides(
  base: PublicMenuTheme,
  contents: ThemeableContents | undefined,
): PublicMenuTheme {
  if (!isValueDefined(contents)) return base;

  const bgOverride = contents.backgroundColor ?? contents.colorScheme?.background;
  const textOverride = contents.textColor ?? contents.colorScheme?.text;

  const hasOverrides = isValueDefined(bgOverride) || isValueDefined(textOverride);
  if (!hasOverrides) return base;

  return {
    ...base,
    colors: {
      ...base.colors,
      ...(isValueDefined(bgOverride) ? { background: bgOverride } : {}),
      ...(isValueDefined(textOverride) ? { text: textOverride } : {}),
    },
  };
}
