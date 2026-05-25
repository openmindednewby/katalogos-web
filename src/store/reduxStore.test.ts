describe("reduxStore", () => {
  async function flushPromises(): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    sessionStorage.clear();
  });

  it("restores the persisted ui + cached user view on import (no tokens — BFF era)", async () => {
    const mockLoadPersistedState = jest.fn(async () => ({
      ui: { theme: "dark", locale: "el" },
      auth: { user: { sub: "u1" }, userInfo: { preferred_username: "user1" } },
    }));
    const mockSaveSliceToLocal = jest.fn(async () => undefined);

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    jest.doMock("./persist", () => ({
      loadPersistedState: mockLoadPersistedState,
      saveSliceToLocal: mockSaveSliceToLocal,
    }));
    jest.doMock("../utils/logger", () => ({ logger: mockLogger }));


    const { reduxStore } = require("./reduxStore");
    await flushPromises();
    await flushPromises();

    const state = reduxStore.getState();
    expect(state.ui).toEqual({ theme: "dark", locale: "el" });
    expect(state.auth.user).toEqual({ sub: "u1" });
    expect(state.auth.userInfo).toEqual({ preferred_username: "user1" });
    // No token fields exist on the auth slice anymore.
    expect(state.auth).not.toHaveProperty("accessToken");
    expect(state.auth).not.toHaveProperty("refreshToken");

    expect(mockLoadPersistedState).toHaveBeenCalledWith({ local: ["ui", "auth"] });
    expect(mockLogger.debug).toHaveBeenCalled();
  });

  it("persists ui + the cached user view to local storage after init", async () => {
    const mockLoadPersistedState = jest.fn(async () => ({}));
    const mockSaveSliceToLocal = jest.fn(async () => undefined);

    jest.doMock("./persist", () => ({
      loadPersistedState: mockLoadPersistedState,
      saveSliceToLocal: mockSaveSliceToLocal,
    }));
    jest.doMock("../utils/logger", () => ({
      logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    }));


    const { reduxStore } = require("./reduxStore");

    const { setTheme } = require("./slices/uiSlice");

    const { setUser } = require("./slices/authSlice");

    await flushPromises();
    await flushPromises();

    reduxStore.dispatch(setTheme("dark"));
    expect(mockSaveSliceToLocal).toHaveBeenCalledWith("ui", expect.objectContaining({ theme: "dark" }));

    reduxStore.dispatch(setUser({ id: "u1", username: "user1", roles: [] }));
    expect(mockSaveSliceToLocal).toHaveBeenCalledWith(
      "auth",
      expect.objectContaining({ user: expect.objectContaining({ id: "u1" }) }),
    );
  });
});
