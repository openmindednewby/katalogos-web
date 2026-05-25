import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { NormalizedUser, KeycloakUserInfo } from '../../auth/keycloakTypes'

/**
 * Auth slice — BFF era.
 *
 * After the Phase 2 BFF cutover the session is a server-side httpOnly cookie
 * (`__Host-bff-katalogos`). The SPA cannot and must not read or hold a token,
 * so this slice no longer carries `accessToken` / `refreshToken`. It holds
 * only the *derived* session view the UI needs: whether there is a session
 * (`isLoggedIn`), the current user, and bootstrap `loading`.
 *
 * `isLoggedIn` is driven by `BffAuthClient.getCurrentUser()` (`GET /bff/me`)
 * at app load, and by `login` / `logout` thereafter.
 */
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
    /** Marks a live BFF session — set after a successful `/bff/login` or `/bff/me`. */
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      return { ...state, isLoggedIn: action.payload };
    },
    /** Clears the session view on logout / a 401 from the BFF. */
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
