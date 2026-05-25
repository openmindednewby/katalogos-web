jest.mock("react-native", () => ({
  Platform: { OS: "web", Version: "1.0" },
}));

describe("logger (deprecated wrapper)", () => {
  const mockDebug = jest.fn();
  const mockInfo = jest.fn();
  const mockWarn = jest.fn();
  const mockError = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    mockDebug.mockClear();
    mockInfo.mockClear();
    mockWarn.mockClear();
    mockError.mockClear();
  });

  it("delegates debug() to loggingService.debug()", () => {
    jest.doMock("../lib/logging", () => ({
      loggingService: {
        debug: mockDebug,
        info: mockInfo,
        warn: mockWarn,
        error: mockError,
      },
    }));

    const { logger } = require("./logger") as {
      logger: { debug: (c: string, m: string, d?: unknown) => void };
    };

    logger.debug("Auth", "test", { a: 1 });

    expect(mockDebug).toHaveBeenCalledWith("Auth", "test", { a: 1 });
  });

  it("delegates info() to loggingService.info()", () => {
    jest.doMock("../lib/logging", () => ({
      loggingService: {
        debug: mockDebug,
        info: mockInfo,
        warn: mockWarn,
        error: mockError,
      },
    }));

    const { logger } = require("./logger") as {
      logger: { info: (c: string, m: string, d?: unknown) => void };
    };

    logger.info("Export", "Done");

    expect(mockInfo).toHaveBeenCalledWith("Export", "Done", undefined);
  });

  it("delegates warn() to loggingService.warn()", () => {
    jest.doMock("../lib/logging", () => ({
      loggingService: {
        debug: mockDebug,
        info: mockInfo,
        warn: mockWarn,
        error: mockError,
      },
    }));

    const { logger } = require("./logger") as {
      logger: { warn: (c: string, m: string, d?: unknown) => void };
    };

    logger.warn("Cache", "miss");

    expect(mockWarn).toHaveBeenCalledWith("Cache", "miss", undefined);
  });

  it("delegates error() with Error instance to loggingService.error()", () => {
    jest.doMock("../lib/logging", () => ({
      loggingService: {
        debug: mockDebug,
        info: mockInfo,
        warn: mockWarn,
        error: mockError,
      },
    }));

    const { logger } = require("./logger") as {
      logger: { error: (c: string, m: string, e?: unknown) => void };
    };

    const err = new Error("boom");
    logger.error("Auth", "Failed", err);

    expect(mockError).toHaveBeenCalledWith("Auth", "Failed", err);
  });

  it("passes undefined when error is not an Error instance", () => {
    jest.doMock("../lib/logging", () => ({
      loggingService: {
        debug: mockDebug,
        info: mockInfo,
        warn: mockWarn,
        error: mockError,
      },
    }));

    const { logger } = require("./logger") as {
      logger: { error: (c: string, m: string, e?: unknown) => void };
    };

    logger.error("Auth", "Failed", "string-error");

    expect(mockError).toHaveBeenCalledWith("Auth", "Failed", undefined);
  });
});
