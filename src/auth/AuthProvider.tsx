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
  applyBffSession: (user: BffUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


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
      // eslint-disable-next-line no-empty
      } catch {
      }
    };

    const events: Array<keyof DocumentEventMap> = ['click', 'pointerup', 'touchend'];
    for (const ev of events) document.addEventListener(ev, handler, true);
    return () => {
      for (const ev of events) document.removeEventListener(ev, handler, true);
    };
  }, [logout]);
}

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
