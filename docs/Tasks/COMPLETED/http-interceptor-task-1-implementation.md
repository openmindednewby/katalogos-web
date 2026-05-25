# Task 1: Core Types, Error Registry Structure & API Event Bus

> **Reference**: `http-interceptor-architecture.md`, `http-interceptor-task-1-core-types-and-event-bus.md`

## Status: COMPLETED

## Problem Statement
Create the foundational types, error registry data structure, and event bus that bridges Axios interceptors to React UI. This is the foundation that Tasks 2, 3, and 4 depend on.

## Implementation Plan
1. Create `src/lib/api/errors/errorTypes.ts` - All TypeScript interfaces
2. Create `src/lib/api/errors/errorRegistry.ts` - Declarative error-to-action mapping table
3. Create `src/lib/api/errors/index.ts` - Barrel exports
4. Create `src/lib/api/events/apiEventTypes.ts` - Event type definitions
5. Create `src/lib/api/events/apiEventBus.ts` - Typed singleton event emitter
6. Create `src/lib/api/events/index.ts` - Barrel exports
7. Create `src/lib/api/index.ts` - Top-level barrel

## Files Created
- `src/lib/api/errors/errorTypes.ts` (129 lines)
- `src/lib/api/errors/errorRegistry.ts` (224 lines)
- `src/lib/api/errors/index.ts` (26 lines)
- `src/lib/api/events/apiEventTypes.ts` (56 lines)
- `src/lib/api/events/apiEventBus.ts` (57 lines)
- `src/lib/api/events/index.ts` (14 lines)
- `src/lib/api/index.ts` (43 lines)

## Success Criteria
- [x] All error types are fully typed with TypeScript (no `any`)
- [x] Error registry contains 12 rules covering all common HTTP errors
- [x] Event bus supports subscribe/emit/clear with typed events
- [x] Registry supports runtime rule registration via registerErrorRule()
- [x] Rules are sorted by priority (highest first)
- [x] All files under 300 lines (largest is errorRegistry.ts at 224)
- [x] All functions under 50 lines
- [x] Lint passes (0 errors on task files)
- [x] All 1554 existing tests still pass
- [x] Build succeeds (expo export --platform web)

## Changes Made

### errorTypes.ts
- Defined `HttpMethod` type (GET/POST/PUT/PATCH/DELETE)
- Defined `const enum ErrorActionType` with 6 values (toast/modal/redirect/silent/retry/custom)
- Defined `const enum ErrorSeverity` with 3 values (info/warning/error)
- Defined interfaces: `ClassifiedError`, `StatusRange`, `ErrorMatcher`, `ErrorAction`, `ErrorRule`, `ErrorMatchResult`
- All types exported, no `any` usage

### errorRegistry.ts
- 12 default error rules covering: feature-gated (403+FEATURE_GATED, priority 10), maintenance-mode (503, priority 5), session-expired (401), forbidden (403), subscription-required (402), validation-error (400/422), conflict (409), rate-limited (429), bad-gateway (502/504), server-error (500-599), network-offline (status 0), request-timeout (ECONNABORTED)
- All HTTP status codes extracted to named constants (no magic numbers)
- `getErrorRules()` returns sorted rules
- `registerErrorRule()` adds rules at runtime and re-sorts
- `resetErrorRules()` for test cleanup
- `isAuthEndpoint()` reuses existing auth URL patterns from httpInterceptor.ts
- Exported priority constants for use by other tasks

### apiEventTypes.ts
- Defined 5 event interfaces: `ToastEvent`, `ModalEvent`, `RedirectEvent`, `SessionExpiredEvent`, `MaintenanceModeEvent`
- `ApiEvent` union type covers all events
- `ApiEventType` derived from the union discriminator

### apiEventBus.ts
- `ApiEventBus` class with `subscribe()`, `emit()`, `clear()`
- `subscribe()` returns an unsubscribe function
- `emit()` iterates listeners with try/catch (silently swallows errors)
- Singleton `apiEventBus` exported for app-wide use
- Class also exported for testing

## Test Results
- Lint: 0 errors on all 7 created files
- Unit tests: 122 suites, 1554 tests passed (no regressions)
- Build: Successful (expo export --platform web)
- YAGNI: No unused exports from task files
