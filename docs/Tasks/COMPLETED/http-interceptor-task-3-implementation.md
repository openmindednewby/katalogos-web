# Task 3: Error Matching Engine & Action Executor

> **Reference**: `http-interceptor-architecture.md`, `http-interceptor-task-3-error-handling.md`

## Status: COMPLETED

## Problem Statement

We need the engine that takes a classified error, matches it against the error registry rules, and executes the appropriate action (show toast, open modal, redirect, etc.). This includes the error classifier, matcher, action executor, monitoring reporter, and specialized error handlers.

## Root Cause Analysis

Currently error handling is scattered across `httpInterceptor.ts` and `notifications.ts` with no declarative mapping between errors and UI actions.

## Implementation Plan

1. Create `errorClassifier.ts` - Convert AxiosError to ClassifiedError
2. Create `errorMatcher.ts` - Match ClassifiedError against registry rules
3. Create `errorActions.ts` - Execute matched rule actions via event bus
4. Create `errorReporter.ts` - Monitoring stub using logger
5. Create handler files:
   - `handlers/authErrorHandler.ts` - Auth endpoint detection
   - `handlers/validationErrorHandler.ts` - Field-level error extraction
   - `handlers/serverErrorHandler.ts` - Retry-After, maintenance mode
   - `handlers/networkErrorHandler.ts` - Offline vs timeout detection
   - `handlers/subscriptionErrorHandler.ts` - Plan/feature info extraction
6. Update barrel export in `errors/index.ts`
7. Update barrel export in `api/index.ts`

## Files Created

1. `src/lib/api/errors/errorClassifier.ts` - Converts AxiosError to ClassifiedError
2. `src/lib/api/errors/errorMatcher.ts` - Matching engine with AND-logic, priority, skipIf
3. `src/lib/api/errors/errorActions.ts` - Action executor with toast/modal/redirect/silent/custom
4. `src/lib/api/errors/errorReporter.ts` - Monitoring stub using logger
5. `src/lib/api/errors/handlers/authErrorHandler.ts` - Auth endpoint detection
6. `src/lib/api/errors/handlers/validationErrorHandler.ts` - Field-level error extraction
7. `src/lib/api/errors/handlers/serverErrorHandler.ts` - Retry-After, maintenance mode
8. `src/lib/api/errors/handlers/networkErrorHandler.ts` - Offline vs timeout detection
9. `src/lib/api/errors/handlers/subscriptionErrorHandler.ts` - Plan/feature info extraction

## Files Modified

1. `src/lib/api/errors/index.ts` - Added exports for new modules
2. `src/lib/api/index.ts` - Added exports for new modules

## Dependencies Found (Task 1 already created)

- `src/lib/api/errors/errorTypes.ts` - Core type definitions (already existed)
- `src/lib/api/errors/errorRegistry.ts` - Declarative rule table (already existed)
- `src/lib/api/events/apiEventBus.ts` - Event bus singleton (already existed)
- `src/lib/api/events/apiEventTypes.ts` - Event type definitions (already existed)

## Success Criteria

- [x] Error matcher correctly handles all matcher field types (status, path, method, errorCode, bodyField)
- [x] AND logic works: all specified fields must match
- [x] Priority ordering works: higher priority rules checked first (via getErrorRules)
- [x] skipIf callbacks are respected
- [x] Action executor emits correct events for each action type (toast, modal, redirect, silent, retry, custom)
- [x] Message resolution follows fallback chain (i18n -> fallback -> error.message -> generic)
- [x] Validation errors extract field-level errors from response body
- [x] Network errors distinguish offline vs timeout
- [x] All files under 300 lines, all functions under 50 lines
- [x] Lint passes with zero errors
- [x] All 1554 tests pass
- [x] Build succeeds

## Test Results

- `npm run lint:fix` - zero errors, zero warnings
- `npm run test` - 122 suites, 1554 tests passed
- `npx expo export --platform web` - build successful
- `npm run yagni` - no unused exports (handler files correctly show "used in module")
