import { Platform } from 'react-native';

import { act, renderHook } from '@testing-library/react-native';

import { useHighContrast } from './useHighContrast';

describe('useHighContrast', () => {
  const originalPlatformOS = Platform.OS;
  let listeners: Map<string, (e: MediaQueryListEvent) => void>;
  let matchesValue: boolean;

  beforeEach(() => {
    listeners = new Map();
    matchesValue = false;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: matchesValue,
        addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.set(_event, handler);
        },
        removeEventListener: (_event: string, _handler: (e: MediaQueryListEvent) => void) => {
          listeners.delete(_event);
        },
      })),
    });
  });

  afterEach(() => {
     
    (Platform as { OS: string }).OS = originalPlatformOS;
  });

  it('returns false on non-web platforms', () => {
     
    (Platform as { OS: string }).OS = 'ios';

    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(false);
  });

  it('returns false when high contrast is not active on web', () => {
     
    (Platform as { OS: string }).OS = 'web';
    matchesValue = false;

    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(false);
  });

  it('returns true when high contrast is active on web', () => {
     
    (Platform as { OS: string }).OS = 'web';
    matchesValue = true;

    // Re-mock to return true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: (_event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.set(_event, handler);
        },
        removeEventListener: (_event: string, _handler: (e: MediaQueryListEvent) => void) => {
          listeners.delete(_event);
        },
      })),
    });

    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
     
    (Platform as { OS: string }).OS = 'web';

    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(false);

    const changeHandler = listeners.get('change');
    expect(changeHandler).toBeDefined();

    act(() => {
      changeHandler?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
     
    (Platform as { OS: string }).OS = 'web';

    const { unmount } = renderHook(() => useHighContrast());
    expect(listeners.has('change')).toBe(true);

    unmount();
    expect(listeners.has('change')).toBe(false);
  });
});
