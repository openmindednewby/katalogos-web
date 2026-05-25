import { renderHook } from '@testing-library/react-native';

import { useBreadcrumbs } from './useBreadcrumbs';
import { Routes } from '../navigation/routes';

let mockPathname = '/settings/profile';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));

describe('useBreadcrumbs', () => {
  it('returns a 2-item trail for a known settings path', () => {
    mockPathname = Routes.PROFILE_SETTINGS;
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toHaveLength(2);
    expect(result.current[0].labelKey).toBe('settings.hub.title');
    expect(result.current[0].route).toBe(Routes.ACCOUNT_SETTINGS);
    expect(result.current[1].labelKey).toBe('settings.profile.title');
    expect(result.current[1].route).toBeUndefined();
  });

  it('returns a 2-item trail for security settings', () => {
    mockPathname = Routes.SECURITY_SETTINGS;
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toHaveLength(2);
    expect(result.current[0].labelKey).toBe('settings.hub.title');
    expect(result.current[1].labelKey).toBe('settings.security.title');
  });

  it('returns empty array for unknown paths', () => {
    mockPathname = '/unknown/route';
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([]);
  });

  it('returns empty array for root path', () => {
    mockPathname = '/';
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current).toEqual([]);
  });

  it('overrides last crumb label when dynamicLabel is provided', () => {
    mockPathname = Routes.PROFILE_SETTINGS;
    const { result } = renderHook(() => useBreadcrumbs('custom.label.key'));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].labelKey).toBe('settings.hub.title');
    expect(result.current[1].labelKey).toBe('custom.label.key');
  });

  it('does not modify original crumbs when dynamicLabel is provided', () => {
    mockPathname = Routes.PROFILE_SETTINGS;
    renderHook(() => useBreadcrumbs('override.key'));

    // Re-render without dynamicLabel to verify originals unchanged
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current[1].labelKey).toBe('settings.profile.title');
  });

  it('does not override when dynamicLabel is undefined', () => {
    mockPathname = Routes.BILLING_SETTINGS;
    const { result } = renderHook(() => useBreadcrumbs(undefined));

    expect(result.current).toHaveLength(2);
    expect(result.current[1].labelKey).toBe('settings.billing.title');
  });
});
