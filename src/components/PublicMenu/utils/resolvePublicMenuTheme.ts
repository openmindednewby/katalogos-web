import {
  DEFAULT_PUBLIC_MENU_THEME,
  PUBLIC_MENU_THEME_PRESETS,
} from './publicMenuThemePresets';
import { isValueDefined } from '../../../utils/is';

import type { PublicMenuTheme } from './publicMenuThemeTypes';

interface ThemeableContents {
  backgroundColor?: string | null;
  textColor?: string | null;
  themePresetId?: string | null;
  colorScheme?: { background?: string | null; text?: string | null } | null;
}

/** Finds a theme preset by its ID, or returns null. */
export function findThemeById(id: string): PublicMenuTheme | null {
  return PUBLIC_MENU_THEME_PRESETS.find((t) => t.id === id) ?? null;
}

/** Resolves the full public menu theme to apply. */
export function resolvePublicMenuTheme(
  menuContents: ThemeableContents | undefined,
  overrideThemeId?: string,
): PublicMenuTheme {
  if (isValueDefined(overrideThemeId) && overrideThemeId !== '') {
    const override = findThemeById(overrideThemeId);
    if (override) return override;
  }

  const contentsThemeId = menuContents?.themePresetId;
  if (isValueDefined(contentsThemeId) && contentsThemeId !== '') {
    const preset = findThemeById(contentsThemeId);
    if (preset) return preset;
  }

  const scheme = menuContents?.colorScheme;
  if (isValueDefined(scheme)) {
    const hasBg = isValueDefined(scheme.background);
    const hasText = isValueDefined(scheme.text);
    if (hasBg || hasText)
      return applyLegacyOverrides(DEFAULT_PUBLIC_MENU_THEME, menuContents);
  }

  return DEFAULT_PUBLIC_MENU_THEME;
}

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
