/**
 * Ocean blue theme preset.
 * Professional blue tones inspired by enterprise applications.
 * Deep ocean blues with subtle cyan accents for a trustworthy, modern look.
 */
import type { TenantThemeConfig } from '../types';

export const OCEAN_THEME_CONFIG: TenantThemeConfig = {
  primary: '#0369a1',
  secondary: '#0891b2',
  accent: '#0284c7',

  semantic: {
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7',
  },

  light: {
    background: '#ffffff',
    surface: '#f0f9ff',
    surfaceElevated: '#ffffff',
    text: '#0c4a6e',
    textSecondary: '#64748b',
    border: '#bae6fd',
    divider: '#e0f2fe',
  },

  dark: {
    background: '#0c1929',
    surface: '#132f4c',
    surfaceElevated: '#1a3d5c',
    text: '#e0f2fe',
    textSecondary: '#7dd3fc',
    border: '#1e4976',
    divider: '#164e73',
  },

  branding: {
    logoContentId: null,
    faviconContentId: null,
    presetId: 'ocean',
  },
};
