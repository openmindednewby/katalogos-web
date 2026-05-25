/**
 * Tests for usePublicMenuLanguage hook and utility functions.
 * Focuses on logic: browser language detection, locale extraction,
 * URL persistence, RTL detection, and state management.
 */
import { renderHook, act } from '@testing-library/react-native';

import {
  extractBaseLocale,
  detectBrowserLanguage,
  isRtlLanguage,
  getUrlLanguageParam,
  setUrlLanguageParam,
  resolveLanguage,
  usePublicMenuLanguage,
} from './usePublicMenuLanguage';

describe('extractBaseLocale', () => {
  it('extracts base code from a full BCP 47 locale', () => {
    expect(extractBaseLocale('es-MX')).toBe('es');
    expect(extractBaseLocale('en-US')).toBe('en');
    expect(extractBaseLocale('zh-Hans-CN')).toBe('zh');
  });

  it('returns the code as-is when no region is present', () => {
    expect(extractBaseLocale('fr')).toBe('fr');
    expect(extractBaseLocale('de')).toBe('de');
  });

  it('lowercases the result', () => {
    expect(extractBaseLocale('EN-US')).toBe('en');
    expect(extractBaseLocale('FR')).toBe('fr');
  });

  it('returns empty string for empty input', () => {
    expect(extractBaseLocale('')).toBe('');
  });
});

describe('detectBrowserLanguage', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true });
  });

  it('extracts base language from navigator.language', () => {
    Object.defineProperty(global, 'navigator', {
      value: { language: 'es-MX' },
      writable: true,
    });
    expect(detectBrowserLanguage()).toBe('es');
  });

  it('returns empty string when navigator is undefined', () => {
    Object.defineProperty(global, 'navigator', { value: undefined, writable: true });
    expect(detectBrowserLanguage()).toBe('');
  });
});

describe('isRtlLanguage', () => {
  it('returns true for RTL languages', () => {
    expect(isRtlLanguage('ar')).toBe(true);
    expect(isRtlLanguage('he')).toBe(true);
    expect(isRtlLanguage('fa')).toBe(true);
    expect(isRtlLanguage('ur')).toBe(true);
  });

  it('returns false for LTR languages', () => {
    expect(isRtlLanguage('en')).toBe(false);
    expect(isRtlLanguage('es')).toBe(false);
    expect(isRtlLanguage('fr')).toBe(false);
    expect(isRtlLanguage('zh')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isRtlLanguage('')).toBe(false);
  });
});

describe('resolveLanguage', () => {
  it('prefers URL param when available', () => {
    expect(resolveLanguage(['es', 'fr'], 'fr', 'es')).toBe('fr');
  });

  it('falls back to browser language when URL param is empty', () => {
    expect(resolveLanguage(['es', 'fr'], '', 'es')).toBe('es');
  });

  it('falls back to browser language when URL param is not available', () => {
    expect(resolveLanguage(['es', 'fr'], 'ja', 'es')).toBe('es');
  });

  it('returns empty when neither URL nor browser language is available', () => {
    expect(resolveLanguage(['fr', 'de'], '', 'ja')).toBe('');
  });

  it('returns empty for empty available languages', () => {
    expect(resolveLanguage([], 'fr', 'es')).toBe('');
  });
});

describe('getUrlLanguageParam', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
  });

  it('returns empty string when window is undefined', () => {
    Object.defineProperty(global, 'window', { value: undefined, writable: true });
    expect(getUrlLanguageParam()).toBe('');
  });

  it('returns the lang param value from the URL', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '?lang=fr', href: 'http://example.com?lang=fr' } },
      writable: true,
    });
    expect(getUrlLanguageParam()).toBe('fr');
  });

  it('returns empty string when lang param is absent', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '', href: 'http://example.com' } },
      writable: true,
    });
    expect(getUrlLanguageParam()).toBe('');
  });
});

describe('setUrlLanguageParam', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
  });

  it('does nothing when window is undefined', () => {
    Object.defineProperty(global, 'window', { value: undefined, writable: true });
    expect(() => { setUrlLanguageParam('fr'); }).not.toThrow();
  });

  it('sets lang param in the URL', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '', href: 'http://example.com/menu/123' },
        history: { replaceState: replaceStateSpy },
      },
      writable: true,
    });
    setUrlLanguageParam('es');
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', 'http://example.com/menu/123?lang=es');
  });

  it('removes lang param when code is empty', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?lang=fr', href: 'http://example.com/menu/123?lang=fr' },
        history: { replaceState: replaceStateSpy },
      },
      writable: true,
    });
    setUrlLanguageParam('');
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', 'http://example.com/menu/123');
  });
});

describe('usePublicMenuLanguage', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: { language: 'es-MX' },
      writable: true,
    });
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '', href: 'http://example.com/menu/123' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', { value: originalNavigator, writable: true });
    Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
  });

  it('auto-selects the browser language when available', () => {
    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr', 'de']));
    expect(result.current.currentLanguage).toBe('es');
    expect(result.current.detectedLanguage).toBe('es');
  });

  it('returns empty string when browser language is not available', () => {
    const { result } = renderHook(() => usePublicMenuLanguage(['fr', 'de']));
    expect(result.current.currentLanguage).toBe('');
  });

  it('starts empty and resolves when availableLanguages arrives', () => {
    const { result, rerender } = renderHook(
      ({ langs }: { langs: string[] }) => usePublicMenuLanguage(langs),
      { initialProps: { langs: [] } },
    );
    expect(result.current.currentLanguage).toBe('');

    rerender({ langs: ['es', 'fr'] });
    expect(result.current.currentLanguage).toBe('es');
  });

  it('allows manual language switching', () => {
    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr', 'de']));
    expect(result.current.currentLanguage).toBe('es');

    act(() => { result.current.setLanguage('fr'); });
    expect(result.current.currentLanguage).toBe('fr');
  });

  it('allows reverting to original language', () => {
    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr']));
    act(() => { result.current.setLanguage('fr'); });
    expect(result.current.currentLanguage).toBe('fr');

    act(() => { result.current.setLanguage(''); });
    expect(result.current.currentLanguage).toBe('');
  });

  it('does not auto-reset after manual selection', () => {
    const { result, rerender } = renderHook(
      ({ langs }: { langs: string[] }) => usePublicMenuLanguage(langs),
      { initialProps: { langs: ['es', 'fr'] } },
    );

    act(() => { result.current.setLanguage('fr'); });
    expect(result.current.currentLanguage).toBe('fr');

    // Simulate re-render with same languages
    rerender({ langs: ['es', 'fr'] });
    expect(result.current.currentLanguage).toBe('fr');
  });

  it('prefers URL param over browser language', () => {
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?lang=fr', href: 'http://example.com/menu/123?lang=fr' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr', 'de']));
    expect(result.current.currentLanguage).toBe('fr');
  });

  it('ignores URL param when language is not available', () => {
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?lang=ja', href: 'http://example.com/menu/123?lang=ja' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr']));
    expect(result.current.currentLanguage).toBe('es');
  });

  it('updates the URL when language is switched', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '', href: 'http://example.com/menu/123' },
        history: { replaceState: replaceStateSpy },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr']));
    act(() => { result.current.setLanguage('fr'); });

    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', 'http://example.com/menu/123?lang=fr');
  });

  it('returns isRtl true for Arabic', () => {
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?lang=ar', href: 'http://example.com/menu/123?lang=ar' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLanguage(['ar', 'en']));
    expect(result.current.currentLanguage).toBe('ar');
    expect(result.current.isRtl).toBe(true);
  });

  it('returns isRtl false for LTR languages', () => {
    const { result } = renderHook(() => usePublicMenuLanguage(['es', 'fr']));
    expect(result.current.isRtl).toBe(false);
  });
});
