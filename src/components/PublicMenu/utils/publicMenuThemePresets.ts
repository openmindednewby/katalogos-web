/**
 * Registry of all public menu theme presets.
 * Individual preset definitions are split across presetsLight.ts
 * and presetsDark.ts to keep each file under 200 lines.
 */
import { BOTANICAL, COASTAL, DARK, ELEGANT, MIDNIGHT, WARM } from './presetsDark';
import { CLASSIC, FRESH, MINIMAL, MODERN, RUSTIC, VIBRANT } from './presetsLight';

import type { PublicMenuTheme } from './publicMenuThemeTypes';

/** All available public menu theme presets, ordered for display. */
export const PUBLIC_MENU_THEME_PRESETS: readonly PublicMenuTheme[] = [
  MINIMAL,
  MODERN,
  FRESH,
  CLASSIC,
  ELEGANT,
  RUSTIC,
  VIBRANT,
  DARK,
  COASTAL,
  WARM,
  BOTANICAL,
  MIDNIGHT,
] as const;

/** Default theme used when no preset is selected. */
export const DEFAULT_PUBLIC_MENU_THEME: PublicMenuTheme = MODERN;

/** Default public menu theme ID. */
export const DEFAULT_PUBLIC_MENU_THEME_ID = MODERN.id;

/** Total number of available presets (used in tests). */
export const PUBLIC_MENU_THEME_COUNT = PUBLIC_MENU_THEME_PRESETS.length;
