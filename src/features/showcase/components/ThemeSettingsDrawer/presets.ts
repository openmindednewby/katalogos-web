/**
 * Theme preset definitions for the Theme Settings Drawer.
 * Each preset contains a name and an array of RGB color strings
 * used to render the color swatch preview strip.
 */

interface ThemePreset {
  name: string;
  colors: string[];
}

const FIRST_PRESET_INDEX = 0;

/**
 * Available theme presets.
 * Note: Some presets intentionally share colors (e.g., `100 116 139`).
 * The component must use index-based keys to avoid React duplicate key warnings.
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Default',
    colors: ['59 130 246', '99 102 241', '100 116 139', '241 245 249', '15 23 42'],
  },
  {
    name: 'Emerald',
    colors: ['16 185 129', '20 184 166', '100 116 139', '236 253 245', '6 78 59'],
  },
  {
    name: 'Rose',
    colors: ['244 63 94', '251 113 133', '148 163 184', '255 241 242', '136 19 55'],
  },
  {
    name: 'Amber',
    colors: ['245 158 11', '251 191 36', '148 163 184', '255 251 235', '120 53 15'],
  },
];
export const DEFAULT_ACTIVE_PRESET_INDEX = FIRST_PRESET_INDEX;
