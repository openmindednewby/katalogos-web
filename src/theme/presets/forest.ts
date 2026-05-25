/**
 * Forest green theme preset.
 * Nature-inspired green tones with earthy warmth.
 * Deep forest greens paired with amber highlights.
 */
import type { TenantThemeConfig } from '../types';

export const FOREST_THEME_CONFIG: TenantThemeConfig = {
  primary: '#15803d',
  secondary: '#a16207',
  accent: '#166534',

  semantic: {
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#0d9488',
  },

  light: {
    background: '#ffffff',
    surface: '#f0fdf4',
    surfaceElevated: '#ffffff',
    text: '#14532d',
    textSecondary: '#4b5563',
    border: '#bbf7d0',
    divider: '#dcfce7',
  },

  dark: {
    background: '#0a1f13',
    surface: '#132e1c',
    surfaceElevated: '#1a3d25',
    text: '#dcfce7',
    textSecondary: '#86efac',
    border: '#1e5631',
    divider: '#1a4428',
  },

  branding: {
    logoContentId: null,
    faviconContentId: null,
    presetId: 'forest',
  },
};
