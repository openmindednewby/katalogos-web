/**
 * Unit tests for responsive style utilities.
 * Tests font scaling, spacing scaling, and breakpoint detection.
 */
import { PUBLIC_MENU_THEME_PRESETS } from './publicMenuThemePresets';
import {
  buildResponsiveLayout,
  getFontScale,
  getResponsiveFontSizes,
  getResponsiveSpacing,
  getSpacingScale,
} from './responsiveStyles';

import type { PublicMenuSpacing } from './publicMenuThemeTypes';

const BASE_SPACING: PublicMenuSpacing = {
  pagePadding: 20,
  sectionGap: 32,
  itemGap: 12,
  cardPadding: 16,
  headerPadding: 24,
};

describe('getFontScale', () => {
  it('returns 1.0 for phone widths', () => {
    expect(getFontScale(320)).toBe(1.0);
    expect(getFontScale(375)).toBe(1.0);
    expect(getFontScale(480)).toBe(1.0);
  });

  it('returns 1.05 for tablet widths', () => {
    expect(getFontScale(481)).toBe(1.05);
    expect(getFontScale(768)).toBe(1.05);
  });

  it('returns 1.1 for desktop widths', () => {
    expect(getFontScale(769)).toBe(1.1);
    expect(getFontScale(1024)).toBe(1.1);
  });

  it('returns 1.15 for large desktop widths', () => {
    expect(getFontScale(1025)).toBe(1.15);
    expect(getFontScale(1920)).toBe(1.15);
  });
});

describe('getSpacingScale', () => {
  it('returns 1.0 for phone widths', () => {
    expect(getSpacingScale(375)).toBe(1.0);
  });

  it('returns 1.15 for tablet widths', () => {
    expect(getSpacingScale(600)).toBe(1.15);
  });

  it('returns 1.3 for desktop widths', () => {
    expect(getSpacingScale(1024)).toBe(1.3);
  });
});

describe('getResponsiveFontSizes', () => {
  it('returns base sizes for phone width', () => {
    const sizes = getResponsiveFontSizes(375);
    expect(sizes.title).toBe(28);
    expect(sizes.category).toBe(22);
    expect(sizes.itemName).toBe(17);
    expect(sizes.body).toBe(14);
  });

  it('returns scaled sizes for desktop width', () => {
    const sizes = getResponsiveFontSizes(1024);
    expect(sizes.title).toBeGreaterThan(28);
    expect(sizes.category).toBeGreaterThan(22);
  });

  it('returns integer values', () => {
    const sizes = getResponsiveFontSizes(600);
    expect(Number.isInteger(sizes.title)).toBe(true);
    expect(Number.isInteger(sizes.category)).toBe(true);
    expect(Number.isInteger(sizes.itemName)).toBe(true);
    expect(Number.isInteger(sizes.body)).toBe(true);
  });
});

describe('getResponsiveSpacing', () => {
  it('returns base spacing for phone width', () => {
    const spacing = getResponsiveSpacing(BASE_SPACING, 375);
    expect(spacing.pagePadding).toBe(20);
    expect(spacing.sectionGap).toBe(32);
  });

  it('scales spacing up for desktop width', () => {
    const spacing = getResponsiveSpacing(BASE_SPACING, 1024);
    expect(spacing.pagePadding).toBeGreaterThan(20);
    expect(spacing.sectionGap).toBeGreaterThan(32);
  });

  it('returns integer values', () => {
    const spacing = getResponsiveSpacing(BASE_SPACING, 600);
    expect(Number.isInteger(spacing.pagePadding)).toBe(true);
    expect(Number.isInteger(spacing.sectionGap)).toBe(true);
    expect(Number.isInteger(spacing.cardPadding)).toBe(true);
  });
});

describe('buildResponsiveLayout', () => {
  it('sets isPhone=true for phone widths', () => {
    const layout = buildResponsiveLayout(BASE_SPACING, 375);
    expect(layout.isPhone).toBe(true);
    expect(layout.isTablet).toBe(false);
  });

  it('sets isTablet=true for tablet widths', () => {
    const layout = buildResponsiveLayout(BASE_SPACING, 600);
    expect(layout.isPhone).toBe(false);
    expect(layout.isTablet).toBe(true);
  });

  it('sets both false for desktop widths', () => {
    const layout = buildResponsiveLayout(BASE_SPACING, 1200);
    expect(layout.isPhone).toBe(false);
    expect(layout.isTablet).toBe(false);
  });

  it('sets maxWidth=0 for phone (no constraint)', () => {
    const layout = buildResponsiveLayout(BASE_SPACING, 375);
    expect(layout.maxWidth).toBe(0);
  });

  it('sets non-zero maxWidth for tablet and desktop', () => {
    const tabletLayout = buildResponsiveLayout(BASE_SPACING, 600);
    expect(tabletLayout.maxWidth).toBeGreaterThan(0);

    const desktopLayout = buildResponsiveLayout(BASE_SPACING, 1200);
    expect(desktopLayout.maxWidth).toBeGreaterThan(0);
  });

  it('includes fontSizes and spacing in the result', () => {
    const layout = buildResponsiveLayout(BASE_SPACING, 375);
    expect(layout.fontSizes).toBeDefined();
    expect(layout.fontSizes.title).toBeGreaterThan(0);
    expect(layout.spacing).toBeDefined();
    expect(layout.spacing.pagePadding).toBeGreaterThan(0);
  });
});

describe('theme presets have valid spacing', () => {
  it.each(PUBLIC_MENU_THEME_PRESETS.map((p) => [p.id, p]))(
    '%s has positive spacing values',
    (_id, preset) => {
      expect(preset.spacing.pagePadding).toBeGreaterThan(0);
      expect(preset.spacing.sectionGap).toBeGreaterThan(0);
      expect(preset.spacing.itemGap).toBeGreaterThan(0);
      expect(preset.spacing.cardPadding).toBeGreaterThan(0);
      expect(preset.spacing.headerPadding).toBeGreaterThan(0);
    },
  );
});
