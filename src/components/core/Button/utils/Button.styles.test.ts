/**
 * Unit tests for the Button style builder.
 *
 * Tests the pure function buildButtonStyles -- no rendering needed.
 * Verifies that variant + size combinations produce correct style properties.
 */
import { buildButtonStyles, DISABLED_OPACITY } from './Button.styles';
import ButtonSize from './ButtonSize';
import ButtonVariant from './ButtonVariant';

import type { ResolvedTheme } from '../../../../theme/types';

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------

const MOCK_THEME: ResolvedTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#001219',
    textSecondary: '#777777',
    border: '#e6e6e6',
    divider: '#e5e7eb',
  },
  palette: {
    primary: {
      '50': '#e6f3f5', '100': '#bfe0e6', '200': '#99cdd6',
      '300': '#73bac7', '400': '#4da7b7', '500': '#005f73',
      '600': '#004f60', '700': '#003f4d', '800': '#002f3a',
      '900': '#001f27',
    },
    secondary: {
      '50': '#f0faf6', '100': '#d6f0e6', '200': '#bce6d6',
      '300': '#a2dcc6', '400': '#88d2b6', '500': '#94d2bd',
      '600': '#7ab8a3', '700': '#609e89', '800': '#46846f',
      '900': '#2c6a55',
    },
    accent: {
      '50': '#e6f5ee', '100': '#bfe6d3', '200': '#99d6b8',
      '300': '#73c69d', '400': '#4db682', '500': '#008d5c',
      '600': '#00764d', '700': '#005f3e', '800': '#00482f',
      '900': '#003120',
    },
  },
  semantic: {
    success: {
      '50': '#e6f5f5', '100': '#bfe6e6', '200': '#99d6d6',
      '300': '#73c6c6', '400': '#4db6b6', '500': '#0a9396',
      '600': '#087b7d', '700': '#066364', '800': '#044b4b',
      '900': '#023332',
    },
    warning: {
      '50': '#fff8e1', '100': '#ffecb3', '200': '#ffe082',
      '300': '#ffd54f', '400': '#ffca28', '500': '#ffc107',
      '600': '#ffb300', '700': '#ffa000', '800': '#ff8f00',
      '900': '#ff6f00',
    },
    error: {
      '50': '#fbe9e7', '100': '#ffccbc', '200': '#ffab91',
      '300': '#ff8a65', '400': '#ff7043', '500': '#ae2012',
      '600': '#921a0f', '700': '#76140c', '800': '#5a0e09',
      '900': '#3e0806',
    },
    info: {
      '50': '#e3f2fd', '100': '#bbdefb', '200': '#90caf9',
      '300': '#64b5f6', '400': '#42a5f5', '500': '#2196f3',
      '600': '#1e88e5', '700': '#1976d2', '800': '#1565c0',
      '900': '#0d47a1',
    },
  },
  typography: { fontFamily: 'System', headingScale: 1.0 },
  mode: 'light' as ResolvedTheme['mode'],
  branding: { logoUrl: null, faviconUrl: null },
};

const TEXT_ON_FILLED = '#ffffff';
const SM_HEIGHT = 32;
const MD_HEIGHT = 44;
const LG_HEIGHT = 52;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildButtonStyles', () => {
  describe('variant colors', () => {
    it('uses primary palette 500 as background for primary variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Primary, ButtonSize.Medium);
      expect(result.container.backgroundColor).toBe(MOCK_THEME.palette.primary['500']);
    });

    it('uses surface as background for secondary variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Secondary, ButtonSize.Medium);
      expect(result.container.backgroundColor).toBe(MOCK_THEME.colors.surface);
    });

    it('uses transparent background for outline variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Outline, ButtonSize.Medium);
      expect(result.container.backgroundColor).toBe('transparent');
    });

    it('uses transparent background for ghost variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Ghost, ButtonSize.Medium);
      expect(result.container.backgroundColor).toBe('transparent');
    });

    it('uses semantic error 500 as background for danger variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Danger, ButtonSize.Medium);
      expect(result.container.backgroundColor).toBe(MOCK_THEME.semantic.error['500']);
    });

    it('uses white text on primary variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Primary, ButtonSize.Medium);
      expect(result.text.color).toBe(TEXT_ON_FILLED);
    });

    it('uses theme text color for secondary variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Secondary, ButtonSize.Medium);
      expect(result.text.color).toBe(MOCK_THEME.colors.text);
    });

    it('uses primary palette color for outline text', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Outline, ButtonSize.Medium);
      expect(result.text.color).toBe(MOCK_THEME.palette.primary['500']);
    });

    it('uses primary palette color for ghost text', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Ghost, ButtonSize.Medium);
      expect(result.text.color).toBe(MOCK_THEME.palette.primary['500']);
    });

    it('uses white text on danger variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Danger, ButtonSize.Medium);
      expect(result.text.color).toBe(TEXT_ON_FILLED);
    });
  });

  describe('size dimensions', () => {
    it('sets minHeight to 32 for small size', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Primary, ButtonSize.Small);
      expect(result.container.minHeight).toBe(SM_HEIGHT);
    });

    it('sets minHeight to 44 for medium size (WCAG 2.5.5)', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Primary, ButtonSize.Medium);
      expect(result.container.minHeight).toBe(MD_HEIGHT);
    });

    it('sets minHeight to 52 for large size', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Primary, ButtonSize.Large);
      expect(result.container.minHeight).toBe(LG_HEIGHT);
    });
  });

  describe('icon color', () => {
    it('returns white icon color for primary variant', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Primary, ButtonSize.Medium);
      expect(result.iconColor).toBe(TEXT_ON_FILLED);
    });

    it('returns theme text color for secondary variant icon', () => {
      const result = buildButtonStyles(MOCK_THEME, ButtonVariant.Secondary, ButtonSize.Medium);
      expect(result.iconColor).toBe(MOCK_THEME.colors.text);
    });
  });

  describe('exports', () => {
    it('exports DISABLED_OPACITY constant', () => {
      expect(DISABLED_OPACITY).toBe(0.5);
    });
  });
});
