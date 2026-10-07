import { configureStore } from '@reduxjs/toolkit'

import { loadPersistedState, saveSliceToLocal } from './persist';
import authSlice, { setUser, setUserInfo, setLoading } from './slices/authSlice'
import uiReducer, { setTheme, setLocale } from './slices/uiSlice'
import ThemeMode from '../shared/enums/ThemeMode';
import { isValueDefined } from '../utils/is';
import { logger } from '../utils/logger';

import type { AuthState } from './slices/authSlice'

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

async function initReduxStore(): Promise<void> {
  const persisted = await loadPersistedState(persistConfig);
  restoreAuthFromPersistedState(persisted.auth);
  restoreUiFromPersistedState(persisted.ui);
  subscribeToPersistence();
}

initReduxStore().catch((e) => {
  logger.error('reduxStore', 'Store init failed', e);
  reduxStore.dispatch(setLoading(false));
});
