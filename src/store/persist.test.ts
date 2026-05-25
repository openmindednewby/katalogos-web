describe("persist", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("loadPersistedState loads local + session slices (web) and ignores invalid JSON", async () => {
    const mockLocalStorage = {
      getItem: jest.fn(async (k: string) => {
        if (k === "persist:ui") return JSON.stringify({ theme: "dark" });
        if (k === "persist:bad") return "{not-json";
        return null;
      }),
      setItem: jest.fn(async () => undefined),
      deleteItem: jest.fn(async () => undefined),
    };
    jest.doMock("./LocalStorage", () => ({ LocalStorage: mockLocalStorage }));

    sessionStorage.setItem("persist:auth", JSON.stringify({ accessToken: "a1" }));
    sessionStorage.setItem("persist:sessionBad", "{not-json");

    const { loadPersistedState } = require("./persist");

    const state = await loadPersistedState({
      local: ["ui", "bad"],
      session: ["auth", "sessionBad"],
    });

    expect(state).toEqual({
      ui: { theme: "dark" },
      auth: { accessToken: "a1" },
    });
  });

  it("saveSliceToLocal writes JSON with persist: prefix", async () => {
    const mockSetItem = jest.fn(async () => undefined);
    jest.doMock("./LocalStorage", () => ({
      LocalStorage: { getItem: jest.fn(), setItem: mockSetItem, deleteItem: jest.fn() },
    }));

    const { saveSliceToLocal } = require("./persist");
    await saveSliceToLocal("ui", { theme: "light" });

    expect(mockSetItem).toHaveBeenCalledWith("persist:ui", JSON.stringify({ theme: "light" }));
  });

  it("saveSliceToSession + loadPersistedState uses in-memory session on native (no window)", async () => {
    const globalWithWindow = globalThis as typeof globalThis & { window?: unknown };
    const originalWindow = globalWithWindow.window;
    // @ts-expect-error -- deleting window to simulate non-web environment
    delete globalWithWindow.window;

    jest.doMock("./LocalStorage", () => ({
      LocalStorage: { getItem: jest.fn(), setItem: jest.fn(), deleteItem: jest.fn() },
    }));

    const { saveSliceToSession, loadPersistedState } = require("./persist");
    saveSliceToSession("auth", { accessToken: "a1" });

    const state = await loadPersistedState({ session: ["auth"] });
    expect(state).toEqual({ auth: { accessToken: "a1" } });

    globalWithWindow.window = originalWindow;
  });
});
