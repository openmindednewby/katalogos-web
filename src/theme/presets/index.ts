/**
 * Theme presets barrel export.
 * Provides built-in presets that tenants can choose as a starting point.
 */
import { DEFAULT_THEME_CONFIG } from './default';
import { FOREST_THEME_CONFIG } from './forest';
import { OCEAN_THEME_CONFIG } from './ocean';
import { SUNSET_THEME_CONFIG } from './sunset';
import { TAG_HEUER_THEME_CONFIG } from './tagHeuer';

import type { TenantThemeConfig } from '../types';

export interface ThemePreset {
  readonly id: string;
  readonly name: string;
  readonly config: TenantThemeConfig;
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: 'default', name: 'Default', config: DEFAULT_THEME_CONFIG },
  { id: 'tagHeuer', name: 'Tag Heuer', config: TAG_HEUER_THEME_CONFIG },
  { id: 'ocean', name: 'Ocean', config: OCEAN_THEME_CONFIG },
  { id: 'forest', name: 'Forest', config: FOREST_THEME_CONFIG },
  { id: 'sunset', name: 'Sunset', config: SUNSET_THEME_CONFIG },
];

export { DEFAULT_THEME_CONFIG } from './default';
export { TAG_HEUER_THEME_CONFIG } from './tagHeuer';
export { OCEAN_THEME_CONFIG } from './ocean';
export { FOREST_THEME_CONFIG } from './forest';
export { SUNSET_THEME_CONFIG } from './sunset';
