import React from 'react';

import { setRedirectHandler } from '@dloizides/utils';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { AuthProvider, useAuth } from './AuthProvider';
import { bffAuthClient } from './bffClient';
import { resetLogoutInFlightForTests } from './logoutNavigationGuard';
import { reduxStore } from '../store/reduxStore';

jest.mock('./bffClient', () => ({
  bffAuthClient: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockLogout = jest.mocked(bffAuthClient.logout);
const mockGetCurrentUser = jest.mocked(bffAuthClient.getCurrentUser);

const PAST_FALLBACK_WINDOW_MS = 1000;

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <Provider store={reduxStore}>
    <AuthProvider>{children}</AuthProvider>
  </Provider>
);

let replaceSpy: jest.Mock;
let assignSpy: jest.Mock;
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

    jest.useFakeTimers();

    let logoutCall: Promise<void> = Promise.resolve();
    act(() => {
      logoutCall = result.current.logout();
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(PAST_FALLBACK_WINDOW_MS);
      await Promise.resolve();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(routerHandler).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();

    jest.useRealTimers();

    await act(async () => {
      releaseLogout(null);
      await logoutCall;
    });
    expect(routerHandler).toHaveBeenCalledWith('/login');
  });
});
