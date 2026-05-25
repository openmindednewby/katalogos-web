/**
 * Tests for httpService re-exports.
 * Ensures all exports from the http module are accessible.
 */
import {
  type DefaultPayload,
  type FileValidationResult,
  type HttpRequestParams,
  type HttpQueryParams,
  validateFile,
  get,
  post,
  put,
  patch,
  postForm,
  deleteMethod,
  getByEndpoint,
  postByEndpoint,
  putByEndpoint,
  deleteByEndpoint,
} from './httpService';

describe('httpService re-exports', () => {
  describe('function exports', () => {
    it('exports validateFile function', () => {
      expect(typeof validateFile).toBe('function');
    });

    it('exports get function', () => {
      expect(typeof get).toBe('function');
    });

    it('exports post function', () => {
      expect(typeof post).toBe('function');
    });

    it('exports put function', () => {
      expect(typeof put).toBe('function');
    });

    it('exports patch function', () => {
      expect(typeof patch).toBe('function');
    });

    it('exports postForm function', () => {
      expect(typeof postForm).toBe('function');
    });

    it('exports deleteMethod function', () => {
      expect(typeof deleteMethod).toBe('function');
    });

    it('exports getByEndpoint function', () => {
      expect(typeof getByEndpoint).toBe('function');
    });

    it('exports postByEndpoint function', () => {
      expect(typeof postByEndpoint).toBe('function');
    });

    it('exports putByEndpoint function', () => {
      expect(typeof putByEndpoint).toBe('function');
    });

    it('exports deleteByEndpoint function', () => {
      expect(typeof deleteByEndpoint).toBe('function');
    });
  });

  describe('type exports compile correctly', () => {
    it('DefaultPayload type is usable', () => {
      const payload: DefaultPayload = { test: 'value' };
      expect(payload).toBeDefined();
    });

    it('FileValidationResult type is usable', () => {
      const result: FileValidationResult = { valid: true };
      expect(result).toBeDefined();
    });

    it('HttpRequestParams type is usable', () => {
      const params: HttpRequestParams = {
        endpoint: '/test',
      };
      expect(params).toBeDefined();
    });

    it('HttpQueryParams type is usable', () => {
      const query: HttpQueryParams = {
        endpoint: '/test',
        queryParameters: { key: 'value' },
      };
      expect(query).toBeDefined();
    });
  });
});
