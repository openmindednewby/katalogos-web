/**
 * Tests for ThemeProvider, useTheme, and backwards-compatible useThemeColors.
 *
 * Focuses on logic: mode toggling, config overrides, context availability,
 * and Redux synchronization. Does not test rendering/visual output.
 */
import type { ReactNode } from 'react';

import { renderHook, act } from '@testing-library/react-native';

import DarkModePreference from '../../shared/enums/DarkModePreference';
import ThemeMode from '../../shared/enums/ThemeMode';
import { DEFAULT_THEME_CONFIG } from '../presets';
import ThemeProvider from './ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import { useThemeColors } from '../utils/hooks';
import { resolveTheme } from '../utils/resolveTheme';
import { ThemeContext } from '../utils/ThemeContext';

import type { TenantThemeConfig } from '../types';
import type { ThemeContextValue } from '../utils/ThemeContext';

// -- Mocks -------------------------------------------------------------------

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useSelector: (selector: (state: { ui: { theme: string } }) => unknown) =>
    selector({ ui: { theme: 'light' } }),
  useDispatch: () => mockDispatch,
}));

// Mock localStorage for useDarkMode
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia for useDarkMode
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

// -- Test helpers ------------------------------------------------------------

function createWrapper(config?: TenantThemeConfig | null): ({ children }: { children: ReactNode }) => ReactNode {
  const Wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <ThemeProvider tenantThemeConfig={config}>
      {children}
    </ThemeProvider>
  );
  return Wrapper;
}

const OCEAN_CONFIG: TenantThemeConfig = {
  primary: '#1e3a5f',
  secondary: '#7ec8e3',
  accent: '#f39c12',
  light: {
    background: '#f0f8ff',
    surface: '#e6f2ff',
    surfaceElevated: '#ffffff',
    text: '#1a1a2e',
    textSecondary: '#6b7280',
    border: '#d1d5db',
    divider: '#e5e7eb',
  },
  dark: {
    background: '#0a1628',
    surface: '#162032',
    surfaceElevated: '#1e2d42',
    text: '#e0e7ff',
    textSecondary: '#9ca3af',
    border: '#374151',
    divider: '#374151',
  },
  branding: {
    logoContentId: null,
    faviconContentId: null,
    presetId: 'ocean',
  },
};

// -- Tests -------------------------------------------------------------------

describe('ThemeProvider + useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockDispatch.mockClear();
  });

  it('provides a ResolvedTheme with correct structure', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    const { theme } = result.current;
    expect(theme.colors).toBeDefined();
    expect(theme.palette.primary).toBeDefined();
    expect(theme.palette.secondary).toBeDefined();
    expect(theme.palette.accent).toBeDefined();
    expect(theme.semantic.success).toBeDefined();
    expect(theme.semantic.warning).toBeDefined();
    expect(theme.semantic.error).toBeDefined();
    expect(theme.semantic.info).toBeDefined();
    expect(theme.typography.fontFamily).toBeDefined();
    expect(theme.branding).toBeDefined();
  });

  it('uses default config when no tenantThemeConfig is provided', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    const expected = resolveTheme(null, ThemeMode.Light);
    expect(result.current.theme).toEqual(expected);
  });

  it('applies custom tenantThemeConfig when provided', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(OCEAN_CONFIG),
    });

    const expected = resolveTheme(OCEAN_CONFIG, ThemeMode.Light);
    expect(result.current.theme).toEqual(expected);
    expect(result.current.theme.colors.background).toBe(OCEAN_CONFIG.light.background);
  });

  it('defaults to System preference with Light effective mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.darkModePreference).toBe(DarkModePreference.System);
    expect(result.current.mode).toBe(ThemeMode.Light);
  });

  it('toggleMode switches between light and dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.mode).toBe(ThemeMode.Light);

    act(() => { result.current.toggleMode(); });
    expect(result.current.mode).toBe(ThemeMode.Dark);

    act(() => { result.current.toggleMode(); });
    expect(result.current.mode).toBe(ThemeMode.Light);
  });

  it('setMode sets a specific mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    act(() => { result.current.setMode(ThemeMode.Dark); });
    expect(result.current.mode).toBe(ThemeMode.Dark);
  });

  it('dispatches setTheme to Redux when mode changes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    act(() => { result.current.toggleMode(); });

    const themeActions = mockDispatch.mock.calls
      .map((call) => call[0] as { type: string; payload: string } | undefined)
      .filter((action) => action?.type === 'ui/setTheme');

    const lastAction = themeActions[themeActions.length - 1];
    expect(lastAction?.payload).toBe(ThemeMode.Dark);
  });

  it('setTenantConfig updates the resolved theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    const defaultTheme = result.current.theme;

    act(() => { result.current.setTenantConfig(OCEAN_CONFIG); });

    expect(result.current.theme).not.toEqual(defaultTheme);
    expect(result.current.theme.colors.background).toBe(OCEAN_CONFIG.light.background);
  });

  it('setTenantConfig(null) reverts to default config', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper(OCEAN_CONFIG),
    });

    act(() => { result.current.setTenantConfig(null); });

    const expected = resolveTheme(null, ThemeMode.Light);
    expect(result.current.theme).toEqual(expected);
  });

  it('resolves dark mode colors when mode is dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    act(() => { result.current.setMode(ThemeMode.Dark); });

    expect(result.current.theme.colors).toEqual(DEFAULT_THEME_CONFIG.dark);
    expect(result.current.theme.mode).toBe(ThemeMode.Dark);
  });

  it('exposes darkModePreference and setDarkModePreference', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.darkModePreference).toBeDefined();
    expect(result.current.setDarkModePreference).toBeDefined();

    act(() => { result.current.setDarkModePreference(DarkModePreference.Dark); });

    expect(result.current.darkModePreference).toBe(DarkModePreference.Dark);
    expect(result.current.mode).toBe(ThemeMode.Dark);
  });

  it('throws when useTheme is called outside ThemeProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});

describe('useThemeColors backwards compatibility', () => {
  it('returns a value when ThemeContext is available', () => {
    const contextValue: ThemeContextValue = {
      theme: resolveTheme(null, ThemeMode.Light),
      mode: ThemeMode.Light,
      toggleMode: jest.fn(),
      setMode: jest.fn(),
      setTenantConfig: jest.fn(),
      setBrandingUrls: jest.fn(),
      darkModePreference: DarkModePreference.System,
      setDarkModePreference: jest.fn(),
    };

    const Wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    );

    const { result } = renderHook(() => useThemeColors(), { wrapper: Wrapper });
    expect(result.current).toBeDefined();
  });
});
