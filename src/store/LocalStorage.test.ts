describe("LocalStorage", () => {
  let originalLocalStorage: Storage | undefined;

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    if (originalLocalStorage) {
      Object.defineProperty(global, "localStorage", { value: originalLocalStorage, configurable: true });
      originalLocalStorage = undefined;
    }
  });

  it("uses window.localStorage on web", async () => {
    originalLocalStorage = global.localStorage;
    const localStorageMock = {
      getItem: jest.fn(() => "v1"),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(global, "localStorage", { value: localStorageMock, configurable: true });

    const { LocalStorage } = require("./LocalStorage");

    await expect(LocalStorage.getItem("k1")).resolves.toBe("v1");
    await LocalStorage.setItem("k2", "v2");
    await LocalStorage.deleteItem("k3");

    expect(localStorageMock.getItem).toHaveBeenCalledWith("k1");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("k2", "v2");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("k3");
  });

  it("uses SecureStore on native (no window)", async () => {
    const globalWithWindow = globalThis as typeof globalThis & { window?: unknown };
    const originalWindow = globalWithWindow.window;
    // Simulate non-web at module evaluation time
    // @ts-expect-error -- deleting window to simulate non-web environment
    delete globalWithWindow.window;

    const mockGetItemAsync = jest.fn(async () => "v1");
    const mockSetItemAsync = jest.fn(async () => undefined);
    const mockDeleteItemAsync = jest.fn(async () => undefined);
    jest.doMock("expo-secure-store", () => ({
      getItemAsync: mockGetItemAsync,
      setItemAsync: mockSetItemAsync,
      deleteItemAsync: mockDeleteItemAsync,
    }));

    const { LocalStorage } = require("./LocalStorage");

    await expect(LocalStorage.getItem("k1")).resolves.toBe("v1");
    await LocalStorage.setItem("k2", "v2");
    await LocalStorage.deleteItem("k3");

    expect(mockGetItemAsync).toHaveBeenCalledWith("k1");
    expect(mockSetItemAsync).toHaveBeenCalledWith("k2", "v2");
    expect(mockDeleteItemAsync).toHaveBeenCalledWith("k3");

    globalWithWindow.window = originalWindow;
  });
});
