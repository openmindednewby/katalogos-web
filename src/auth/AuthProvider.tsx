import React, { createContext, useContext, useCallback, useEffect } from 'react';

import { type BffRegisterRequest, type BffUser } from '@dloizides/auth-client';
import { performBffLogout } from '@dloizides/auth-web';
import { useDispatch, useSelector } from 'react-redux';


import { clearClientAuthState, scheduleLogoutCleanup } from './authStorageCleanup';
import { bffAuthClient } from './bffClient';
import { bffUserToKeycloakUserInfo, bffUserToNormalizedUser } from './bffUserMapping';
import { type KeycloakUserInfo, type NormalizedUser } from './keycloakTypes';
import { withLogoutInFlight } from './logoutNavigationGuard';
import { useAuthOperations } from './useAuthOperations';
import { redirectTo } from '../lib/navigation';
import { TestIds } from '../shared/testIds';
import { setAuthenticated, setLoading, setUser, setUserInfo } from '../store/slices/authSlice';
import { isValueDefined } from '../utils/is';
import { logger } from '../utils/logger';

import type { AppDispatch, RootState } from '../store/reduxStore';

const AUTH_CHECK_INTERVAL_MS = 750;

interface AuthContextType {
  loginWithPassword: (username: string, password: string) => Promise<BffUser>;
  register: (request: BffRegisterRequest) => Promise<BffUser>;
  logout: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
  userInfo: KeycloakUserInfo | null;
  user: NormalizedUser | null;
  refreshingUserInfo: boolean;
  /**
   * Bridge a `BffUser` from an external login surface (the shared `<LoginForm>`
   * from `@dloizides/auth-web`, which calls `bffAuthClient.login` directly)
   * into the Redux session view. Without this, the rest of the app would not
   * see the user as logged in until a page reload re-bootstrapped via
   * `GET /bff/me`. See `useAuthOperations.applyBffSession` for the impl.
   */
  applyBffSession: (user: BffUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Phase 2 BFF cutover: katalogos-web no longer does direct-KC ROPC. The native
// branded login form posts credentials to the same-origin `bff-katalogos`,
// which terminates auth server-side and sets an httpOnly session cookie. The
// SPA holds no token — there is nothing here to refresh or store.
//
// `bffAuthClient` is the shared `BffAuthClient` from `@dloizides/auth-client`
// v3, wired same-origin.

function useLogoutButtonEffect(logout: () => Promise<void>): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const lastLogoutTriggerAtRef = { current: 0 };

    const shouldTriggerLogout = (): boolean => {
      const now = Date.now();
      if (now - lastLogoutTriggerAtRef.current < AUTH_CHECK_INTERVAL_MS) return false;
      lastLogoutTriggerAtRef.current = now;
      return true;
    };

    const handler = (e: Event): void => {
      try {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const el = target.closest(`[data-testid="${TestIds.LOGOUT_BUTTON}"]`);
        if (!el) return;
        if (!shouldTriggerLogout()) return;
        logout().catch(() => {});
      } catch {
        // ignore
      }
    };

    const events: Array<keyof DocumentEventMap> = ['click', 'pointerup', 'touchend'];
    for (const ev of events) document.addEventListener(ev, handler, true);
    return () => {
      for (const ev of events) document.removeEventListener(ev, handler, true);
    };
  }, [logout]);
}

/**
 * Bootstrap the session on app load. `GET /bff/me` tells us whether there is a
 * live BFF session — it replaces the old token-in-storage check. A `null`
 * result (the BFF answered 401) leaves the user logged out.
 */
function useSessionBootstrap(dispatch: AppDispatch): void {
  useEffect(() => {
    let active = true;
    bffAuthClient
      .getCurrentUser()
      .then((user) => {
        if (!active) return;
        if (!isValueDefined(user)) {
          dispatch(setAuthenticated(false));
          return;
        }
        dispatch(setUserInfo(bffUserToKeycloakUserInfo(user)));
        dispatch(setUser(bffUserToNormalizedUser(user)));
        dispatch(setAuthenticated(true));
      })
      .catch((err: unknown) => {
        if (!active) return;
        logger.warn('AuthProvider', 'Session bootstrap (/bff/me) failed', err);
        dispatch(setAuthenticated(false));
      })
      .finally(() => {
        if (active) dispatch(setLoading(false));
      });
    return () => {
      active = false;
    };
  }, [dispatch]);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const loading = useSelector((s: RootState) => s.auth.loading);
  const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);

  const { loginWithPassword, register, applyBffSession } = useAuthOperations(bffAuthClient);

  useSessionBootstrap(dispatch);

  /**
   * End the session via the shared `performBffLogout` sequencer.
   *
   * This used to redirect BEFORE awaiting `bffAuthClient.logout()`. `redirectTo`
   * ends in `window.location.replace()`, and a document navigation cancels
   * in-flight fetches — so `POST /bff/logout` was frequently never sent. The
   * httpOnly session cookie SURVIVED: the UI looked signed out while the server
   * still considered the user authenticated, so navigating back signed them
   * straight in. On a shared machine that is account takeover, and the `catch`
   * logged it "non-fatal", so it never surfaced.
   *
   * It also discarded the return value. `logout()` resolves to the IdP's
   * RP-initiated logout URL (`Promise<string | null>`, not `void`) — dropping it
   * left the Keycloak SSO session alive, the documented "sign out and get signed
   * straight back in" bug.
   *
   * The sequencer owns the ordering (clear local → AWAIT the BFF → navigate
   * exactly once, last). `withLogoutInFlight` closes the second hole the
   * sequencer cannot see on its own: clearing local state re-renders
   * `ProtectedLayout`, whose guard would otherwise fire its own `redirectTo` and
   * unload the document out from under the in-flight POST. See
   * `logoutNavigationGuard.ts`.
   */
  const logout = useCallback(
    async (): Promise<void> =>
      withLogoutInFlight(async () =>
        performBffLogout({
          client: bffAuthClient,
          onClearSession: () => {
            clearClientAuthState(dispatch);
            scheduleLogoutCleanup(dispatch);
          },
          onRedirect: () => redirectTo('/(auth)/login'),
          onError: (error) => logger.warn('AuthProvider', 'Logout step failed (non-fatal)', error),
        }),
      ),
    [dispatch],
  );

  useLogoutButtonEffect(logout);

  return (
    <AuthContext.Provider
      value={{ loginWithPassword, register, applyBffSession, logout, loading, isLoggedIn, userInfo, user, refreshingUserInfo: false }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
