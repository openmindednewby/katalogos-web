/**
 * Tests for usePublicMenuLocation hook and utility functions.
 * Focuses on logic: URL param reading/writing, location resolution,
 * state management, and picker visibility threshold.
 */
import { renderHook, act } from '@testing-library/react-native';

import {
  getUrlLocationParam,
  setUrlLocationParam,
  resolveLocation,
  usePublicMenuLocation,
} from './usePublicMenuLocation';

import type { PublicMenuLocation } from './usePublicMenuLocation';

const LOCATION_A: PublicMenuLocation = { id: 'loc-1', name: 'Downtown', city: 'Austin' };
const LOCATION_B: PublicMenuLocation = { id: 'loc-2', name: 'Uptown', city: 'Dallas' };
const LOCATION_C: PublicMenuLocation = { id: 'loc-3', name: 'Midtown', city: 'Houston' };

describe('getUrlLocationParam', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
  });

  it('returns empty string when window is undefined', () => {
    Object.defineProperty(global, 'window', { value: undefined, writable: true });
    expect(getUrlLocationParam()).toBe('');
  });

  it('returns the location param value from the URL', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '?location=loc-1', href: 'http://example.com?location=loc-1' } },
      writable: true,
    });
    expect(getUrlLocationParam()).toBe('loc-1');
  });

  it('returns empty string when location param is absent', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '', href: 'http://example.com' } },
      writable: true,
    });
    expect(getUrlLocationParam()).toBe('');
  });
});

describe('setUrlLocationParam', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
  });

  it('does nothing when window is undefined', () => {
    Object.defineProperty(global, 'window', { value: undefined, writable: true });
    expect(() => { setUrlLocationParam('loc-1'); }).not.toThrow();
  });

  it('sets location param in the URL', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '', href: 'http://example.com/menu/123' },
        history: { replaceState: replaceStateSpy },
      },
      writable: true,
    });
    setUrlLocationParam('loc-1');
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', 'http://example.com/menu/123?location=loc-1');
  });

  it('removes location param when locationId is empty', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?location=loc-1', href: 'http://example.com/menu/123?location=loc-1' },
        history: { replaceState: replaceStateSpy },
      },
      writable: true,
    });
    setUrlLocationParam('');
    expect(replaceStateSpy).toHaveBeenCalledWith({}, '', 'http://example.com/menu/123');
  });
});

describe('resolveLocation', () => {
  it('returns locationId when it matches an available location', () => {
    expect(resolveLocation([LOCATION_A, LOCATION_B], 'loc-2')).toBe('loc-2');
  });

  it('returns empty when URL location is not available', () => {
    expect(resolveLocation([LOCATION_A, LOCATION_B], 'loc-unknown')).toBe('');
  });

  it('returns empty when URL location is empty', () => {
    expect(resolveLocation([LOCATION_A, LOCATION_B], '')).toBe('');
  });

  it('returns empty for empty available locations', () => {
    expect(resolveLocation([], 'loc-1')).toBe('');
  });
});

describe('usePublicMenuLocation', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '', href: 'http://example.com/menu/123' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
  });

  it('starts with empty location when no URL param', () => {
    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));
    expect(result.current.selectedLocationId).toBe('');
  });

  it('resolves location from URL param on init', () => {
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?location=loc-2', href: 'http://example.com/menu/123?location=loc-2' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));
    expect(result.current.selectedLocationId).toBe('loc-2');
  });

  it('ignores URL param when location is not available', () => {
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '?location=loc-unknown', href: 'http://example.com/menu/123?location=loc-unknown' },
        history: { replaceState: jest.fn() },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));
    expect(result.current.selectedLocationId).toBe('');
  });

  it('allows manual location switching', () => {
    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));

    act(() => { result.current.setLocation('loc-2'); });
    expect(result.current.selectedLocationId).toBe('loc-2');
  });

  it('allows reverting to all locations', () => {
    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));

    act(() => { result.current.setLocation('loc-1'); });
    expect(result.current.selectedLocationId).toBe('loc-1');

    act(() => { result.current.setLocation(''); });
    expect(result.current.selectedLocationId).toBe('');
  });

  it('does not auto-reset after manual selection', () => {
    const { result, rerender } = renderHook(
      ({ locs }: { locs: PublicMenuLocation[] }) => usePublicMenuLocation(locs),
      { initialProps: { locs: [LOCATION_A, LOCATION_B] } },
    );

    act(() => { result.current.setLocation('loc-2'); });
    expect(result.current.selectedLocationId).toBe('loc-2');

    rerender({ locs: [LOCATION_A, LOCATION_B] });
    expect(result.current.selectedLocationId).toBe('loc-2');
  });

  it('updates the URL when location is switched', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(global, 'window', {
      value: {
        location: { search: '', href: 'http://example.com/menu/123' },
        history: { replaceState: replaceStateSpy },
      },
      writable: true,
    });

    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));
    act(() => { result.current.setLocation('loc-1'); });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      {}, '', 'http://example.com/menu/123?location=loc-1',
    );
  });

  it('returns showLocationPicker true when 2+ locations', () => {
    const { result } = renderHook(() => usePublicMenuLocation([LOCATION_A, LOCATION_B]));
    expect(result.current.showLocationPicker).toBe(true);
  });

  it('returns showLocationPicker false when 0 or 1 location', () => {
    const { result: zeroResult } = renderHook(() => usePublicMenuLocation([]));
    expect(zeroResult.current.showLocationPicker).toBe(false);

    const { result: oneResult } = renderHook(() => usePublicMenuLocation([LOCATION_A]));
    expect(oneResult.current.showLocationPicker).toBe(false);
  });

  it('returns showLocationPicker true when 3+ locations', () => {
    const { result } = renderHook(() =>
      usePublicMenuLocation([LOCATION_A, LOCATION_B, LOCATION_C]),
    );
    expect(result.current.showLocationPicker).toBe(true);
  });

  it('exposes availableLocations from input', () => {
    const locs = [LOCATION_A, LOCATION_B];
    const { result } = renderHook(() => usePublicMenuLocation(locs));
    expect(result.current.availableLocations).toBe(locs);
  });

  it('resolves when locations arrive asynchronously', () => {
    const { result, rerender } = renderHook(
      ({ locs }: { locs: PublicMenuLocation[] }) => usePublicMenuLocation(locs),
      { initialProps: { locs: [] as PublicMenuLocation[] } },
    );
    expect(result.current.selectedLocationId).toBe('');
    expect(result.current.showLocationPicker).toBe(false);

    rerender({ locs: [LOCATION_A, LOCATION_B] });
    expect(result.current.showLocationPicker).toBe(true);
  });
});
