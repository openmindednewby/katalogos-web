# Fix TypeScript Errors in Test Files

## Status: COMPLETED

## Problem Statement
Multiple test files had TypeScript errors causing `npx tsc --noEmit` to fail. These errors involved type mismatches between simplified mock types and actual React Query / hook types, delete operator usage on non-optional properties, unknown type access, object literal mismatches, and type-vs-value confusion.

## Files Modified

### 1. `src/hooks/__tests__/userPageHandlers/types.ts`
- Removed unused `MockMutation` interface (no longer imported after test file fixes)

### 2. `src/hooks/__tests__/userPageHandlers/useCreateUser.test.tsx`
- Replaced `MockMutation` type with `as unknown as CreateMutation` cast using `ReturnType<typeof useIdentityServiceAPIEndpointsUsersCreateUser>`
- Changed `tenantId: null` to `tenantId: undefined` to match `UserFormPayload` type

### 3. `src/hooks/__tests__/userPageHandlers/useDeleteUser.test.tsx`
- Replaced `MockMutation` type with `as unknown as DeleteMutation` cast using `ReturnType<typeof useIdentityServiceAPIEndpointsUsersDeleteUser>`

### 4. `src/hooks/__tests__/userPageHandlers/usePasswordSubmit.test.tsx`
- Replaced `MockMutation` type with `as unknown as UpdatePasswordMutation` cast
- Updated test assertion: removed `userId` from `data` object to match source code change

### 5. `src/hooks/__tests__/userPageHandlers/useToggleUserEnabled.test.tsx`
- Replaced `MockMutation` type with `as unknown as SetEnabledMutation` cast
- Updated test assertion: removed `userId` from `data` object to match source code change

### 6. `src/hooks/__tests__/userPageHandlers/useUsersList.test.tsx`
- Added `as unknown as UsersQuery` cast when passing MockUsersQuery to useUsersList
- Updated test assertion: changed expected `tenantId: null` to `tenantId: undefined` to match source code change

### 7. `src/lib/__tests__/navigation.test.ts`
- Added `@ts-expect-error` comment before `delete globalWithWindow.window` (lines 14, 30)

### 8. `src/store/__tests__/LocalStorage.test.ts`
- Added `@ts-expect-error` comment before `delete globalWithWindow.window` (line 39)

### 9. `src/store/__tests__/persist.test.ts`
- Added `@ts-expect-error` comment before `delete globalWithWindow.window` (line 53)

### 10. `src/lib/__tests__/axios.test.ts`
- Added `as Record<string, string>` type assertion for `calledCfg.headers` (lines 96-97)

### 11. `src/lib/__tests__/httpServiceReExports.test.ts`
- Changed `{ url: '/test' }` to `{ endpoint: '/test' }` to match `HttpRequestParams` interface
- Changed `{ key: 'value' }` to `{ endpoint: '/test', queryParameters: { key: 'value' } }` to match `HttpQueryParams` interface

### 12. `src/pwa/__tests__/useServiceWorker.test.tsx`
- Changed `typeof` import: `type { useServiceWorker as UseServiceWorkerHookType }` and used `typeof UseServiceWorkerHookType` instead of `UseServiceWorkerHook` (was value used as type)
- Used `Object.defineProperty` to set `navigator.serviceWorker` mock instead of direct assignment to avoid type mismatch

### 13. `src/pwa/__tests__/usePWAInstall.test.tsx`
- Added non-null assertion `result!.handleInstall()` for possibly undefined `result`

## Success Criteria
- [x] `npx tsc --noEmit` reports zero errors in all target test files
- [x] All 69 existing tests still pass (14 test suites)

## Test Results
- TypeScript: Zero errors in target test files
- Unit tests: 14 suites, 69 tests, all passing
