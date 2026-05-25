describe("navigation", () => {
  const globalWithWindow = globalThis as typeof globalThis & { window?: unknown };
  const originalWindow = globalWithWindow.window;

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    globalWithWindow.window = originalWindow;
  });

  it("queues redirects until a handler is set, then flushes in order", () => {
    // Simulate native/non-web environment so we don't trigger jsdom navigation
    // @ts-expect-error -- deleting window to simulate non-web environment
    delete globalWithWindow.window;

    const { redirectTo, setRedirectHandler } = require("./navigation");

    const handler = jest.fn();
    redirectTo("/a");
    redirectTo("/b");

    setRedirectHandler(handler);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, "/a");
    expect(handler).toHaveBeenNthCalledWith(2, "/b");
  });

  it("uses handler immediately when set", () => {
    // @ts-expect-error -- deleting window to simulate non-web environment
    delete globalWithWindow.window;

    const { redirectTo, setRedirectHandler } = require("./navigation");

    const handler = jest.fn();
    setRedirectHandler(handler);
    redirectTo("/c");
    expect(handler).toHaveBeenCalledWith("/c");
  });
});
