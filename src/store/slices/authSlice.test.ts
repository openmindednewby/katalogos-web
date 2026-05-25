import reducer, {
  clearSession,
  setAuthenticated,
  setLoading,
  setRefreshingUserInfo,
  setUser,
  setUserInfo,
} from "./authSlice";

import type { KeycloakUserInfo, NormalizedUser } from "../../auth/keycloakTypes";

describe("authSlice", () => {
  it("returns initial state (no token fields — BFF era)", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      isLoggedIn: false,
      user: null,
      userInfo: null,
      loading: true,
      refreshingUserInfo: false,
    });
  });

  it("setAuthenticated(true) marks the session logged in", () => {
    const state = reducer(undefined, setAuthenticated(true));
    expect(state.isLoggedIn).toBe(true);
  });

  it("setAuthenticated(false) marks the session logged out", () => {
    const loggedIn = reducer(undefined, setAuthenticated(true));
    const state = reducer(loggedIn, setAuthenticated(false));
    expect(state.isLoggedIn).toBe(false);
  });

  it("clearSession clears isLoggedIn, user and userInfo", () => {
    const user: NormalizedUser = { id: "u1", username: "user1", roles: [] };
    const authed = reducer(undefined, setAuthenticated(true));
    const withUser = reducer(authed, setUser(user));
    const populated = reducer(withUser, setUserInfo({ preferred_username: "user1", roles: [] }));
    const cleared = reducer(populated, clearSession());
    expect(cleared.isLoggedIn).toBe(false);
    expect(cleared.user).toBeNull();
    expect(cleared.userInfo).toBeNull();
  });

  it("setUser sets user", () => {
    const user: NormalizedUser = { id: "u1", username: "user1", roles: [] };
    const state = reducer(undefined, setUser(user));
    expect(state.user).toEqual(user);
  });

  it("setUserInfo sets userInfo", () => {
    const userInfo: KeycloakUserInfo = { preferred_username: "user1", roles: [] };
    const state = reducer(undefined, setUserInfo(userInfo));
    expect(state.userInfo).toEqual(userInfo);
  });

  it("setLoading sets loading", () => {
    const state = reducer(undefined, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it("setRefreshingUserInfo sets refreshingUserInfo", () => {
    const state = reducer(undefined, setRefreshingUserInfo(true));
    expect(state.refreshingUserInfo).toBe(true);
  });
});
