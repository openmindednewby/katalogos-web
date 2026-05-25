/**
 * Unit tests for useCookieConsent hook.
 * Focuses on logic: reading/writing localStorage, state transitions.
 */
import { renderHook, act } from '@testing-library/react-native';

import { STORAGE_KEYS } from '../../../shared/constants';
import { CONSENT_VERSION } from '../CookieConsentTypes';
import { useCookieConsent } from './useCookieConsent';

import type { CookieConsent } from '../CookieConsentTypes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('useCookieConsent', () => {
  it('returns showBanner=true when no consent is stored', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(true);
    expect(result.current.consent).toBeNull();
  });

  it('returns showBanner=false when consent exists in localStorage', () => {
    const existing: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: false,
      consentedAt: '2026-01-01T00:00:00.000Z',
      version: '1.0',
    };
    localStorageMock.setItem(STORAGE_KEYS.COOKIE_CONSENT, JSON.stringify(existing));

    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(false);
    expect(result.current.consent).toEqual(existing);
  });

  it('acceptAll sets all categories to true and writes to localStorage', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptAll();
    });

    expect(result.current.showBanner).toBe(false);
    expect(result.current.consent?.necessary).toBe(true);
    expect(result.current.consent?.analytics).toBe(true);
    expect(result.current.consent?.marketing).toBe(true);
    expect(result.current.consent?.version).toBe(CONSENT_VERSION);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.COOKIE_CONSENT,
      expect.any(String),
    );
  });

  it('rejectAll sets optional categories to false', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.rejectAll();
    });

    expect(result.current.consent?.necessary).toBe(true);
    expect(result.current.consent?.analytics).toBe(false);
    expect(result.current.consent?.marketing).toBe(false);
  });

  it('savePreferences stores custom analytics/marketing values', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.savePreferences(true, false);
    });

    expect(result.current.consent?.analytics).toBe(true);
    expect(result.current.consent?.marketing).toBe(false);
    expect(result.current.showBanner).toBe(false);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorageMock.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'not-valid-json');

    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(true);
    expect(result.current.consent).toBeNull();
  });

  it('consentedAt is a valid ISO date string', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptAll();
    });

    const consentedAt = result.current.consent?.consentedAt ?? '';
    const parsed = new Date(consentedAt);
    expect(parsed.toISOString()).toBe(consentedAt);
  });
});
