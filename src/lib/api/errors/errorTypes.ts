/**
 * Re-export shim for @dloizides/api-client-base error type definitions.
 *
 * The runtime types and enums are defined in the shared
 * `@dloizides/api-client-base` package. This file is kept for backward
 * compatibility with existing imports inside BaseClient.
 */
export type {
  ApiErrorEnvelope,
  ClassifiedError,
  ErrorAction,
  ErrorMatchResult,
  ErrorMatcher,
  ErrorRule,
  StatusRange,
} from '@dloizides/api-client-base';

export { ApiError, ErrorActionType, ErrorSeverity, HttpMethod } from '@dloizides/api-client-base';
