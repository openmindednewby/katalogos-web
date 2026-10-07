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
    expect(isLogoutInFlight()).toBe(false);
  });

  it('stays raised until the slow call actually settles, not merely until it starts', async () => {
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
    let decisionDuringLogout = true;
    await withLogoutInFlight(async () => {
      decisionDuringLogout = shouldRedirectToLogin(false, false);
    });

    expect(decisionDuringLogout).toBe(false);
  });

  it('redirects a logged-out visitor once no sign-out is in flight', () => {
    expect(shouldRedirectToLogin(false, false)).toBe(true);
  });

  it('never redirects while the session bootstrap is still loading', () => {
    expect(shouldRedirectToLogin(true, false)).toBe(false);
  });

  it('never redirects an authenticated user', () => {
    expect(shouldRedirectToLogin(false, true)).toBe(false);
  });
});
