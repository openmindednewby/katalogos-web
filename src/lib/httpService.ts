/**
 * HTTP service - re-exports from modular http/ directory.
 * This file maintains backwards compatibility with existing imports.
 *
 * For new code, consider importing directly from './http' or specific submodules:
 * - './http/methods' for core HTTP methods (get, post, put, delete)
 * - './http/endpoints' for endpoint-based methods
 * - './http/validation' for file validation
 * - './http/types' for type definitions
 */

export {
  // Types
  type DefaultPayload,
  type FileValidationResult,
  type HttpRequestParams,
  type HttpQueryParams,
  // Validation
  validateFile,
  // Core HTTP methods
  get,
  post,
  put,
  patch,
  postForm,
  deleteMethod,
  // Endpoint-based methods
  getByEndpoint,
  postByEndpoint,
  putByEndpoint,
  deleteByEndpoint,
} from './http';
