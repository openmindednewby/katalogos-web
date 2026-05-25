/**
 * Re-export shim for @dloizides/api-client-base classifier helpers.
 *
 * The pure classifier and envelope-extraction helpers live in the shared
 * `@dloizides/api-client-base` package. BaseClient still exposes its
 * historical surface — `classifyError(AxiosError)`,
 * `extractErrorMessage(AxiosError)`, `extractRequestId(AxiosResponse | undefined)`
 * — as thin adapters around the package primitives so the rest of the app
 * keeps working unchanged.
 */
import {
  classifyAxiosError,
  extractErrorCode,
  extractErrorMessage as extractErrorMessageFromBody,
  extractRequestId as extractRequestIdFromHeaders,
} from '@dloizides/api-client-base';

import { isValueDefined } from '../../../utils/is';

import type { ClassifiedError } from '@dloizides/api-client-base';
import type { AxiosError, AxiosResponse } from 'axios';

/** Convert an AxiosError into a ClassifiedError. */
function classifyError(error: AxiosError): ClassifiedError {
  return classifyAxiosError(error);
}

/** Extract a user-facing message from an AxiosError. */
function extractErrorMessage(error: AxiosError): string {
  return extractErrorMessageFromBody(error.response?.data, error.message);
}

/** Extract a request ID from an Axios response (if any). */
function extractRequestId(response: AxiosResponse | undefined): string | undefined {
  if (!isValueDefined(response)) return undefined;
  return extractRequestIdFromHeaders(response.headers);
}

export { classifyError, extractErrorCode, extractErrorMessage, extractRequestId };
