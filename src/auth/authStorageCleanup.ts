/**
 * Storage cleanup utilities for authentication logout flow.
 * Extracted from AuthProvider to maintain file size limits.
 */
import { clearAllThemeCaches } from '../lib/theme';
import { STORAGE_KEYS } from '../shared/constants';
import { clearSession, setUser, setUserInfo } from '../store/slices/authSlice';
import { logger } from '../utils/logger';

import type { AppDispatch } from '../store/reduxStore';

// Token refresh delay constants for logout cleanup
const LOGOUT_CLEANUP_DELAY_IMMEDIATE = 0;
const LOGOUT_CLEANUP_DELAY_SHORT = 50;
const LOGOUT_CLEANUP_DELAY_DEFAULT = 200;
const LOGOUT_CLEANUP_DELAY_MEDIUM = 500;
const LOGOUT_CLEANUP_DELAY_LONG = 1000;
const LOGOUT_CLEANUP_DELAYS = [
  LOGOUT_CLEANUP_DELAY_IMMEDIATE,
  LOGOUT_CLEANUP_DELAY_SHORT,
  LOGOUT_CLEANUP_DELAY_DEFAULT,
  LOGOUT_CLEANUP_DELAY_MEDIUM,
  LOGOUT_CLEANUP_DELAY_LONG,
];

function safeWarn(context: string, message: string, data?: unknown): void {
  try {
    logger.warn(context, message, data);
  } catch {
    // ignore
  }
}

export function clearClientAuthState(dispatch: AppDispatch): void {
  dispatch(clearSession());
  dispatch(setUser(null));
  dispatch(setUserInfo(null));
}

function clearSessionStorage(): void {
  const safeSession = (fn: () => void): void => {
    try {
      fn();
    } catch (e) {
      safeWarn('AuthProvider', 'Failed to clear sessionStorage during logout', e);
    }
  };

  safeSession(() => sessionStorage.removeItem(STORAGE_KEYS.AUTH_PERSIST));
  safeSession(() => sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN));
  safeSession(() => sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN));
  safeSession(() => {
    if (typeof sessionStorage.setItem === 'function') {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, '');
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, '');
    }
  });
  safeSession(() => {
    if (typeof sessionStorage.clear === 'function') sessionStorage.clear();
  });
}

function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_PERSIST);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    clearAllThemeCaches();
  } catch (localStorageError) {
    safeWarn('AuthProvider', 'Failed to clear localStorage during logout', localStorageError);
  }
}

function clearWebAuthStorage(): void {
  clearSessionStorage();
  clearLocalStorage();
}

export function scheduleLogoutCleanup(dispatch: AppDispatch): void {
  if (typeof window === 'undefined') return;

  try {
    clearWebAuthStorage();
    if (typeof window.setTimeout === 'function') 
      for (const delayMs of LOGOUT_CLEANUP_DELAYS) {
        window.setTimeout(clearWebAuthStorage, delayMs);
        window.setTimeout(() => clearClientAuthState(dispatch), delayMs);
      }
    
  } catch (webStorageError) {
    safeWarn('AuthProvider', 'Failed to schedule web storage cleanup during logout', webStorageError);
  }
}
