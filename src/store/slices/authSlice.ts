import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { NormalizedUser, KeycloakUserInfo } from '../../auth/keycloakTypes'

/** Auth slice — BFF era. */
export interface AuthState {
  isLoggedIn: boolean;
  user: NormalizedUser | null;
  userInfo: KeycloakUserInfo | null;
  loading: boolean;
  refreshingUserInfo: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  userInfo: null,
  loading: true,
  refreshingUserInfo: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      return { ...state, isLoggedIn: action.payload };
    },
    clearSession: (state) => {
      return { ...state, isLoggedIn: false, user: null, userInfo: null };
    },
    setUser: (state, action: PayloadAction<NormalizedUser | null>) => {
      return { ...state, user: action.payload };
    },
    setUserInfo: (state, action: PayloadAction<KeycloakUserInfo | null>) => {
      return { ...state, userInfo: action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      return { ...state, loading: action.payload };
    },
    setRefreshingUserInfo: (state, action: PayloadAction<boolean>) => {
      return { ...state, refreshingUserInfo: action.payload };
    },
  },
})

export const { setAuthenticated, clearSession, setUser, setUserInfo, setLoading, setRefreshingUserInfo } = authSlice.actions
export default authSlice.reducer
