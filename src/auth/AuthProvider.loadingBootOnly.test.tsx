/**
 * Guard-rail: the protected surface's auth `loading` must stay BOOT-ONLY.
 *
 * `app/(protected)/_layout.tsx` REPLACES the navigator with a spinner while
 * `loading` is true (`if (loading) return <ActivityIndicator/>`). That shape is
 * safe *only* because `loading` flips `true -> false` exactly once, at boot
 * (driven by the `GET /bff/me` bootstrap in `useSessionBootstrap`), and never
 * returns to true — so the navigator mounts once, after auth, with the deep-link
 * URL still in the bar. If a future change ever re-enters `loading = true` after
 * boot (a re-probe, a re-validate, a focus refresh — the kefi OnboardingGate
 * bug), the replace-style guard would unmount the navigator mid-session and
 * React Navigation would re-derive its DEFAULT route, silently dropping the deep
 * link. See the memory note `reference_route_guard_spinner_unmounts_navigator`.
 *
 * This test fails the moment `loading` stops being boot-only. It is the cheap
 * guard-rail chosen instead of converting the (currently safe) boot-guard to the
 * `@dloizides/ui-nav` `gate=` overlay: it observes `loading` from the hook, so it
 * is agnostic to WHERE the flag is stored (here a Redux `authSlice`, not
 * useState), and it exercises the post-boot API surface reachable FROM the
 * protected surface (`logout`, `applyBffSession`) — the paths a re-toggle would
 * most plausibly be wired into.
 *
 * ## The `refreshingUserInfo` trap (why this asserts on `loading` only)
 *
 * `useAuth()` exposes BOTH `loading` AND `refreshingUserInfo`. Only `loading`
 * gates the navigator-replacing guard and must be boot-only; `refreshingUserInfo`
 * is a separate, softer flag that may re-toggle by design. This file asserts on
 * `loading` alone.
 *
 * ## Why `loginWithPassword` / `register` are NOT exercised here
 *
 * Those two DO frame themselves with `setLoading(true/false)`
 * (`useAuthOperations.runWithSessionFraming`) — legitimately, because they run on
 * the UNAUTHENTICATED login surface, BEFORE the protected navigator mounts, so
 * they cannot unmount it. The invariant is about `loading` after the protected
 * surface is live, so the guard-rail exercises only the API reachable once you
 * are already inside it: `logout` and `applyBffSession`.
 */
import React from 'react';

import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from './AuthProvider';
import { bffAuthClient } from './bffClient';
import { resetLogoutInFlightForTests } from './logoutNavigationGuard';
import { reduxStore } from '../store/reduxStore';
import { clearSession, setLoading } from '../store/slices/authSlice';

import type { BffUser } from '@dloizides/auth-client';

// The BFF client drives the mount-time `GET /bff/me` bootstrap (`getCurrentUser`)
// and the post-boot `logout`. Both are re-stubbed per test.
jest.mock('./bffClient', () => ({
  bffAuthClient: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

// The navigation seam: keep katalogos's login-route redirect a no-op so a
// `logout()` here never touches `window.location`.
jest.mock('../lib/navigation', () => ({
  redirectTo: jest.fn(),
  setRedirectHandler: jest.fn(),
}));

const mockGetCurrentUser = jest.mocked(bffAuthClient.getCurrentUser);
const mockLogout = jest.mocked(bffAuthClient.logout);

const USER = { sub: 'u1', email: 'a@b.com' } as unknown as BffUser;

/** Every `loading` value the context has emitted, in render order. */
const loadingHistory: boolean[] = [];

/** Reads the auth context, records `loading`, and exposes its post-boot API. */
const Probe = (): React.ReactElement => {
  const { loading, isLoggedIn, logout, applyBffSession } = useAuth();
  loadingHistory.push(loading);
  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="authed">{String(isLoggedIn)}</Text>
      <Pressable
        testID="do-apply"
        onPress={(): void => {
          applyBffSession(USER);
        }}
      >
        <Text>apply</Text>
      </Pressable>
      <Pressable
        testID="do-logout"
        onPress={(): void => {
          void logout();
        }}
      >
        <Text>logout</Text>
      </Pressable>
    </>
  );
};

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <Provider store={reduxStore}>
    <AuthProvider>{children}</AuthProvider>
  </Provider>
);

/** Assert `loading` never returned to `true` after it first settled to `false`. */
function assertBootOnly(): void {
  const firstFalse = loadingHistory.indexOf(false);
  expect(firstFalse).toBeGreaterThanOrEqual(0);
  expect(loadingHistory.slice(firstFalse).some(Boolean)).toBe(false);
}

describe('AuthProvider — loading is boot-only (deep-link guard-rail)', () => {
  beforeEach(() => {
    loadingHistory.length = 0;
    jest.clearAllMocks();
    resetLogoutInFlightForTests();
    mockLogout.mockResolvedValue(null);
    // The reduxStore is a per-file singleton: reset it to a fresh, pre-boot
    // session so every test observes the genuine `true -> false` boot transition
    // rather than a `loading:false` left behind by a prior test.
    reduxStore.dispatch(clearSession());
    reduxStore.dispatch(setLoading(true));
  });

  it('flips loading true -> false once and never re-enters true across applyBffSession + logout (authenticated boot)', async () => {
    mockGetCurrentUser.mockResolvedValue(USER);

    const { getByTestId } = render(<Probe />, { wrapper });

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
    expect(getByTestId('authed').props.children).toBe('true');
    expect(loadingHistory[0]).toBe(true);

    // Re-bridge an external session — writes user/roles, must NOT touch loading.
    fireEvent.press(getByTestId('do-apply'));
    expect(getByTestId('loading').props.children).toBe('false');

    // Sign out — the most plausible place a re-probe/re-validate would be wired.
    fireEvent.press(getByTestId('do-logout'));
    await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    expect(getByTestId('loading').props.children).toBe('false');

    assertBootOnly();
  });

  it('settles loading to false on an unauthenticated boot and stays there', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const { getByTestId } = render(<Probe />, { wrapper });

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
    expect(getByTestId('authed').props.children).toBe('false');
    expect(loadingHistory[0]).toBe(true);

    assertBootOnly();
  });

  it('keeps loading false when the bootstrap probe rejects (BFF unreachable)', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('bff unreachable'));

    const { getByTestId } = render(<Probe />, { wrapper });

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
    expect(getByTestId('authed').props.children).toBe('false');

    assertBootOnly();
  });
});
