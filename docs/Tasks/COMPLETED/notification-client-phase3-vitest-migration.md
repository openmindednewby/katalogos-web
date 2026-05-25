# Task: Notification Client Phase 3 - Vitest Migration and Test Co-location

## Status: COMPLETED

## Problem Statement
The `@dloizides/notification-client` NPM package at `NPMPackages/packages/notification-client/` used Jest for testing with tests in a separate `__tests__/` directory. Phase 3 required:
1. Migrating from Jest to Vitest (project convention)
2. Co-locating tests next to source files (not in `__tests__/`)
3. Adding stress tests for the store
4. Ensuring all tests pass

## Changes Made

### Configuration Changes
- Created `vitest.config.ts` with jsdom environment, v8 coverage, 70% thresholds
- Created `src/test-setup.ts` with Notification/ServiceWorker mocks for vitest
- Updated `package.json`: replaced jest/ts-jest with vitest/@vitest/coverage-v8/jsdom
- Updated `tsconfig.json`: excluded `src/test-setup.ts` from compilation
- Removed `jest.config.js`, `tsconfig.test.json`, `__tests__/` directory, `coverage/` directory

### Test Migration (Jest -> Vitest)
All tests converted from Jest to Vitest:
- `jest.fn()` -> `vi.fn()`
- `jest.mock()` -> `vi.mock()`
- `jest.spyOn()` -> `vi.spyOn()`
- `jest.useFakeTimers()` -> `vi.useFakeTimers()`
- Explicit imports of `describe, it, expect, vi, beforeEach, afterEach` from `vitest`

### Test Co-location (16 test files)
All tests moved next to their source files:
- `src/core/NotificationClient.test.ts` (30 tests)
- `src/core/NotificationStore.test.ts` (28 tests, including 7 stress tests)
- `src/react/NotificationProvider.test.tsx` (5 tests)
- `src/react/useNotifications.test.tsx` (6 tests)
- `src/react/useUnreadCount.test.tsx` (2 tests)
- `src/react/useNotificationActions.test.tsx` (4 tests)
- `src/react/useNotificationPreferences.test.tsx` (2 tests)
- `src/react/useNotificationClient.test.tsx` (5 tests)
- `src/react/useNotificationToast.test.tsx` (8 tests)
- `src/components/NotificationBell.test.tsx` (14 tests)
- `src/components/NotificationBadge.test.tsx` (13 tests)
- `src/components/NotificationItem.test.tsx` (18 tests)
- `src/components/NotificationList.test.tsx` (9 tests)
- `src/components/NotificationToast.test.tsx` (29 tests)
- `src/components/NotificationToastContainer.test.tsx` (18 tests)
- `src/workers/osNotificationService.test.ts` (15 tests)

### Stress Tests Added (in NotificationStore.test.ts)
- Add 1000 notifications rapidly (verifies count, ordering)
- Mark all as read with 500+ notifications (verifies bulk operation)
- Concurrent add + remove operations (100 add, 50 remove interleaved)
- Toast queue overflow with 20 rapid additions (maxToasts=3)
- Rapid mark-as-read on 200 individual notifications
- Interleaved add notification + add toast (100 iterations)
- Clear after large accumulation (1000 items)

## Verification Results
- `npm run test`: 16 test files, 206 tests, ALL PASSED (2.92s)
- `npm run test:coverage`: ALL thresholds met
  - Statements: 81.76% (threshold: 70%)
  - Branches: 90.22% (threshold: 70%)
  - Functions: 86.88% (threshold: 60%)
  - Lines: 81.76% (threshold: 70%)
- `npm run typecheck` (`tsc --noEmit`): PASSED
- `npm run build` (`tsup`): PASSED (CJS + ESM + DTS)

## Success Criteria
- [x] All tests pass with vitest
- [x] Tests co-located next to source files
- [x] Stress tests added for NotificationStore
- [x] `npm run test` works
- [x] `npm run test:coverage` works
- [x] No Jest dependencies remain
