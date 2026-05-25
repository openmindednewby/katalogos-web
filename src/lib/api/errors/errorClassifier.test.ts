import { classifyError, extractErrorCode, extractErrorMessage, extractRequestId } from './errorClassifier';

import type { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';

/** Minimal headers shape that satisfies AxiosError['config']['headers'] */
const EMPTY_HEADERS: AxiosHeaders = Object.create(null);

/**
 * Build a partial AxiosError for testing. We use Object.assign to avoid
 * type assertions, which are banned by the linter.
 */
function createAxiosError(overrides: Partial<AxiosError> = {}): AxiosError {
  // @ts-expect-error - minimal AxiosError mock for testing
  const base: AxiosError = Object.assign(new Error('Request failed'), {
    config: { url: '/api/test', method: 'get', headers: EMPTY_HEADERS },
    response: undefined,
    isAxiosError: true,
    name: 'AxiosError',
    code: undefined,
    toJSON: () => ({}),
  });

  return Object.assign(base, overrides);
}

function createAxiosResponse(overrides: Partial<AxiosResponse> = {}): AxiosResponse {
  const base: AxiosResponse = {
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: EMPTY_HEADERS },
  };
  return Object.assign(base, overrides);
}

describe('errorClassifier', () => {
  describe('extractErrorCode', () => {
    it('extracts code from data.code', () => {
      expect(extractErrorCode({ code: 'VALIDATION_ERROR' })).toBe('VALIDATION_ERROR');
    });

    it('extracts code from data.errorCode', () => {
      expect(extractErrorCode({ errorCode: 'FEATURE_GATED' })).toBe('FEATURE_GATED');
    });

    it('extracts code from data.error', () => {
      expect(extractErrorCode({ error: 'UNAUTHORIZED' })).toBe('UNAUTHORIZED');
    });

    it('returns undefined for non-object data', () => {
      expect(extractErrorCode(null)).toBeUndefined();
      expect(extractErrorCode(undefined)).toBeUndefined();
      expect(extractErrorCode('string')).toBeUndefined();
      expect(extractErrorCode(42)).toBeUndefined();
    });

    it('returns undefined when no code fields present', () => {
      expect(extractErrorCode({ message: 'error' })).toBeUndefined();
    });

    it('returns undefined when code is not a string', () => {
      expect(extractErrorCode({ code: 123 })).toBeUndefined();
    });

    it('prefers errorCode over code over error', () => {
      // Aligned with @dloizides/api-client-base — the dloizides-FastEndpoints
      // convention is `errorCode` (not `code`) for the application-level code,
      // so the shared package picks that one first.
      expect(extractErrorCode({ code: 'A', errorCode: 'B', error: 'C' })).toBe('B');
    });
  });

  describe('extractErrorMessage', () => {
    it('extracts message from response.data.message', () => {
      const error = createAxiosError({
        response: createAxiosResponse({ data: { message: 'Validation failed' } }),
      });
      expect(extractErrorMessage(error)).toBe('Validation failed');
    });

    it('extracts message from response.data.detail', () => {
      const error = createAxiosError({
        response: createAxiosResponse({ data: { detail: 'Detailed error info' } }),
      });
      expect(extractErrorMessage(error)).toBe('Detailed error info');
    });

    it('extracts message from response.data.error', () => {
      const error = createAxiosError({
        response: createAxiosResponse({ data: { error: 'Error description' } }),
      });
      expect(extractErrorMessage(error)).toBe('Error description');
    });

    it('extracts message from response.data.title', () => {
      const error = createAxiosError({
        response: createAxiosResponse({ data: { title: 'Error Title' } }),
      });
      expect(extractErrorMessage(error)).toBe('Error Title');
    });

    it('falls back to error.message when data has no message fields', () => {
      const error = createAxiosError({
        message: 'Axios error message',
        response: createAxiosResponse({ data: { something: 'else' } }),
      });
      expect(extractErrorMessage(error)).toBe('Axios error message');
    });

    it('falls back to error.message when data is not an object', () => {
      const error = createAxiosError({
        message: 'Fallback message',
        response: createAxiosResponse({ data: 'plain string' }),
      });
      expect(extractErrorMessage(error)).toBe('Fallback message');
    });

    it('falls back to error.message when no response', () => {
      const error = createAxiosError({
        message: 'Network error',
        response: undefined,
      });
      expect(extractErrorMessage(error)).toBe('Network error');
    });

    it('skips empty string message fields', () => {
      const error = createAxiosError({
        message: 'Fallback',
        response: createAxiosResponse({ data: { message: '', detail: 'Valid detail' } }),
      });
      expect(extractErrorMessage(error)).toBe('Valid detail');
    });
  });

  describe('extractRequestId', () => {
    it('extracts x-request-id header', () => {
      const response = createAxiosResponse({
        headers: { 'x-request-id': 'req-123' },
      });
      expect(extractRequestId(response)).toBe('req-123');
    });

    it('extracts x-correlation-id header', () => {
      const response = createAxiosResponse({
        headers: { 'x-correlation-id': 'corr-456' },
      });
      expect(extractRequestId(response)).toBe('corr-456');
    });

    it('prefers x-request-id over x-correlation-id', () => {
      const response = createAxiosResponse({
        headers: { 'x-request-id': 'req-123', 'x-correlation-id': 'corr-456' },
      });
      expect(extractRequestId(response)).toBe('req-123');
    });

    it('returns undefined when no correlation headers', () => {
      const response = createAxiosResponse({
        headers: { 'content-type': 'application/json' },
      });
      expect(extractRequestId(response)).toBeUndefined();
    });

    it('returns undefined when response is undefined', () => {
      expect(extractRequestId(undefined)).toBeUndefined();
    });

    it('returns undefined for empty header values', () => {
      const response = createAxiosResponse({
        headers: { 'x-request-id': '' },
      });
      expect(extractRequestId(response)).toBeUndefined();
    });
  });

  describe('classifyError', () => {
    it('extracts status from response', () => {
      const error = createAxiosError({
        response: createAxiosResponse({ status: 404, data: {} }),
      });
      const classified = classifyError(error);
      expect(classified.status).toBe(404);
    });

    it('sets status to 0 for network errors (no response)', () => {
      const error = createAxiosError({ response: undefined });
      const classified = classifyError(error);
      expect(classified.status).toBe(0);
    });

    it('sets status to 0 for timeout errors', () => {
      const error = createAxiosError({
        response: undefined,
        code: 'ECONNABORTED',
      });
      const classified = classifyError(error);
      expect(classified.status).toBe(0);
    });

    it('extracts url from config', () => {
      const error = createAxiosError({
        config: { url: '/api/templates/123', method: 'get', headers: EMPTY_HEADERS },
      });
      const classified = classifyError(error);
      expect(classified.url).toBe('/api/templates/123');
    });

    it('defaults url to empty string when config.url is undefined', () => {
      const error = createAxiosError({
        config: { url: undefined, method: 'get', headers: EMPTY_HEADERS },
      });
      const classified = classifyError(error);
      expect(classified.url).toBe('');
    });

    it('resolves HTTP method from config', () => {
      const error = createAxiosError({
        config: { url: '/api/test', method: 'post', headers: EMPTY_HEADERS },
      });
      const classified = classifyError(error);
      expect(classified.method).toBe('POST');
    });

    it('defaults method to GET when not specified', () => {
      const error = createAxiosError({
        config: { url: '/api/test', method: undefined, headers: EMPTY_HEADERS },
      });
      const classified = classifyError(error);
      expect(classified.method).toBe('GET');
    });

    it('extracts errorCode from response body', () => {
      const error = createAxiosError({
        response: createAxiosResponse({ data: { code: 'FEATURE_GATED' } }),
      });
      const classified = classifyError(error);
      expect(classified.errorCode).toBe('FEATURE_GATED');
    });

    it('sets errorCode to ECONNABORTED for timeout errors', () => {
      const error = createAxiosError({
        response: undefined,
        code: 'ECONNABORTED',
      });
      const classified = classifyError(error);
      expect(classified.errorCode).toBe('ECONNABORTED');
    });

    it('includes body from response data', () => {
      const responseData = { message: 'Not found', details: [] };
      const error = createAxiosError({
        response: createAxiosResponse({ data: responseData }),
      });
      const classified = classifyError(error);
      expect(classified.body).toEqual(responseData);
    });

    it('includes timestamp', () => {
      const before = Date.now();
      const error = createAxiosError({
        response: createAxiosResponse({ status: 500 }),
      });
      const classified = classifyError(error);
      const after = Date.now();

      expect(classified.timestamp).toBeGreaterThanOrEqual(before);
      expect(classified.timestamp).toBeLessThanOrEqual(after);
    });

    it('preserves original error reference', () => {
      const error = createAxiosError();
      const classified = classifyError(error);
      expect(classified.originalError).toBe(error);
    });

    it('extracts requestId from response headers', () => {
      const error = createAxiosError({
        response: createAxiosResponse({
          headers: { 'x-request-id': 'abc-123' },
        }),
      });
      const classified = classifyError(error);
      expect(classified.requestId).toBe('abc-123');
    });

    it('handles all valid HTTP methods', () => {
      const methods = ['get', 'post', 'put', 'patch', 'delete'];
      const expected = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      methods.forEach((method, index) => {
        const error = createAxiosError({
          config: { url: '/api/test', method, headers: EMPTY_HEADERS },
        });
        const classified = classifyError(error);
        expect(classified.method).toBe(expected[index]);
      });
    });
  });
});
