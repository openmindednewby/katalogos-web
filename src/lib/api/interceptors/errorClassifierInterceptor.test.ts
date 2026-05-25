 

describe('errorClassifierInterceptor', () => {
  const mockLoggerWarn = jest.fn();
  const mockLoggerError = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    mockLoggerWarn.mockClear();
    mockLoggerError.mockClear();

    jest.doMock('../../../utils/is', () => ({
      isValueDefined: (v: unknown) => v !== null && v !== undefined,
    }));
    jest.doMock('../../../utils/logger', () => ({
      logger: {
        warn: mockLoggerWarn,
        error: mockLoggerError,
        info: jest.fn(),
        debug: jest.fn(),
      },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function loadModule(): {
    registerErrorClassifier: (instance: unknown) => number;
    classifyError: (error: unknown) => unknown;
    handleResponseError: (error: unknown) => Promise<never>;
  } {
    return require('./errorClassifier');
  }

  describe('classifyError', () => {
    it('classifies 4xx errors with status, url, and method', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Request failed with status 404',
        config: { url: '/api/users/123', method: 'get' },
        response: {
          status: 404,
          data: { message: 'User not found' },
          headers: {},
        },
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.status).toBe(404);
      expect(classified.url).toBe('/api/users/123');
      expect(classified.method).toBe('GET');
      expect(classified.message).toBe('User not found');
    });

    it('classifies 5xx errors', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Request failed with status 500',
        config: { url: '/api/process', method: 'post' },
        response: {
          status: 500,
          data: { detail: 'Internal server error occurred' },
          headers: {},
        },
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.status).toBe(500);
      expect(classified.method).toBe('POST');
      expect(classified.message).toBe('Internal server error occurred');
    });

    it('classifies network errors with status 0', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Network Error',
        config: { url: '/api/test', method: 'get' },
        response: undefined,
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.status).toBe(0);
      expect(classified.message).toBe('Network error');
    });

    it('classifies timeout errors', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'timeout of 30000ms exceeded',
        code: 'ECONNABORTED',
        config: { url: '/api/slow', method: 'get' },
        response: undefined,
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.status).toBe(0);
      expect(classified.errorCode).toBe('ECONNABORTED');
      expect(classified.message).toBe('Request timed out');
    });

    it('extracts error code from response body', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Forbidden',
        config: { url: '/api/premium', method: 'get' },
        response: {
          status: 403,
          data: { errorCode: 'FEATURE_GATED' },
          headers: {},
        },
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.errorCode).toBe('FEATURE_GATED');
    });

    it('extracts request ID from response headers', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Failed',
        config: { url: '/api/test', method: 'get' },
        response: {
          status: 500,
          data: {},
          headers: { 'x-request-id': 'req-abc-123' },
        },
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.requestId).toBe('req-abc-123');
    });

    it('defaults url to unknown when config url is missing', () => {
      const { classifyError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Failed',
        config: { method: 'get' },
        response: {
          status: 500,
          data: {},
          headers: {},
        },
      };

      const classified = classifyError(error) as Record<string, unknown>;

      expect(classified.url).toBe('unknown');
    });

    it('includes timestamp', () => {
      const { classifyError } = loadModule();
      const before = Date.now();
      const error = {
        isAxiosError: true,
        message: 'Failed',
        config: { url: '/api/test', method: 'get' },
        response: { status: 500, data: {}, headers: {} },
      };

      const classified = classifyError(error) as Record<string, unknown>;
      const after = Date.now();

      expect(classified.timestamp).toBeGreaterThanOrEqual(before);
      expect(classified.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('handleResponseError', () => {
    it('rejects with the original error for AxiosErrors', async () => {
      const { handleResponseError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Request failed',
        config: { url: '/api/test', method: 'get' },
        response: { status: 400, data: {}, headers: {} },
      };

      await expect(handleResponseError(error)).rejects.toBe(error);
    });

    it('rejects non-Axios errors without classification', async () => {
      const { handleResponseError } = loadModule();
      const error = new Error('Non-axios error');

      await expect(handleResponseError(error)).rejects.toBe(error);
    });

    it('logs a warning for classified errors', async () => {
      const { handleResponseError } = loadModule();
      const error = {
        isAxiosError: true,
        message: 'Bad request',
        config: { url: '/api/test', method: 'post' },
        response: { status: 400, data: { message: 'Validation failed' }, headers: {} },
      };

      await expect(handleResponseError(error)).rejects.toBe(error);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        'errorClassifier',
        expect.stringContaining('HTTP POST /api/test failed'),
        expect.objectContaining({ status: 400 })
      );
    });

    it('passes through non-object errors', async () => {
      const { handleResponseError } = loadModule();

      await expect(handleResponseError('string error')).rejects.toBe('string error');
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });
  });

  describe('registerErrorClassifier', () => {
    it('registers response interceptor on the axios instance', () => {
      const mockUse = jest.fn().mockReturnValue(5);
      const instance = {
        interceptors: { response: { use: mockUse } },
      };

      const { registerErrorClassifier } = loadModule();
      const id = registerErrorClassifier(instance);

      expect(mockUse).toHaveBeenCalledTimes(1);
      expect(id).toBe(5);
    });

    it('passes response through on success', () => {
      const mockUse = jest.fn().mockReturnValue(0);
      const instance = {
        interceptors: { response: { use: mockUse } },
      };

      const { registerErrorClassifier } = loadModule();
      registerErrorClassifier(instance);

      const onFulfilled = mockUse.mock.calls[0][0];
      const response = { data: { ok: true }, status: 200 };
      const result = onFulfilled(response);

      expect(result).toBe(response);
    });

    it('classifies and rejects Axios errors', async () => {
      const mockUse = jest.fn().mockReturnValue(0);
      const instance = {
        interceptors: { response: { use: mockUse } },
      };

      const { registerErrorClassifier } = loadModule();
      registerErrorClassifier(instance);

      const onRejected = mockUse.mock.calls[0][1];
      const error = {
        isAxiosError: true,
        message: 'Server Error',
        config: { url: '/api/data', method: 'get' },
        response: { status: 500, data: {}, headers: {} },
      };

      await expect(onRejected(error)).rejects.toBe(error);
      expect(mockLoggerWarn).toHaveBeenCalled();
    });
  });
});
