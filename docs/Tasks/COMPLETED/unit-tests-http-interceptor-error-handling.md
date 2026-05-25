# Unit Tests for HTTP Interceptor & Error Handling System

## Status: COMPLETED

## Problem Statement
The new HTTP error handling system (Tasks 1-3) at `src/lib/api/` lacked unit test coverage. Comprehensive tests were needed for all modules: error registry, error matcher, error actions, error classifier, API event bus, token refresh, auth interceptor, and error classifier interceptor.

## Implementation Plan
Created 8 test files covering all exported functions and classes in `src/lib/api/`.

## Files Created
- `src/lib/api/errors/__tests__/errorRegistry.test.ts` (7 tests)
- `src/lib/api/errors/__tests__/errorMatcher.test.ts` (30 tests)
- `src/lib/api/errors/__tests__/errorActions.test.ts` (16 tests)
- `src/lib/api/errors/__tests__/errorClassifier.test.ts` (26 tests)
- `src/lib/api/events/__tests__/apiEventBus.test.ts` (14 tests)
- `src/lib/api/__tests__/tokenRefresh.test.ts` (18 tests)
- `src/lib/api/interceptors/__tests__/authInterceptor.test.ts` (8 tests)
- `src/lib/api/interceptors/__tests__/errorClassifierInterceptor.test.ts` (11 tests)

## Test Coverage Summary

### errorRegistry (7 tests)
- Default rules sorted by priority descending
- `registerErrorRule()` adds rules and re-sorts
- Custom rules respect priority ordering
- Duplicate rule names handled (both kept)
- `resetErrorRules()` restores defaults
- `isAuthEndpoint()` for all auth patterns and non-auth endpoints

### errorMatcher (30 tests)
- `matchesStatus`: exact, array, range matching
- `matchesPath`: string substring, regex matching
- `matchesMethod`: exact, case-insensitive, array matching
- `matchesRule`: AND logic (all fields), unspecified fields, empty matcher, bodyField
- `matchError`: default rules, priority ordering, skipIf, first-match-wins, custom rules, all HTTP status categories

### errorActions (16 tests)
- `executeErrorAction`: toast/modal/redirect/silent/retry/custom action types
- Default modal component and redirect target
- `reportToMonitoring` called only when flag is true
- Default severity fallback
- `resolveMessage`: i18n key, fallback chain, error.message, generic message
- Custom handler registration, execution, error catching, unregistration

### errorClassifier (26 tests)
- `extractErrorCode`: code/errorCode/error fields, priority, non-object/non-string inputs
- `extractErrorMessage`: message/detail/error/title fields, fallback chain, empty strings
- `extractRequestId`: x-request-id, x-correlation-id, priority, undefined response
- `classifyError`: status extraction, network errors, timeouts, url/method resolution, errorCode, body, timestamp, requestId, all HTTP methods

### apiEventBus (14 tests)
- Subscribe/emit: single and multiple subscribers, multiple events
- Unsubscribe: stops receiving, other subscribers unaffected, safe double-unsubscribe
- Error isolation: throwing listener does not affect others
- `clear()`: removes all listeners
- Independent instances do not share state
- All event types: toast, modal, redirect, session-expired, maintenance-mode

### tokenRefresh (18 tests)
- `isAuthEndpoint`: all auth patterns, non-auth, undefined, empty string
- `refreshAuthToken`: successful refresh, missing/empty token, session-expired on failure, concurrent deduplication, invalid response format
- `registerTokenRefreshInterceptor`: registration, non-401 passthrough, auth endpoint skip, retry flag skip, session-expired emission, retry with new token

### authInterceptor (8 tests)
- Token attached when available
- Token not attached when `_withToken: false`
- Token not attached when null or empty
- Default behavior attaches token
- Returns config object
- Registration on axios instance

### errorClassifierInterceptor (11 tests)
- 4xx/5xx classification with status, url, method
- Network errors (status 0), timeout errors (ECONNABORTED)
- Error code and request ID extraction
- `handleResponseError`: rejects with original error, non-Axios passthrough, logging
- `registerErrorClassifier`: registration, success passthrough, error classification

## Success Criteria
- [x] All 8 test files created
- [x] All 170 tests pass (9 suites including pre-existing useApiEvents)
- [x] Full project suite: 1742 tests pass, 132 suites, 0 failures
- [x] ESLint clean on all test files
- [x] Tests focus on logic, not rendering
- [x] Tests cover happy paths and edge cases
- [x] Proper mocking of dependencies (i18n, Redux store, logger, event bus)
- [x] No type assertions in test files (used Object.assign pattern instead)
