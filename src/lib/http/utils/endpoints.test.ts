describe("http/endpoints", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("resolves by key name and calls get with interpolated path", async () => {
    const mockGet = jest.fn(async () => ({ ok: true }));
    const mockInterpolate = jest.fn(() => "/resolved");

    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));
    jest.doMock("../../../server/endpointMeta", () => ({
      interpolateEndpoint: (_key: string, _params?: unknown) => mockInterpolate(),
    }));
    jest.doMock("../../../server/endpoints", () => ({
      Endpoints: { GetUsers: "/users" },
    }));
    jest.doMock("./methods", () => ({
      get: mockGet,
      post: jest.fn(),
      put: jest.fn(),
      deleteMethod: jest.fn(),
    }));
    jest.doMock("../../../utils/logger", () => ({
      logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
    }));

     
    const { getByEndpoint } = require("./endpoints");

    await getByEndpoint("GetUsers", { params: { id: 1 }, queryParameters: { q: 1 }, withToken: true, withCredentials: true });
    expect(mockInterpolate).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith("/resolved", { q: 1 }, {
      baseURL: "http://api",
      config: undefined,
      headers: undefined,
      signal: undefined,
      withCredentials: true,
      withToken: true,
    });
  });

  it("resolves by enum value and throws on unknown values", async () => {
    jest.doMock("../../../config/environment", () => ({ __esModule: true, default: { API_URL: "http://api" } }));
    jest.doMock("../../../server/endpointMeta", () => ({ interpolateEndpoint: jest.fn(() => "/resolved") }));
    jest.doMock("../../../server/endpoints", () => ({
      Endpoints: { GetUsers: "/users" },
    }));
    jest.doMock("./methods", () => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      deleteMethod: jest.fn(),
    }));
    const mockLoggerError = jest.fn();
    jest.doMock("../../../utils/logger", () => ({
      logger: { error: mockLoggerError, warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
    }));

     
    const { getByEndpoint } = require("./endpoints");

    await expect(getByEndpoint("/unknown" as unknown as never)).rejects.toThrow("Cannot resolve endpoint key");
    expect(mockLoggerError).toHaveBeenCalled();
  });
});
