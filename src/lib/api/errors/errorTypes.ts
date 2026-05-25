/**
 * Re-export shim for @dloizides/api-client-base error type definitions.
 *
 * The runtime types and enums are defined in the shared
 * `@dloizides/api-client-base` package. This file is kept for backward
 * compatibility with existing imports inside BaseClient.
 */
import type HttpMethodLocal from '../../../shared/enums/HttpMethod';

/** HTTP methods supported by the error handling system. */
export type HttpMethod = HttpMethodLocal;

export type {
  ApiErrorEnvelope,
  ClassifiedError,
  ErrorAction,
  ErrorMatchResult,
  ErrorMatcher,
  ErrorRule,
  StatusRange,
} from '@dloizides/api-client-base';

export { ApiError, ErrorActionType, ErrorSeverity } from '@dloizides/api-client-base';
