/**
 * Warm sunset theme preset.
 * Rich coral and amber tones evoking a sunset horizon.
 * Warm oranges with deep plum undertones for depth.
 */
import type { TenantThemeConfig } from '../types';

export const SUNSET_THEME_CONFIG: TenantThemeConfig = {
  primary: '#c2410c',
  secondary: '#a21caf',
  accent: '#ea580c',

  semantic: {
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2',
  },

  light: {
    background: '#ffffff',
    surface: '#fff7ed',
    surfaceElevated: '#ffffff',
    text: '#431407',
    textSecondary: '#78716c',
    border: '#fed7aa',
    divider: '#ffedd5',
  },

  dark: {
    background: '#1c0f0a',
    surface: '#2d1810',
    surfaceElevated: '#3d2218',
    text: '#ffedd5',
    textSecondary: '#fdba74',
    border: '#5c3520',
    divider: '#4a2a18',
  },

  branding: {
    logoContentId: null,
    faviconContentId: null,
    presetId: 'sunset',
  },
};
