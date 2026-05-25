/**
 * Unit tests for useFormThemeVars hook.
 *
 * Tests the mapping from useTheme() colors to CSS custom properties.
 * Focuses on logic: correct property names and values derived from theme.
 */
import { renderHook } from '@testing-library/react-native';

import { useFormThemeVars } from './useFormThemeVars';

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_COLORS = {
  text: '#001219',
  textSecondary: '#555555',
  background: '#ffffff',
  surface: '#f7f7f7',
  surfaceElevated: '#ffffff',
  border: '#e6e6e6',
  divider: '#eeeeee',
};

const MOCK_PALETTE = {
  primary: { '50': '#e0f7fa', '100': '#b2ebf2', '200': '#80deea', '300': '#4dd0e1', '400': '#26c6da', '500': '#005f73', '600': '#00838f', '700': '#004d5a', '800': '#003d47', '900': '#002d34' },
  secondary: { '50': '#e8f5e9', '100': '#c8e6c9', '200': '#a5d6a7', '300': '#81c784', '400': '#66bb6a', '500': '#94d2bd', '600': '#388e3c', '700': '#2e7d32', '800': '#1b5e20', '900': '#0d3b15' },
  accent: { '50': '#fff8e1', '100': '#ffecb3', '200': '#ffe082', '300': '#ffd54f', '400': '#ffca28', '500': '#ee9b00', '600': '#ffb300', '700': '#ffa000', '800': '#ff8f00', '900': '#ff6f00' },
};

const MOCK_SEMANTIC = {
  success: { '50': '#e8f5e9', '100': '#c8e6c9', '200': '#a5d6a7', '300': '#81c784', '400': '#66bb6a', '500': '#2d6a4f', '600': '#388e3c', '700': '#2e7d32', '800': '#1b5e20', '900': '#0d3b15' },
  warning: { '50': '#fff3e0', '100': '#ffe0b2', '200': '#ffcc80', '300': '#ffb74d', '400': '#ffa726', '500': '#ee9b00', '600': '#fb8c00', '700': '#f57c00', '800': '#ef6c00', '900': '#e65100' },
  error: { '50': '#fbe9e7', '100': '#ffccbc', '200': '#ffab91', '300': '#ff8a65', '400': '#ff7043', '500': '#ae2012', '600': '#f4511e', '700': '#e64a19', '800': '#d84315', '900': '#bf360c' },
  info: { '50': '#e3f2fd', '100': '#bbdefb', '200': '#90caf9', '300': '#64b5f6', '400': '#42a5f5', '500': '#005f73', '600': '#1e88e5', '700': '#1976d2', '800': '#1565c0', '900': '#0d47a1' },
};

jest.mock('../../../theme/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: MOCK_COLORS,
      palette: MOCK_PALETTE,
      semantic: MOCK_SEMANTIC,
    },
    mode: 'light',
  }),
}));

// =============================================================================
// Tests
// =============================================================================

describe('useFormThemeVars', () => {
  it('maps theme background color to --form-background CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-background']).toBe(MOCK_COLORS.background);
  });

  it('maps theme surface color to --form-surface CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-surface']).toBe(MOCK_COLORS.surface);
  });

  it('maps theme border color to --form-border CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-border']).toBe(MOCK_COLORS.border);
  });

  it('maps primary 500 to --form-border-focus for focus states', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-border-focus']).toBe(MOCK_PALETTE.primary['500']);
  });

  it('maps theme text color to --form-text CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-text']).toBe(MOCK_COLORS.text);
  });

  it('maps theme textSecondary to --form-text-secondary CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-text-secondary']).toBe(MOCK_COLORS.textSecondary);
  });

  it('maps semantic error 500 to --form-error CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-error']).toBe(MOCK_SEMANTIC.error['500']);
  });

  it('maps primary 500 to --form-primary CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-primary']).toBe(MOCK_PALETTE.primary['500']);
  });

  it('maps primary 700 to --form-primary-hover CSS variable', () => {
    const { result } = renderHook(() => useFormThemeVars());
    const vars = result.current.style as Record<string, string | undefined>;
    expect(vars['--form-primary-hover']).toBe(MOCK_PALETTE.primary['700']);
  });

  it('returns a stable reference when theme values have not changed', () => {
    const { result, rerender } = renderHook(() => useFormThemeVars());
    const firstStyle = result.current.style;
    rerender({});
    expect(result.current.style).toBe(firstStyle);
  });
});
