describe("axios wrapper (deffHttp)", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("calls registerInterceptors once at module load time", async () => {
    const mockRegisterInterceptors = jest.fn();
    const mockAxiosInstance = {
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      request: jest.fn(async (cfg: unknown) => ({ data: cfg })),
    };

    jest.doMock("axios", () => ({
      __esModule: true,
      default: { create: jest.fn(() => mockAxiosInstance) },
      create: jest.fn(() => mockAxiosInstance),
    }));
    jest.doMock("./api/interceptors", () => ({
      registerInterceptors: mockRegisterInterceptors,
    }));

    require("./axios");

    expect(mockRegisterInterceptors).toHaveBeenCalledTimes(1);
    expect(mockRegisterInterceptors).toHaveBeenCalledWith(mockAxiosInstance);
  });

  it("sends withCredentials true by default so the BFF session cookie travels", async () => {
    const mockRegisterInterceptors = jest.fn();
    const mockAxiosInstance = {
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      request: jest.fn(async (cfg: Record<string, unknown>) => ({ data: cfg })),
    };

    jest.doMock("axios", () => ({
      __esModule: true,
      default: { create: jest.fn(() => mockAxiosInstance) },
      create: jest.fn(() => mockAxiosInstance),
    }));
    jest.doMock("./api/interceptors", () => ({
      registerInterceptors: mockRegisterInterceptors,
    }));

    const { deffHttp } = require("./axios");

    await deffHttp.get({ url: "/x" });
    const calledCfg = mockAxiosInstance.request.mock.calls[0]?.[0];
    expect(calledCfg.withCredentials).toBe(true);
  });

  it("does NOT attach a _withToken flag — post-BFF-cutover the SPA holds no token", async () => {
    const mockRegisterInterceptors = jest.fn();
    const mockAxiosInstance = {
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      request: jest.fn(async (cfg: Record<string, unknown>) => ({ data: cfg })),
    };

    jest.doMock("axios", () => ({
      __esModule: true,
      default: { create: jest.fn(() => mockAxiosInstance) },
      create: jest.fn(() => mockAxiosInstance),
    }));
    jest.doMock("./api/interceptors", () => ({
      registerInterceptors: mockRegisterInterceptors,
    }));

    const { deffHttp } = require("./axios");

    await deffHttp.get({ url: "/x" }, { withToken: false });
    const calledCfg = mockAxiosInstance.request.mock.calls[0]?.[0];
    expect(calledCfg).not.toHaveProperty("_withToken");
  });

  it("merges custom headers from options onto the config", async () => {
    const mockRegisterInterceptors = jest.fn();
    const mockAxiosInstance = {
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      request: jest.fn(async (cfg: Record<string, unknown>) => ({ data: cfg })),
    };

    jest.doMock("axios", () => ({
      __esModule: true,
      default: { create: jest.fn(() => mockAxiosInstance) },
      create: jest.fn(() => mockAxiosInstance),
    }));
    jest.doMock("./api/interceptors", () => ({
      registerInterceptors: mockRegisterInterceptors,
    }));

    const { deffHttp } = require("./axios");

    await deffHttp.post({ url: "/y", headers: { "X-Base": "1" } }, { headers: { "X-Custom": "2" } });
    const calledCfg = mockAxiosInstance.request.mock.calls[0]?.[0];
    const headers = calledCfg.headers as Record<string, string>;
    expect(headers["X-Base"]).toBe("1");
    expect(headers["X-Custom"]).toBe("2");
  });

  it("passes withCredentials false when option is false", async () => {
    const mockRegisterInterceptors = jest.fn();
    const mockAxiosInstance = {
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      request: jest.fn(async (cfg: Record<string, unknown>) => ({ data: cfg })),
    };

    jest.doMock("axios", () => ({
      __esModule: true,
      default: { create: jest.fn(() => mockAxiosInstance) },
      create: jest.fn(() => mockAxiosInstance),
    }));
    jest.doMock("./api/interceptors", () => ({
      registerInterceptors: mockRegisterInterceptors,
    }));

    const { deffHttp } = require("./axios");

    await deffHttp.get({ url: "/z" }, { withCredentials: false });
    const calledCfg = mockAxiosInstance.request.mock.calls[0]?.[0];
    expect(calledCfg.withCredentials).toBe(false);
  });

  it("forwards signal from options to the config", async () => {
    const mockRegisterInterceptors = jest.fn();
    const mockAxiosInstance = {
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      request: jest.fn(async (cfg: Record<string, unknown>) => ({ data: cfg })),
    };

    jest.doMock("axios", () => ({
      __esModule: true,
      default: { create: jest.fn(() => mockAxiosInstance) },
      create: jest.fn(() => mockAxiosInstance),
    }));
    jest.doMock("./api/interceptors", () => ({
      registerInterceptors: mockRegisterInterceptors,
    }));

    const { deffHttp } = require("./axios");

    const controller = new AbortController();
    await deffHttp.get({ url: "/a" }, { signal: controller.signal });
    const calledCfg = mockAxiosInstance.request.mock.calls[0]?.[0];
    expect(calledCfg.signal).toBe(controller.signal);
  });
});
