import { configureStore } from '@reduxjs/toolkit'

import { loadPersistedState, saveSliceToLocal } from './persist';
import authSlice, { setUser, setUserInfo, setLoading } from './slices/authSlice'
import uiReducer, { setTheme, setLocale } from './slices/uiSlice'
import ThemeMode from '../shared/enums/ThemeMode';
import { isValueDefined } from '../utils/is';
import { logger } from '../utils/logger';

import type { AuthState } from './slices/authSlice'

// Configure which slices are persisted to local storage.
//
// Post-BFF-cutover the auth slice holds NO token — the session is a
// server-side httpOnly cookie. Only the cached `user` / `userInfo` view is
// persisted (so the UI can render instantly while `/bff/me` confirms the
// session), plus `ui` settings. There is nothing session-sensitive to persist
// anymore, so the session-storage persistence path is gone.
const persistConfig = {
  local: ['ui', 'auth'],
};

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch


export const reduxStore = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiReducer,
  },
})

function isPartialAuthState(value: unknown): value is Partial<AuthState> {
  return isValueDefined(value) && typeof value === 'object';
}

function restoreAuthFromPersistedState(persistedAuth: unknown): void {
  if (!isPartialAuthState(persistedAuth)) return;
  try {
    if (isValueDefined(persistedAuth.user)) reduxStore.dispatch(setUser(persistedAuth.user));
    if (isValueDefined(persistedAuth.userInfo)) reduxStore.dispatch(setUserInfo(persistedAuth.userInfo));
    logger.debug('reduxStore', 'Restored cached user view from local storage');
  } catch (authRestoreError) {
    logger.error('reduxStore', 'Failed to restore auth state from local storage', authRestoreError);
  }
}

interface PersistedUiState {
  theme?: string;
  locale?: string;
}

function isPersistedUiState(value: unknown): value is PersistedUiState {
  return isValueDefined(value) && typeof value === 'object';
}

function restoreUiFromPersistedState(persistedUi: unknown): void {
  if (!isPersistedUiState(persistedUi)) return;
  try {
    const isDarkTheme = isValueDefined(persistedUi.theme) && persistedUi.theme === String(ThemeMode.Dark);
    if (isValueDefined(persistedUi.theme)) reduxStore.dispatch(setTheme(isDarkTheme ? ThemeMode.Dark : ThemeMode.Light));
    if (isValueDefined(persistedUi.locale)) reduxStore.dispatch(setLocale(String(persistedUi.locale)));
    logger.debug('reduxStore', 'Restored UI state from local storage');
  } catch (uiRestoreError) {
    logger.error('reduxStore', 'Failed to restore UI state from local storage', uiRestoreError);
  }
}

function isRootStateKey(key: string): key is keyof RootState {
  return key === 'auth' || key === 'ui';
}

/**
 * Persist a slice to local storage when it changes.
 *
 * The auth slice is persisted WITHOUT any token (there is none) — only the
 * cached `user` / `userInfo` view, so a returning visitor sees their UI
 * immediately while `/bff/me` re-validates the cookie session.
 */
function persistLocalSlice(key: string, prevState: RootState, nextState: RootState): void {
  if (!isRootStateKey(key)) return;
  if (prevState[key] === nextState[key]) return;
  if (key === 'auth') {
    const authState = nextState.auth;
    const sanitized = { user: authState.user, userInfo: authState.userInfo };
    saveSliceToLocal(key, sanitized).catch(() => {});
  } else 
    saveSliceToLocal(key, nextState[key]).catch(() => {});
  
}

function subscribeToPersistence(): void {
  let prevState: RootState = reduxStore.getState();
  reduxStore.subscribe(() => {
    const nextState = reduxStore.getState();
    for (const key of persistConfig.local) persistLocalSlice(key, prevState, nextState);
    prevState = nextState;
  });
}

// Initialize persisted state into the store (async). We dispatch actions to
// populate reducers rather than trying to replace the whole preloadedState.
//
// `loading` is left `true` here — `AuthProvider`'s session bootstrap clears it
// after `GET /bff/me` resolves. The clear below is only a safety net in case
// the bootstrap never runs.
async function initReduxStore(): Promise<void> {
  const persisted = await loadPersistedState(persistConfig);
  restoreAuthFromPersistedState(persisted.auth);
  restoreUiFromPersistedState(persisted.ui);
  subscribeToPersistence();
}

initReduxStore().catch((e) => {
  logger.error('reduxStore', 'Store init failed', e);
  // Ensure the loading flag is cleared even on failure so the UI is not stuck
  // on an infinite spinner.
  reduxStore.dispatch(setLoading(false));
});
