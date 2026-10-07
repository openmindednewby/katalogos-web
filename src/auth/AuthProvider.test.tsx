import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from './AuthProvider';
import { bffAuthClient } from './bffClient';
import { isLogoutInFlight, resetLogoutInFlightForTests } from './logoutNavigationGuard';
import { redirectTo } from '../lib/navigation';
import { reduxStore } from '../store/reduxStore';

jest.mock('../lib/navigation', () => ({
  redirectTo: jest.fn(),
  setRedirectHandler: jest.fn(),
}));

jest.mock('./bffClient', () => ({
  bffAuthClient: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockRedirectTo = jest.mocked(redirectTo);
const mockLogout = jest.mocked(bffAuthClient.logout);
const mockGetCurrentUser = jest.mocked(bffAuthClient.getCurrentUser);

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

async function mountAuth(): Promise<{ current: ReturnType<typeof useAuth> }> {
  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

async function drainMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('AuthProvider.logout — ordering', () => {
  it('does NOT navigate while the BFF logout is still in flight', async () => {
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
    expect(mockRedirectTo).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(settled).toBe(false);

    await act(async () => {
      pending.resolve(null);
      await logoutCall;
    });
    expect(mockRedirectTo).toHaveBeenCalledWith('/(auth)/login');
  });

  it('raises the in-flight flag for the whole call, so the route guard stands down', async () => {
    const pending = deferred<string | null>();
    mockLogout.mockReturnValue(pending.promise);

    const result = await mountAuth();
    expect(isLogoutInFlight()).toBe(false);

    let logoutCall: Promise<void> = Promise.resolve();
    act(() => {
      logoutCall = result.current.logout();
    });
    await drainMicrotasks();

    expect(reduxStore.getState().auth.isLoggedIn).toBe(false);
    expect(isLogoutInFlight()).toBe(true);

    await act(async () => {
      pending.resolve(null);
      await logoutCall;
    });
    expect(isLogoutInFlight()).toBe(false);
  });

  it('clears local session state immediately, before the BFF call settles', async () => {
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
    const idpUrl = 'https://identity.example.test/realms/onlinemenu/protocol/openid-connect/logout?id_token_hint=x';
    mockLogout.mockResolvedValue(idpUrl);

    const result = await mountAuth();
    await act(async () => {
      await result.current.logout();
    });

    expect(assignSpy).toHaveBeenCalledWith(idpUrl);
    expect(mockRedirectTo).not.toHaveBeenCalled();
  });

  it('falls back to the local login route when there is no IdP session (null)', async () => {
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
    mockLogout.mockRejectedValue(new Error('bff unreachable'));

    const result = await mountAuth();
    await act(async () => {
      await expect(result.current.logout()).resolves.toBeUndefined();
    });

    expect(mockRedirectTo).toHaveBeenCalledWith('/(auth)/login');
    expect(reduxStore.getState().auth.isLoggedIn).toBe(false);
    expect(isLogoutInFlight()).toBe(false);
  });
});
