/**
 * Unit tests for `useAuthOperations` — the BFF login + register operations.
 *
 * Focus is on the logic: a successful login/register dispatches the derived
 * user view + `setAuthenticated(true)`, and the loading flag is toggled around
 * the call regardless of outcome. No rendering, no real HTTP.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useAuthOperations } from './useAuthOperations';

import type { BffAuthClient, BffUser } from '@dloizides/auth-client';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

const USER: BffUser = { sub: 'u1', email: 'a@b.c', roles: ['admin'] };

function makeBffClient(overrides?: Partial<BffAuthClient>): BffAuthClient {
  return {
    login: jest.fn().mockResolvedValue(USER),
    register: jest.fn().mockResolvedValue(USER),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    ...overrides,
  } as unknown as BffAuthClient;
}

function dispatchedActionTypes(): string[] {
  return mockDispatch.mock.calls.map((call) => {
    const action = call[0] as { type?: string };
    return action.type ?? '';
  });
}

describe('useAuthOperations.loginWithPassword', () => {
  beforeEach(() => mockDispatch.mockReset());

  it('calls BffAuthClient.login with the credentials', async () => {
    const bff = makeBffClient();
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await result.current.loginWithPassword('jim', 'secret');
    });

    expect(bff.login).toHaveBeenCalledWith({ username: 'jim', password: 'secret' });
  });

  it('on success dispatches the user view and marks the session authenticated', async () => {
    const bff = makeBffClient();
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await result.current.loginWithPassword('jim', 'secret');
    });

    const types = dispatchedActionTypes();
    expect(types).toContain('auth/setUser');
    expect(types).toContain('auth/setUserInfo');
    expect(types).toContain('auth/setAuthenticated');
  });

  it('toggles the loading flag on then off around a successful login', async () => {
    const bff = makeBffClient();
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await result.current.loginWithPassword('jim', 'secret');
    });

    const loadingCalls = mockDispatch.mock.calls
      .map((c) => c[0] as { type?: string; payload?: unknown })
      .filter((a) => a.type === 'auth/setLoading');
    expect(loadingCalls[0]?.payload).toBe(true);
    expect(loadingCalls[loadingCalls.length - 1]?.payload).toBe(false);
  });

  it('clears the loading flag even when login throws', async () => {
    const bff = makeBffClient({ login: jest.fn().mockRejectedValue(new Error('bad creds')) });
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await expect(result.current.loginWithPassword('jim', 'wrong')).rejects.toThrow('bad creds');
    });

    const loadingCalls = mockDispatch.mock.calls
      .map((c) => c[0] as { type?: string; payload?: unknown })
      .filter((a) => a.type === 'auth/setLoading');
    expect(loadingCalls[loadingCalls.length - 1]?.payload).toBe(false);
  });

  it('does NOT mark the session authenticated when login throws', async () => {
    const bff = makeBffClient({ login: jest.fn().mockRejectedValue(new Error('bad creds')) });
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await expect(result.current.loginWithPassword('jim', 'wrong')).rejects.toThrow();
    });

    expect(dispatchedActionTypes()).not.toContain('auth/setAuthenticated');
  });
});

describe('useAuthOperations.register', () => {
  beforeEach(() => mockDispatch.mockReset());

  const REGISTER_REQUEST = {
    firstName: 'J',
    lastName: 'D',
    username: 'jim',
    email: 'a@b.c',
    password: 'Secret1!',
    tenantName: 'Acme',
  };

  it('calls BffAuthClient.register with the request', async () => {
    const bff = makeBffClient();
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await result.current.register(REGISTER_REQUEST);
    });

    expect(bff.register).toHaveBeenCalledWith(REGISTER_REQUEST);
  });

  it('on success persists the session view', async () => {
    const bff = makeBffClient();
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await result.current.register(REGISTER_REQUEST);
    });

    expect(dispatchedActionTypes()).toContain('auth/setAuthenticated');
  });

  it('propagates a registration failure', async () => {
    const bff = makeBffClient({ register: jest.fn().mockRejectedValue(new Error('EMAIL_TAKEN')) });
    const { result } = renderHook(() => useAuthOperations(bff));

    await act(async () => {
      await expect(result.current.register(REGISTER_REQUEST)).rejects.toThrow('EMAIL_TAKEN');
    });
  });
});
