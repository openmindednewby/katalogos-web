import React from "react";

import { act, render } from "@testing-library/react-native";

import { isValueDefined } from '../utils/is';

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("usePWAInstall", () => {
  interface UsePWAInstallResult {
    showInstallPrompt: boolean;
    handleInstall: () => Promise<void>;
    closePrompt: () => void;
    isInstalled: boolean;
  }

  afterEach((): void => {
    jest.resetModules();
    delete (window as unknown as { deferredPrompt?: unknown }).deferredPrompt;
  });

  it("shows prompt when beforeinstallprompt fires and hides after handleInstall", async () => {
    const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    jest.doMock("../utils/logger", () => ({ logger: mockLogger }));

    const prompt = jest.fn();
    const deferredPrompt: unknown = {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };
    (window as unknown as { deferredPrompt?: unknown }).deferredPrompt = deferredPrompt;

     
    const { usePWAInstall } = require("./usePWAInstall") as { usePWAInstall: () => UsePWAInstallResult };

    let result: UsePWAInstallResult | undefined;
    const Probe = (): React.ReactElement | null => {
      result = usePWAInstall();
      return null;
    };
    render(<Probe />);

    if (!isValueDefined(result)) throw new Error("Hook not initialized");
    expect(result.showInstallPrompt).toBe(true);

    await act(async () => {
      await result!.handleInstall();
    });

    expect(prompt).toHaveBeenCalled();
    expect(result.showInstallPrompt).toBe(false);
    expect(mockLogger.info).toHaveBeenCalled();
  });
});
