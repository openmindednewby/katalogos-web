/**
 * Default theme preset.
 * Values are taken directly from palette.ts basePalette to ensure
 * the app looks identical before any tenant customization is applied.
 */
import type { TenantThemeConfig } from '../types';

export const DEFAULT_THEME_CONFIG: TenantThemeConfig = {
  primary: '#005f73',
  secondary: '#94d2bd',
  accent: '#008d5c',

  semantic: {
    success: '#0a9396',
    warning: '#ee9b00',
    error: '#ae2012',
    info: '#005f73',
  },

  light: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#001219',
    textSecondary: '#717171',
    border: '#e6e6e6',
    divider: '#e6e6e6',
  },

  dark: {
    background: '#001219',
    surface: '#052f33',
    surfaceElevated: '#073b40',
    text: '#e9d8a6',
    textSecondary: '#a8a090',
    border: '#053f40',
    divider: '#053f40',
  },

  branding: {
    logoContentId: null,
    faviconContentId: null,
    presetId: 'default',
  },
};
