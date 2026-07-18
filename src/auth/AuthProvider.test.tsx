/**
 * Unit tests for `AuthProvider.logout` — the logout ORDERING contract.
 *
 * ## Why these tests assert order, not "was it called?"
 *
 * The bug this file pins was a RACE, and it shipped green. The provider used to
 * do this:
 *
 * ```ts
 * redirectTo('/(auth)/login');   // window.location.replace() → document unload
 * await bffAuthClient.logout();  // races the unload — often NEVER SENT
 * ```
 *
 * A document navigation cancels in-flight fetches, so `POST /bff/logout` was
 * frequently never sent and the httpOnly session cookie SURVIVED: the UI looked
 * signed out while the server still had the user authenticated. A test asserting
 * merely `expect(client.logout).toHaveBeenCalled()`, or that we navigated to
 * `/login`, PASSES against that buggy code — both statements run, in the wrong
 * order — which is exactly why the defect survived review.
 *
 * So these tests assert only things that DISCRIMINATE between fixed and broken:
 *
 *   1. **Order** — while `logout()` is still pending, NOTHING may navigate. The
 *      deferred promise below is never resolved until after the assertion, so
 *      redirect-first code fails here.
 *   2. **The in-flight flag is raised** — the route guard in
 *      `app/(protected)/_layout.tsx` reads it to stand down. Without it, clearing
 *      local session state re-renders the guard, which fires its OWN `redirectTo`
 *      and unloads the document out from under the POST.
 *   3. **The IdP URL is used, not dropped** — `logout()` resolves to the IdP's
 *      RP-initiated logout URL (`Promise<string | null>`, not `void`). Dropping
 *      it leaves the Keycloak SSO session alive ("sign out, get signed back in").
 *
 * The REAL `performBffLogout` from `@dloizides/auth-web` runs here on purpose —
 * mocking it would only prove katalogos calls a mock. Only the client and the
 * navigation seam are faked, so what is under test is katalogos's genuine wiring.
 */
import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from './AuthProvider';
import { bffAuthClient } from './bffClient';
import { isLogoutInFlight, resetLogoutInFlightForTests } from './logoutNavigationGuard';
import { redirectTo } from '../lib/navigation';
import { reduxStore } from '../store/reduxStore';

// The navigation seam: katalogos's own login-route redirect.
jest.mock('../lib/navigation', () => ({
  redirectTo: jest.fn(),
  setRedirectHandler: jest.fn(),
}));

// The BFF client. `getCurrentUser` keeps the mount-time session bootstrap quiet;
// `logout` is re-stubbed per test.
jest.mock('./bffClient', () => ({
  bffAuthClient: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockRedirectTo = jest.mocked(redirectTo);
const mockLogout = jest.mocked(bffAuthClient.logout);
const mockGetCurrentUser = jest.mocked(bffAuthClient.getCurrentUser);

/** A promise whose settlement this test controls, so ordering is observable. */
interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <Provider store={reduxStore}>
    <AuthProvider>{children}</AuthProvider>
  </Provider>
);

/** Capture top-level IdP navigations (`performBffLogout` defaults to `location.assign`). */
let assignSpy: jest.Mock;
let replaceSpy: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  resetLogoutInFlightForTests();
  mockGetCurrentUser.mockResolvedValue(null);
  assignSpy = jest.fn();
  replaceSpy = jest.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { ...window.location, assign: assignSpy, replace: replaceSpy, href: 'http://localhost/' },
  });
});

/** Mount the provider and wait out the `GET /bff/me` bootstrap. */
async function mountAuth(): Promise<{ current: ReturnType<typeof useAuth> }> {
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

/** Drain every already-queued microtask without settling the BFF call. */
async function drainMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('AuthProvider.logout — ordering', () => {
  it('does NOT navigate while the BFF logout is still in flight', async () => {
    // The heart of the regression. `logout()` never settles during this test, so
    // any navigation observed here happened BEFORE the call could complete —
    // i.e. the document unload that used to cancel `POST /bff/logout`.
    const pending = deferred<string | null>();
    mockLogout.mockReturnValue(pending.promise);

    const result = await mountAuth();

    let settled = false;
    let logoutCall: Promise<void> = Promise.resolve();
    act(() => {
      logoutCall = result.current.logout().then(() => {
        settled = true;
      });
    });
    await drainMicrotasks();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    // The discriminating assertions — redirect-first code fails ALL of these.
    expect(mockRedirectTo).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(settled).toBe(false);

    // Releasing the call lets the sequencer navigate — proving the redirect was
    // genuinely WAITING on the network call, not merely absent.
    await act(async () => {
      pending.resolve(null);
      await logoutCall;
    });
    expect(mockRedirectTo).toHaveBeenCalledWith('/(auth)/login');
  });

  it('raises the in-flight flag for the whole call, so the route guard stands down', async () => {
    // `performBffLogout` alone does NOT fix this app: clearing local session
    // state re-renders `ProtectedLayout`, whose guard fires its own `redirectTo`
    // → `window.location.replace()` 150 ms later → the POST is cancelled anyway.
    // The guard reads this flag to skip that redirect.
    const pending = deferred<string | null>();
    mockLogout.mockReturnValue(pending.promise);

    const result = await mountAuth();
    expect(isLogoutInFlight()).toBe(false);

    let logoutCall: Promise<void> = Promise.resolve();
    act(() => {
      logoutCall = result.current.logout();
    });
    await drainMicrotasks();

    // Local state is already cleared (the guard WOULD fire) yet the POST is live.
    expect(reduxStore.getState().auth.isLoggedIn).toBe(false);
    expect(isLogoutInFlight()).toBe(true);

    await act(async () => {
      pending.resolve(null);
      await logoutCall;
    });
    // Lowered afterwards, so ordinary session expiry still redirects.
    expect(isLogoutInFlight()).toBe(false);
  });

  it('clears local session state immediately, before the BFF call settles', async () => {
    // Perceived performance: the UI must reflect the sign-out right away. This
    // is the ONE thing that is allowed to happen before the await.
    const pending = deferred<string | null>();
    mockLogout.mockReturnValue(pending.promise);

    const result = await mountAuth();

    let logoutCall: Promise<void> = Promise.resolve();
    act(() => {
      logoutCall = result.current.logout();
    });
    await drainMicrotasks();

    expect(reduxStore.getState().auth.isLoggedIn).toBe(false);
    expect(reduxStore.getState().auth.user).toBeNull();
    expect(reduxStore.getState().auth.userInfo).toBeNull();

    await act(async () => {
      pending.resolve(null);
      await logoutCall;
    });
  });
});

describe('AuthProvider.logout — the IdP logout URL', () => {
  it('navigates to the IdP URL when one is returned, instead of the local login route', async () => {
    // `logout()` returns `Promise<string | null>`, not `void`. Dropping that
    // string leaves the Keycloak SSO session alive, so the next authorize
    // round-trip silently re-authenticates the user.
    const idpUrl = 'https://identity.example.test/realms/onlinemenu/protocol/openid-connect/logout?id_token_hint=x';
    mockLogout.mockResolvedValue(idpUrl);

    const result = await mountAuth();
    await act(async () => {
      await result.current.logout();
    });

    expect(assignSpy).toHaveBeenCalledWith(idpUrl);
    // Two competing navigations would race; the IdP round-trip returns the user.
    expect(mockRedirectTo).not.toHaveBeenCalled();
  });

  it('falls back to the local login route when there is no IdP session (null)', async () => {
    // ROPC / OTP / device-PIN logins never had an IdP browser cookie.
    mockLogout.mockResolvedValue(null);

    const result = await mountAuth();
    await act(async () => {
      await result.current.logout();
    });

    expect(mockRedirectTo).toHaveBeenCalledWith('/(auth)/login');
    expect(assignSpy).not.toHaveBeenCalled();
  });
});

describe('AuthProvider.logout — failure handling', () => {
  it('still navigates when the BFF logout rejects, and never rejects itself', async () => {
    // A BFF that is down must not trap the user on a page they asked to leave.
    // The local session is already gone, so the client-side sign-out holds.
    mockLogout.mockRejectedValue(new Error('bff unreachable'));

    const result = await mountAuth();
    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    expect(mockRedirectTo).toHaveBeenCalledWith('/(auth)/login');
    expect(reduxStore.getState().auth.isLoggedIn).toBe(false);
    // A failed logout must not wedge the guard off for the rest of the session.
    expect(isLogoutInFlight()).toBe(false);
  });
});
