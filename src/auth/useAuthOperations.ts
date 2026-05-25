import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { bffUserToKeycloakUserInfo, bffUserToNormalizedUser } from './bffUserMapping';
import { type BffUser } from './keycloakTypes';
import { setAuthenticated, setLoading, setUser, setUserInfo } from '../store/slices/authSlice';

import type { AppDispatch } from '../store/reduxStore';
import type { BffAuthClient, BffRegisterRequest } from '@dloizides/auth-client';

interface AuthOperations {
  /** Password login. Resolves to the signed-in user so the caller can route by role. */
  loginWithPassword: (username: string, password: string) => Promise<BffUser>;
  /** Register a new account. Resolves to the created user so the caller can route by role. */
  register: (request: BffRegisterRequest) => Promise<BffUser>;
  /**
   * Bridge a {@link BffUser} produced by an external login surface (e.g. the
   * shared `<LoginForm>` from `@dloizides/auth-web`, which calls
   * `bffAuthClient.login` directly and bypasses {@link loginWithPassword}) into
   * the same Redux session view those operations write to. Keeps the rest of
   * the app — every component that reads from `authSlice` — unaware of which
   * surface produced the session.
   */
  applyBffSession: (user: BffUser) => void;
}

/**
 * Persist a `BffUser` returned by `/bff/login` or `/bff/register` into the
 * Redux session view. There is no token to persist — the session is the
 * httpOnly cookie the BFF set; this only records the *derived* user/roles the
 * UI renders.
 */
function persistBffSession(dispatch: AppDispatch, user: BffUser): void {
  dispatch(setUserInfo(bffUserToKeycloakUserInfo(user)));
  dispatch(setUser(bffUserToNormalizedUser(user)));
  dispatch(setAuthenticated(true));
}

/**
 * Wrap one of {@link BffAuthClient.login} / {@link BffAuthClient.register} with
 * the `setLoading(true/false)` framing + post-success session persistence.
 * Extracted from the hook body so each `useCallback` stays compact (and the
 * hook satisfies the smart-max-lines rule). Re-exported across the parallel
 * `katalogos-web` / `erevna-web` mappers for symmetry.
 */
async function runWithSessionFraming(
  dispatch: AppDispatch,
  call: () => Promise<BffUser>,
): Promise<BffUser> {
  dispatch(setLoading(true));
  try {
    const user = await call();
    persistBffSession(dispatch, user);
    return user;
  } finally {
    dispatch(setLoading(false));
  }
}

/**
 * Login + register operations against the BFF.
 *
 * Both post credentials to the SPA's own-origin `bff-katalogos`, which does
 * ROPC against Keycloak server-side and sets the session cookie. The browser
 * never handles a token. Errors propagate so the UI can surface them.
 */
export function useAuthOperations(bffAuthClient: BffAuthClient): AuthOperations {
  const dispatch = useDispatch<AppDispatch>();

  const loginWithPassword = useCallback(
    async (username: string, password: string): Promise<BffUser> =>
      runWithSessionFraming(dispatch, async () => bffAuthClient.login({ username, password })),
    [dispatch, bffAuthClient],
  );

  const register = useCallback(
    async (request: BffRegisterRequest): Promise<BffUser> =>
      runWithSessionFraming(dispatch, async () => bffAuthClient.register(request)),
    [dispatch, bffAuthClient],
  );

  const applyBffSession = useCallback(
    (user: BffUser): void => {
      persistBffSession(dispatch, user);
    },
    [dispatch],
  );

  return { loginWithPassword, register, applyBffSession };
}
