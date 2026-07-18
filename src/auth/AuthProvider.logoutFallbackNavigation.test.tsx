/**
 * The one test that runs the REAL `redirectTo` — no navigation mock.
 *
 * ## Why a separate file
 *
 * `AuthProvider.test.tsx` mocks `../lib/navigation`, which is right for asserting
 * ordering but hides the mechanism that actually killed the request. The real
 * `redirectTo` (from `@dloizides/utils`, re-exported by `src/lib/navigation`)
 * does NOT just hand the path to the router — it also arms a timer:
 *
 * ```ts
 * redirectHandler(normalized);                       // SPA navigation attempt
 * scheduleFallbackNavigation(before, normalized);    // 150 ms later:
 *   → if the location did not change: window.location.replace(normalized)
 * ```
 *
 * That `location.replace` is a full document navigation, and a document
 * navigation CANCELS in-flight fetches. So a sign-out that redirects before
 * awaiting `POST /bff/logout` loses the request ~150 ms in — the server-side
 * session survives while the UI claims the user signed out. A mocked
 * `redirectTo` can never reproduce this, which is precisely how the defect
 * shipped green.
 *
 * Here the handler is a no-op (it records the path but does not move
 * `window.location`), which is exactly the failure mode the fallback exists for
 * — and exactly what an Expo Router SPA navigation looks like to `jsdom`. So the
 * fallback WILL fire if anything redirects while the logout is pending.
 *
 * The assertion is therefore the strongest available: with the BFF call
 * deliberately unresolved, advance well past the fallback window and require
 * that `window.location.replace` was never called.
 */
import React from 'react';

import { setRedirectHandler } from '@dloizides/utils';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from './AuthProvider';
import { bffAuthClient } from './bffClient';
import { resetLogoutInFlightForTests } from './logoutNavigationGuard';
import { reduxStore } from '../store/reduxStore';

// NOTE: `../lib/navigation` is deliberately NOT mocked — the real `redirectTo`
// and its fallback timer are the subject of this file.
jest.mock('./bffClient', () => ({
  bffAuthClient: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockLogout = jest.mocked(bffAuthClient.logout);
const mockGetCurrentUser = jest.mocked(bffAuthClient.getCurrentUser);

/** Comfortably past `@dloizides/utils`' 150 ms `NAVIGATION_CHECK_DELAY_MS`. */
const PAST_FALLBACK_WINDOW_MS = 1000;

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <Provider store={reduxStore}>
    <AuthProvider>{children}</AuthProvider>
  </Provider>
);

let replaceSpy: jest.Mock;
let assignSpy: jest.Mock;
/** Stands in for the Expo Router SPA navigation: records, does not move location. */
let routerHandler: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  resetLogoutInFlightForTests();
  mockGetCurrentUser.mockResolvedValue(null);
  replaceSpy = jest.fn();
  assignSpy = jest.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: {
      ...window.location,
      pathname: '/dashboard',
      search: '',
      hash: '',
      replace: replaceSpy,
      assign: assignSpy,
    },
  });
  routerHandler = jest.fn();
  setRedirectHandler(routerHandler);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AuthProvider.logout — the fallback navigation timer', () => {
  it('arms no document navigation while POST /bff/logout is still in flight', async () => {
    let releaseLogout!: (value: string | null) => void;
    mockLogout.mockReturnValue(
      new Promise<string | null>((resolve) => {
        releaseLogout = resolve;
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Fake timers only AFTER the mount-time bootstrap: RNTL's `waitFor` drives
    // real timers, so faking them earlier deadlocks the bootstrap above.
    jest.useFakeTimers();

    let logoutCall: Promise<void> = Promise.resolve();
    act(() => {
      logoutCall = result.current.logout();
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Run every timer the sign-out scheduled (storage cleanup, and — if anything
    // redirected — the 150 ms fallback) while the BFF call is STILL pending.
    await act(async () => {
      jest.advanceTimersByTime(PAST_FALLBACK_WINDOW_MS);
      await Promise.resolve();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    // Nothing redirected, so no fallback was ever armed...
    expect(routerHandler).not.toHaveBeenCalled();
    // ...and therefore the document was never unloaded under the request.
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();

    // Restore real timers before settling: RNTL's auto-cleanup runs on real
    // timers and deadlocks if fake ones are still installed.
    jest.useRealTimers();

    // Once the BFF answers, the navigation is allowed to happen. `redirectTo`
    // strips Expo Router group segments, so `/(auth)/login` arrives as `/login`.
    await act(async () => {
      releaseLogout(null);
      await logoutCall;
    });
    expect(routerHandler).toHaveBeenCalledWith('/login');
  });
});
