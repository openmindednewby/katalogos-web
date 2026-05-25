/**
 * Light-background public menu theme presets.
 * Split from publicMenuThemePresets.ts to stay under 200 lines.
 */
import { createPreset } from './createPreset';

import type { PublicMenuTheme } from './publicMenuThemeTypes';

export const MINIMAL: PublicMenuTheme = createPreset({
  id: 'minimal',
  nameKey: 'publicMenu.themes.minimal',
  descriptionKey: 'publicMenu.themes.minimalDesc',
  colors: {
    background: '#ffffff', surface: '#fafafa', text: '#111111',
    textSecondary: '#888888', accent: '#111111', border: '#e8e8e8',
    divider: '#f0f0f0',
  },
  typography: {
    headingFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    bodyFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    titleWeight: '300', categoryWeight: '400',
    itemNameWeight: '400', priceWeight: '400',
    headingLetterSpacing: 2, bodyLetterSpacing: 0.3, bodyLineHeight: 1.6,
  },
  spacing: {
    pagePadding: 24, sectionGap: 40, itemGap: 16,
    cardPadding: 16, headerPadding: 32,
  },
  borders: {
    cardRadius: 0, cardBorderWidth: 0,
    showCategoryDividers: true, dividerWidth: 1,
  },
});

export const MODERN: PublicMenuTheme = createPreset({
  id: 'modern',
  nameKey: 'publicMenu.themes.modern',
  descriptionKey: 'publicMenu.themes.modernDesc',
  colors: {
    background: '#f5f5f7', surface: '#ffffff', text: '#1d1d1f',
    textSecondary: '#6e6e73', accent: '#0071e3', border: '#e5e5ea',
    divider: '#ebebf0',
  },
  typography: {
    headingFont: '"SF Pro Display", -apple-system, "Segoe UI", sans-serif',
    bodyFont: '"SF Pro Text", -apple-system, "Segoe UI", sans-serif',
    titleWeight: '700', categoryWeight: '600',
    itemNameWeight: '500', priceWeight: '600',
    headingLetterSpacing: -0.5, bodyLetterSpacing: 0, bodyLineHeight: 1.5,
  },
  borders: {
    cardRadius: 12, cardBorderWidth: 0,
    showCategoryDividers: false, dividerWidth: 0,
  },
});

export const FRESH: PublicMenuTheme = createPreset({
  id: 'fresh',
  nameKey: 'publicMenu.themes.fresh',
  descriptionKey: 'publicMenu.themes.freshDesc',
  colors: {
    background: '#f8fdf5', surface: '#ffffff', text: '#2d3a2d',
    textSecondary: '#6b7c6b', accent: '#4a9d4a', border: '#d4e8d0',
    divider: '#e2f0de',
  },
  typography: {
    headingFont: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    bodyFont: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    titleWeight: '700', categoryWeight: '600',
    itemNameWeight: '500', priceWeight: '600',
    headingLetterSpacing: 0.5, bodyLetterSpacing: 0.2, bodyLineHeight: 1.5,
  },
});

export const CLASSIC: PublicMenuTheme = createPreset({
  id: 'classic',
  nameKey: 'publicMenu.themes.classic',
  descriptionKey: 'publicMenu.themes.classicDesc',
  colors: {
    background: '#fffdf7', surface: '#faf6ee', text: '#2c2416',
    textSecondary: '#7a7060', accent: '#6b4226', border: '#d4c8b0',
    divider: '#e0d6c4',
  },
  typography: {
    headingFont: 'Georgia, "Times New Roman", serif',
    bodyFont: '"Garamond", "Times New Roman", serif',
    titleWeight: '700', categoryWeight: '700',
    itemNameWeight: '500', priceWeight: '600',
    headingLetterSpacing: 1, bodyLetterSpacing: 0.3, bodyLineHeight: 1.6,
  },
  borders: {
    cardRadius: 4, cardBorderWidth: 1,
    showCategoryDividers: true, dividerWidth: 1,
  },
});

export const RUSTIC: PublicMenuTheme = createPreset({
  id: 'rustic',
  nameKey: 'publicMenu.themes.rustic',
  descriptionKey: 'publicMenu.themes.rusticDesc',
  colors: {
    background: '#faf5ef', surface: '#f5ede3', text: '#3e2f1c',
    textSecondary: '#7a6a56', accent: '#8b5e3c', border: '#d9c9b4',
    divider: '#e5d7c6',
  },
  typography: {
    headingFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Source Sans Pro", "Segoe UI", sans-serif',
    titleWeight: '700', categoryWeight: '600',
    itemNameWeight: '500', priceWeight: '700',
    headingLetterSpacing: 0.8, bodyLetterSpacing: 0.2, bodyLineHeight: 1.55,
  },
});

export const VIBRANT: PublicMenuTheme = createPreset({
  id: 'vibrant',
  nameKey: 'publicMenu.themes.vibrant',
  descriptionKey: 'publicMenu.themes.vibrantDesc',
  colors: {
    background: '#fff8f0', surface: '#ffffff', text: '#2b2b2b',
    textSecondary: '#666666', accent: '#e85d04', border: '#ffd6a5',
    divider: '#ffe8cc',
  },
  typography: {
    headingFont: '"Poppins", "Segoe UI", sans-serif',
    bodyFont: '"Inter", "Segoe UI", sans-serif',
    titleWeight: '800', categoryWeight: '700',
    itemNameWeight: '600', priceWeight: '700',
    headingLetterSpacing: 0.5, bodyLetterSpacing: 0.1, bodyLineHeight: 1.5,
  },
  borders: {
    cardRadius: 16, cardBorderWidth: 1,
    showCategoryDividers: false, dividerWidth: 0,
  },
});
