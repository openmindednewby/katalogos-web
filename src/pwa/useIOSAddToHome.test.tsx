import React from "react";

import { act, render } from "@testing-library/react-native";

import { useIOSAddToHome } from "./useIOSAddToHome";
import { isValueDefined } from '../utils/is';

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

describe("useIOSAddToHome", () => {
  beforeEach((): void => {
    jest.useFakeTimers();
  });

  afterEach((): void => {
    jest.useRealTimers();
  });

  it("shows prompt for iOS Safari not in standalone after 2s", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "iPhone",
      configurable: true,
    });
    (window.navigator as unknown as { standalone?: boolean }).standalone = false;

    let result: ReturnType<typeof useIOSAddToHome> | undefined;
    const Probe = (): React.ReactElement | null => {
      result = useIOSAddToHome();
      return null;
    };
    render(<Probe />);
    if (!isValueDefined(result)) throw new Error("Hook not initialized");
    expect(result.showIOSPrompt).toBe(false);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.showIOSPrompt).toBe(true);
    act(() => {
      result?.closeIOSPrompt();
    });
    expect(result.showIOSPrompt).toBe(false);
  });
});
