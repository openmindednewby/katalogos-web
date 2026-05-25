/**
 * Dark and specialty public menu theme presets.
 * Split from publicMenuThemePresets.ts to stay under 200 lines.
 */
import { createPreset } from './createPreset';

import type { PublicMenuTheme } from './publicMenuThemeTypes';

export const ELEGANT: PublicMenuTheme = createPreset({
  id: 'elegant',
  nameKey: 'publicMenu.themes.elegant',
  descriptionKey: 'publicMenu.themes.elegantDesc',
  colors: {
    background: '#1a1a2e', surface: '#16213e', text: '#eaeaea',
    textSecondary: '#a0a0b0', accent: '#c9a84c', border: '#2a2a4a',
    divider: '#2a2a4a',
  },
  typography: {
    headingFont: 'Georgia, "Times New Roman", serif',
    bodyFont: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    titleWeight: '700', categoryWeight: '600',
    itemNameWeight: '500', priceWeight: '700',
    headingLetterSpacing: 1.5, bodyLetterSpacing: 0.3, bodyLineHeight: 1.6,
  },
});

export const DARK: PublicMenuTheme = createPreset({
  id: 'dark',
  nameKey: 'publicMenu.themes.dark',
  descriptionKey: 'publicMenu.themes.darkDesc',
  colors: {
    background: '#0d0d0d', surface: '#1a1a1a', text: '#f0f0f0',
    textSecondary: '#999999', accent: '#ff6b35', border: '#333333',
    divider: '#2a2a2a',
  },
  typography: {
    headingFont: '"Inter", "Segoe UI", sans-serif',
    bodyFont: '"Inter", "Segoe UI", sans-serif',
    titleWeight: '700', categoryWeight: '600',
    itemNameWeight: '500', priceWeight: '600',
    headingLetterSpacing: 0.5, bodyLetterSpacing: 0.1, bodyLineHeight: 1.5,
  },
});

export const COASTAL: PublicMenuTheme = createPreset({
  id: 'coastal',
  nameKey: 'publicMenu.themes.coastal',
  descriptionKey: 'publicMenu.themes.coastalDesc',
  colors: {
    background: '#f0f8ff', surface: '#ffffff', text: '#1a3a4a',
    textSecondary: '#5a7a8a', accent: '#0077b6', border: '#b8dbe8',
    divider: '#d4eaf5',
  },
  typography: {
    headingFont: '"Merriweather", Georgia, serif',
    bodyFont: '"Open Sans", "Segoe UI", sans-serif',
    titleWeight: '700', categoryWeight: '700',
    itemNameWeight: '400', priceWeight: '600',
    headingLetterSpacing: 0.5, bodyLetterSpacing: 0.2, bodyLineHeight: 1.55,
  },
});

export const WARM: PublicMenuTheme = createPreset({
  id: 'warm',
  nameKey: 'publicMenu.themes.warm',
  descriptionKey: 'publicMenu.themes.warmDesc',
  colors: {
    background: '#fff5f0', surface: '#fff0e8', text: '#3d1e0e',
    textSecondary: '#8a6050', accent: '#d4380d', border: '#f0c8b0',
    divider: '#f5d9c8',
  },
  typography: {
    headingFont: '"Lora", Georgia, serif',
    bodyFont: '"Nunito", "Segoe UI", sans-serif',
    titleWeight: '700', categoryWeight: '600',
    itemNameWeight: '500', priceWeight: '700',
    headingLetterSpacing: 0.5, bodyLetterSpacing: 0.1, bodyLineHeight: 1.55,
  },
});

export const BOTANICAL: PublicMenuTheme = createPreset({
  id: 'botanical',
  nameKey: 'publicMenu.themes.botanical',
  descriptionKey: 'publicMenu.themes.botanicalDesc',
  colors: {
    background: '#f4f7f0', surface: '#ffffff', text: '#2d3b2d',
    textSecondary: '#6a7d6a', accent: '#2e7d32', border: '#c8dac5',
    divider: '#dde8da',
  },
  typography: {
    headingFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Lato", "Segoe UI", sans-serif',
    titleWeight: '600', categoryWeight: '600',
    itemNameWeight: '400', priceWeight: '500',
    headingLetterSpacing: 1, bodyLetterSpacing: 0.2, bodyLineHeight: 1.6,
  },
});

export const MIDNIGHT: PublicMenuTheme = createPreset({
  id: 'midnight',
  nameKey: 'publicMenu.themes.midnight',
  descriptionKey: 'publicMenu.themes.midnightDesc',
  colors: {
    background: '#0f0f23', surface: '#1a1a3e', text: '#e8e8f0',
    textSecondary: '#9898c8', accent: '#7c5cbf', border: '#2a2a5a',
    divider: '#222250',
  },
  typography: {
    headingFont: '"Raleway", "Segoe UI", sans-serif',
    bodyFont: '"Nunito Sans", "Segoe UI", sans-serif',
    titleWeight: '300', categoryWeight: '400',
    itemNameWeight: '400', priceWeight: '600',
    headingLetterSpacing: 3, bodyLetterSpacing: 0.3, bodyLineHeight: 1.6,
  },
  spacing: {
    pagePadding: 24, sectionGap: 36, itemGap: 14,
    cardPadding: 18, headerPadding: 32,
  },
});
