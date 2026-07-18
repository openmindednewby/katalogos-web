/**
 * Unit tests for the in-flight sign-out flag that `app/(protected)/_layout.tsx`
 * reads to stand its route guard down.
 *
 * The flag exists because `performBffLogout` cannot see the app's OTHER
 * navigation: clearing local session state re-renders the protected layout,
 * whose guard fires `redirectTo('/(auth)/login')` → `window.location.replace()`
 * 150 ms later → the in-flight `POST /bff/logout` is cancelled and the
 * server-side session survives.
 */
import {
  isLogoutInFlight,
  resetLogoutInFlightForTests,
  shouldRedirectToLogin,
  withLogoutInFlight,
} from './logoutNavigationGuard';

beforeEach(() => {
  resetLogoutInFlightForTests();
});

describe('withLogoutInFlight', () => {
  it('is raised for the whole awaited call and lowered afterwards', async () => {
    expect(isLogoutInFlight()).toBe(false);

    let observedDuringCall = false;
    await withLogoutInFlight(async () => {
      observedDuringCall = isLogoutInFlight();
      await Promise.resolve();
    });

    expect(observedDuringCall).toBe(true);
    // Lowered again, so ordinary session expiry still redirects to login.
    expect(isLogoutInFlight()).toBe(false);
  });

  it('stays raised until the slow call actually settles, not merely until it starts', async () => {
    // The whole point: a flag that dropped early would re-open the 150 ms window.
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });

    const call = withLogoutInFlight(async () => pending);
    await Promise.resolve();
    expect(isLogoutInFlight()).toBe(true);

    release();
    await call;
    expect(isLogoutInFlight()).toBe(false);
  });

  it('lowers the flag when the call throws, so the guard is never wedged off', async () => {
    await expect(
      withLogoutInFlight(async () => {
        throw new Error('bff unreachable');
      }),
    ).rejects.toThrow('bff unreachable');

    expect(isLogoutInFlight()).toBe(false);
  });

  it('stays raised while overlapping sign-outs are in flight', async () => {
    // The logout button is driven by a document-level capture listener that can
    // fire for click, pointerup AND touchend, so two sign-outs can overlap. A
    // boolean would let the first to finish clear the flag while the second is
    // still awaiting the BFF.
    let releaseSecond!: () => void;
    const second = new Promise<void>((resolve) => {
      releaseSecond = resolve;
    });

    const firstCall = withLogoutInFlight(async () => Promise.resolve());
    const secondCall = withLogoutInFlight(async () => second);

    await firstCall;
    expect(isLogoutInFlight()).toBe(true);

    releaseSecond();
    await secondCall;
    expect(isLogoutInFlight()).toBe(false);
  });

  it('returns the resolved value of the wrapped call', async () => {
    await expect(withLogoutInFlight(async () => 'done')).resolves.toBe('done');
  });
});

describe('shouldRedirectToLogin — the protected-route guard decision', () => {
  it('stands down while a sign-out is in flight, even though the user reads as logged out', async () => {
    // THE case. Local state is already cleared (so `isLoggedIn` is false) while
    // `POST /bff/logout` is still on the wire. Redirecting here schedules a
    // `window.location.replace()` 150 ms later, and that document unload cancels
    // the request — the server-side session survives the "sign-out".
    let decisionDuringLogout = true;
    await withLogoutInFlight(async () => {
      decisionDuringLogout = shouldRedirectToLogin(false, false);
    });

    expect(decisionDuringLogout).toBe(false);
  });

  it('redirects a logged-out visitor once no sign-out is in flight', () => {
    // Session expiry, a bookmarked protected URL, a revoked cookie — the guard
    // must still do its job the rest of the time.
    expect(shouldRedirectToLogin(false, false)).toBe(true);
  });

  it('never redirects while the session bootstrap is still loading', () => {
    // `GET /bff/me` has not answered yet; a logged-in user would be bounced out.
    expect(shouldRedirectToLogin(true, false)).toBe(false);
  });

  it('never redirects an authenticated user', () => {
    expect(shouldRedirectToLogin(false, true)).toBe(false);
  });
});
