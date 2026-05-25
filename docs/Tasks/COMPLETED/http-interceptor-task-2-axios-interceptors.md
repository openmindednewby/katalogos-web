# Task 2: Axios Interceptors

> **Reference**: `docs/Tasks/TODO/http-interceptor-architecture.md`

## Status: COMPLETED

## Problem Statement

The current HTTP interceptor logic is scattered across `src/lib/axios.ts` (auth token + request helper) and `src/lib/httpInterceptor.ts` (response interceptor with 401 refresh + success notifications). These files mix multiple concerns. We need to split them into clean, single-responsibility interceptor modules under `src/lib/api/`.

## Implementation Plan

1. Create clean axios instance at `src/lib/api/axiosInstance.ts`
2. Create auth request interceptor at `src/lib/api/interceptors/authInterceptor.ts`
3. Create tenant request interceptor at `src/lib/api/interceptors/tenantInterceptor.ts`
4. Create response normalizer at `src/lib/api/interceptors/responseNormalizer.ts`
5. Create error classifier at `src/lib/api/interceptors/errorClassifier.ts`
6. Create logging interceptor at `src/lib/api/interceptors/loggingInterceptor.ts`
7. Create token refresh logic at `src/lib/api/tokenRefresh.ts`
8. Create interceptor registration at `src/lib/api/interceptors/index.ts`

## Files Created

- `src/lib/api/axiosInstance.ts` - Clean Axios instance with timeout, JSON headers, credentials
- `src/lib/api/interceptors/authInterceptor.ts` - Reads accessToken from Redux, attaches Bearer header
- `src/lib/api/interceptors/tenantInterceptor.ts` - Reads tenantId from userInfo, attaches X-Tenant-Id header
- `src/lib/api/interceptors/responseNormalizer.ts` - Emits toast events for successful mutations
- `src/lib/api/interceptors/errorClassifier.ts` - Converts AxiosError into ClassifiedError with full context
- `src/lib/api/interceptors/loggingInterceptor.ts` - Logs request/response with method, URL, status, duration (non-prod only)
- `src/lib/api/interceptors/index.ts` - Registers all interceptors in correct order
- `src/lib/api/tokenRefresh.ts` - Token refresh with shared promise deduplication, session-expired event

## Dependencies

- Task 1 (core types and event bus) - RESOLVED, files already created by Task 1 agent
- Task 3 (error matcher and actions) - TODO comment left in errorClassifier.ts for future integration

## Changes Made

### Key Design Decisions

1. **No type assertions**: All files use type guards instead of `as` casting per linter rules
2. **Event bus for session expiry**: Token refresh failure emits `session-expired` via apiEventBus instead of directly calling redirectTo (cleaner separation of concerns)
3. **Tenant header**: Reads from `userInfo.tenantId` custom Keycloak claim. Skips auth endpoints.
4. **Interceptor order**: Request interceptors registered as logging -> tenant -> auth (execute in reverse: auth -> tenant -> logging). Response interceptors registered as normalizer -> tokenRefresh -> errorClassifier (execute in order).
5. **isValueDefined** used throughout instead of direct null/undefined checks, following existing patterns

### Integration Points

- Imports `ClassifiedError`, `HttpMethod`, `ErrorSeverity` from Task 1's `errorTypes.ts`
- Imports `apiEventBus` from Task 1's `events/apiEventBus.ts`
- Imports `apiEventTypes` (ToastEvent etc.) from Task 1's `events/apiEventTypes.ts`
- Error classifier has a TODO for Task 3's `matchError()` and `executeErrorAction()` integration

## Test Results

- Lint: 0 errors, 0 warnings
- Unit tests: 122 suites, 1554 tests - all pass
- Build: Success (web export)

## Success Criteria

- [x] Each interceptor has a single responsibility
- [x] Auth token injection works for all service clients
- [x] Tenant header injected on every request (except auth endpoints)
- [x] Successful mutations emit toast events via apiEventBus
- [x] Errors are classified with full context (status, url, method, errorCode, message, body, requestId)
- [x] Token refresh deduplication works under concurrent requests (shared promise pattern)
- [x] Logging only active in non-production
- [x] All files under 300 lines, all functions under 50 lines
- [x] Lint passes, build succeeds
