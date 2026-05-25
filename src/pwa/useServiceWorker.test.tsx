import React from "react";

import { act, render } from "@testing-library/react-native";

import type { useServiceWorker as UseServiceWorkerHookType } from "./useServiceWorker";

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("useServiceWorker", () => {
  afterEach((): void => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("registers service worker on window load when enabled", async () => {
    process.env.NODE_ENV = "test";
    process.env.EXPO_PUBLIC_ENABLE_PWA_PROMPTS = "true";

    const mockRegister = jest.fn(async () => Promise.resolve({ scope: "/" }));
    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: mockRegister },
      configurable: true,
      writable: true,
    });

    const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    jest.doMock("../utils/logger", () => ({ logger: mockLogger }));

    const { useServiceWorker } = require("./useServiceWorker") as { useServiceWorker: typeof UseServiceWorkerHookType };

    const Probe = (): React.ReactElement | null => {
      useServiceWorker();
      return null;
    };
    render(<Probe />);

    await act(async () => {
      window.dispatchEvent(new Event("load"));
      await Promise.resolve();
    });

    expect(mockRegister).toHaveBeenCalledWith("/service-worker.js");
  });
});
