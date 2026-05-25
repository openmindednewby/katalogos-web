# Task 6: Unit Tests for Interceptor & Error Handling System

> **Reference**: `http-interceptor-architecture.md`
> **Agent**: `frontend-dev`
> **Status**: TODO
> **Estimated Scope**: ~8 test files, ~1200 lines
> **Dependencies**: Tasks 1-5 (all implementation + migration)

## Problem Statement

All new modules need comprehensive unit tests following the project's testing philosophy: test logic, not rendering.

## Test Plan

### 1. Error Registry Tests

**Create**: `src/lib/api/errors/__tests__/errorRegistry.test.ts`

Test:
- Default rules are returned sorted by priority
- `registerErrorRule()` adds rules to the registry
- Custom rules respect priority ordering
- Duplicate rule names are handled gracefully
- `getErrorRules()` returns immutable copy (no mutation of internal state)

### 2. Error Matcher Tests

**Create**: `src/lib/api/errors/__tests__/errorMatcher.test.ts`

Test all matching logic:

| Scenario | Test |
|----------|------|
| Exact status match | `match: { status: 401 }` matches 401, doesn't match 403 |
| Status array match | `match: { status: [400, 422] }` matches both |
| Status range match | `match: { status: { min: 500, max: 599 } }` matches 500, 503, 599, not 499 |
| Path string match | `match: { path: '/api/users' }` matches URL containing path |
| Path regex match | `match: { path: /\/templates\/\d+/ }` matches correctly |
| Method match | `match: { method: 'POST' }` matches POST, not GET |
| Method array match | `match: { method: ['POST', 'PUT'] }` matches both |
| Error code match | `match: { errorCode: 'FEATURE_GATED' }` matches body error code |
| AND logic | All fields must match when multiple specified |
| Unspecified fields | Missing fields match anything |
| Priority ordering | Higher priority rules matched first |
| skipIf callback | Rule skipped when callback returns true |
| No match | Returns `{ matched: false }` when nothing matches |
| First match wins | Only first matching rule returned |

### 3. Error Actions Tests

**Create**: `src/lib/api/errors/__tests__/errorActions.test.ts`

Test:
- `executeErrorAction` with toast rule → emits toast event
- `executeErrorAction` with modal rule → emits modal event
- `executeErrorAction` with redirect rule → emits redirect event
- `executeErrorAction` with silent rule → no event emitted
- `executeErrorAction` with reportToMonitoring → calls reporter
- Message resolution: i18n key → fallback → error message → generic
- Custom handler execution

### 4. Error Classifier Tests

**Create**: `src/lib/api/errors/__tests__/errorClassifier.test.ts`

Test:
- Standard HTTP error → extracts status, url, method
- Network error (no response) → status = 0
- Timeout error → errorCode = 'ECONNABORTED'
- Error code extraction from various response shapes
- Error message extraction fallback chain
- Request ID extraction from headers

### 5. API Event Bus Tests

**Create**: `src/lib/api/events/__tests__/apiEventBus.test.ts`

Test:
- Subscribe receives emitted events
- Multiple subscribers all receive events
- Unsubscribe stops receiving events
- Listener errors don't break other listeners
- `clear()` removes all listeners
- Events are typed correctly (TypeScript compile-time check)

### 6. Token Refresh Tests

**Create**: `src/lib/api/__tests__/tokenRefresh.test.ts`

Test:
- Successful refresh → stores new tokens
- Failed refresh → emits session-expired event
- Concurrent requests → only one refresh call made (deduplication)
- Auth endpoints → no refresh attempt
- Refresh token missing → immediate session-expired

### 7. Interceptor Tests

**Create**: `src/lib/api/interceptors/__tests__/authInterceptor.test.ts`

Test:
- Token attached when available
- Token not attached when `withToken: false`
- Token not attached to external URLs
- Missing token → no Authorization header

**Create**: `src/lib/api/interceptors/__tests__/errorClassifierInterceptor.test.ts`

Test:
- 4xx errors → classified and matched against registry
- 5xx errors → classified and matched against registry
- Network errors → classified correctly
- Error still rejected (propagates to React Query)

### 8. Integration Test

**Create**: `src/lib/api/__tests__/integration.test.ts`

End-to-end flow test with mocked axios:
- Request → auth interceptor adds token → server returns 401 → token refresh → retry → success
- Request → server returns 500 → error classified → toast event emitted
- Request → server returns 403 → error classified → toast event emitted
- Request → timeout → network error classified → toast event emitted

## Testing Guidelines

- Use `vi.mock()` for axios, Redux store, i18next
- Use `vi.fn()` for event bus subscribers
- Test pure functions directly (matcher, classifier, actions)
- Test interceptors by registering on a mock axios instance
- Follow project pattern: test logic, not rendering
- No `waitForTimeout()` - use proper async patterns
- Coverage target: >80% for all new modules

## Files to Create

1. `src/lib/api/errors/__tests__/errorRegistry.test.ts`
2. `src/lib/api/errors/__tests__/errorMatcher.test.ts`
3. `src/lib/api/errors/__tests__/errorActions.test.ts`
4. `src/lib/api/errors/__tests__/errorClassifier.test.ts`
5. `src/lib/api/events/__tests__/apiEventBus.test.ts`
6. `src/lib/api/__tests__/tokenRefresh.test.ts`
7. `src/lib/api/interceptors/__tests__/authInterceptor.test.ts`
8. `src/lib/api/__tests__/integration.test.ts`

## Success Criteria

- [ ] All tests pass
- [ ] Coverage >80% for new modules
- [ ] No flaky tests
- [ ] Tests follow project conventions (logic, not rendering)
- [ ] Mocking is clean (no global state leaks between tests)
- [ ] Test file names follow `*.test.ts` convention
- [ ] Lint passes on all test files
