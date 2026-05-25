/**
 * Unit tests for useDarkMode hook.
 * Focuses on logic: preference persistence, system detection, effective mode resolution.
 */
import { renderHook, act } from '@testing-library/react-native';

import {
  useDarkMode,
  readStoredPreference,
  writePreference,
  resolveEffectiveMode,
  isDarkModePreference,
} from './useDarkMode';
import { STORAGE_KEYS } from '../../shared/constants';
import DarkModePreference from '../../shared/enums/DarkModePreference';
import ThemeMode from '../../shared/enums/ThemeMode';


// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mock matchMedia
// ---------------------------------------------------------------------------

let mockMatchesValue = false;
let mediaChangeHandler: ((e: { matches: boolean }) => void) | null = null;

Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: mockMatchesValue,
    addEventListener: jest.fn(
      (_event: string, handler: (e: { matches: boolean }) => void) => {
        mediaChangeHandler = handler;
      },
    ),
    removeEventListener: jest.fn(() => {
      mediaChangeHandler = null;
    }),
  })),
});

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  mockMatchesValue = false;
  mediaChangeHandler = null;
});

// ---------------------------------------------------------------------------
// Pure function tests
// ---------------------------------------------------------------------------

describe('isDarkModePreference', () => {
  it('returns true for valid preferences', () => {
    expect(isDarkModePreference('light')).toBe(true);
    expect(isDarkModePreference('dark')).toBe(true);
    expect(isDarkModePreference('system')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isDarkModePreference('auto')).toBe(false);
    expect(isDarkModePreference('')).toBe(false);
    expect(isDarkModePreference(null)).toBe(false);
    expect(isDarkModePreference(undefined)).toBe(false);
  });
});

describe('resolveEffectiveMode', () => {
  it('returns Light for Light preference regardless of system', () => {
    expect(resolveEffectiveMode(DarkModePreference.Light, true)).toBe(ThemeMode.Light);
    expect(resolveEffectiveMode(DarkModePreference.Light, false)).toBe(ThemeMode.Light);
  });

  it('returns Dark for Dark preference regardless of system', () => {
    expect(resolveEffectiveMode(DarkModePreference.Dark, true)).toBe(ThemeMode.Dark);
    expect(resolveEffectiveMode(DarkModePreference.Dark, false)).toBe(ThemeMode.Dark);
  });

  it('returns Dark for System preference when system is dark', () => {
    expect(resolveEffectiveMode(DarkModePreference.System, true)).toBe(ThemeMode.Dark);
  });

  it('returns Light for System preference when system is light', () => {
    expect(resolveEffectiveMode(DarkModePreference.System, false)).toBe(ThemeMode.Light);
  });
});

describe('readStoredPreference', () => {
  it('returns System when no value stored', () => {
    expect(readStoredPreference()).toBe(DarkModePreference.System);
  });

  it('returns stored valid preference', () => {
    localStorageMock.setItem(STORAGE_KEYS.DARK_MODE_PREFERENCE, 'dark');
    expect(readStoredPreference()).toBe(DarkModePreference.Dark);
  });

  it('returns System for invalid stored value', () => {
    localStorageMock.setItem(STORAGE_KEYS.DARK_MODE_PREFERENCE, 'invalid');
    expect(readStoredPreference()).toBe(DarkModePreference.System);
  });
});

describe('writePreference', () => {
  it('writes preference to localStorage', () => {
    writePreference(DarkModePreference.Dark);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.DARK_MODE_PREFERENCE,
      'dark',
    );
  });
});

// ---------------------------------------------------------------------------
// Hook tests
// ---------------------------------------------------------------------------

describe('useDarkMode hook', () => {
  it('defaults to System preference with Light effective mode', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.preference).toBe(DarkModePreference.System);
    expect(result.current.effectiveMode).toBe(ThemeMode.Light);
  });

  it('reads stored preference on mount', () => {
    localStorageMock.setItem(STORAGE_KEYS.DARK_MODE_PREFERENCE, 'dark');

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.preference).toBe(DarkModePreference.Dark);
    expect(result.current.effectiveMode).toBe(ThemeMode.Dark);
  });

  it('setPreference updates preference and persists', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setPreference(DarkModePreference.Dark);
    });

    expect(result.current.preference).toBe(DarkModePreference.Dark);
    expect(result.current.effectiveMode).toBe(ThemeMode.Dark);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.DARK_MODE_PREFERENCE,
      'dark',
    );
  });

  it('setPreference to Light gives Light effective mode', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setPreference(DarkModePreference.Light);
    });

    expect(result.current.effectiveMode).toBe(ThemeMode.Light);
  });

  it('System preference follows OS dark mode', () => {
    mockMatchesValue = true;
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.preference).toBe(DarkModePreference.System);
    expect(result.current.effectiveMode).toBe(ThemeMode.Dark);
  });

  it('responds to OS color scheme changes in System mode', () => {
    const { result } = renderHook(() => useDarkMode());

    expect(result.current.effectiveMode).toBe(ThemeMode.Light);

    // Simulate OS switching to dark mode
    act(() => {
      mediaChangeHandler?.({ matches: true });
    });

    expect(result.current.effectiveMode).toBe(ThemeMode.Dark);
  });

  it('ignores OS changes when preference is explicitly Light', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setPreference(DarkModePreference.Light);
    });

    // Simulate OS switching to dark mode
    act(() => {
      mediaChangeHandler?.({ matches: true });
    });

    expect(result.current.effectiveMode).toBe(ThemeMode.Light);
  });

  it('ignores OS changes when preference is explicitly Dark', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.setPreference(DarkModePreference.Dark);
    });

    // Simulate OS switching to light mode
    act(() => {
      mediaChangeHandler?.({ matches: false });
    });

    expect(result.current.effectiveMode).toBe(ThemeMode.Dark);
  });
});
