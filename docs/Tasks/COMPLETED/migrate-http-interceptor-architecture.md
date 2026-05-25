# Migrate from Scattered HTTP Files to New Modular API Architecture

## Status: COMPLETED

## Problem Statement
Tasks 1-3 created a new modular HTTP interceptor system at `src/lib/api/` with clean separation
of concerns (auth interceptor, tenant interceptor, error classifier, response normalizer, token
refresh, event bus). The old system is scattered across `src/lib/axios.ts`, `src/lib/httpInterceptor.ts`,
and others. We need to migrate from the old files to the new system without breaking existing
functionality, using backward-compatible re-export wrappers.

## Root Cause Analysis
The old HTTP layer was monolithic:
- `src/lib/axios.ts` created its own axios instance, registered request/response interceptors inline
- `src/lib/httpInterceptor.ts` had all response handling (success toast, 401 token refresh, session clearing)
- `src/lib/notifications.ts` provided the pub/sub for toast events
- `src/lib/apiNotifications.ts` provided per-endpoint notification customization
- `src/lib/queryClient.ts` provided the QueryClient singleton

The new system at `src/lib/api/` has modular interceptors, a typed event bus, and clean separation.
However, the new event bus (apiEventBus) has no UI listeners yet (ApiEventsProvider is not mounted
in the app), so we cannot fully switch response handling yet.

## Implementation Plan (Executed)

### Phase 1: Update api barrel to export apiClient and registerInterceptors
- Added `apiClient`, `registerInterceptors`, and token refresh exports to `src/lib/api/index.ts`
- The linter auto-added `useApiEvents`, `ApiEventsProvider`, and `UseApiEventsResult` exports

### Phase 2: Convert `src/lib/axios.ts` to use shared `apiClient`
- Replaced the inline `axios.create()` with import of `apiClient` from `./api/axiosInstance`
- Kept the `_reqOptions` request interceptor pattern (needed by `methods.ts`)
- Kept calling `setupResponseInterceptor(apiClient)` for existing notification behavior
- Added `@deprecated` JSDoc with migration path
- Result: `deffHttp` now delegates to the shared `apiClient` instance

### Phase 3: Add deprecation comments to `src/lib/httpInterceptor.ts`
- Added `@deprecated` JSDoc listing all new interceptor locations
- Kept all existing behavior (notifySuccess, notifySignOut, clearSessionAndRedirect)
- No functional changes -- critical for backward compatibility until ApiEventsProvider is mounted

### Phase 4: Add deprecation comment to `src/lib/queryClient.ts`
- Added header comment noting future migration path
- Already enhanced by Task 4 with smart retry, QueryCache/MutationCache error handlers
- Already imports from `./api/events/apiEventBus` and `./api/errors/errorTypes`

### Phase 5: Add deprecation comment to `src/lib/apiNotifications.ts`
- Added `@deprecated` JSDoc pointing to `src/lib/api/errors/errorRegistry.ts`

### Phase 6: Keep `src/lib/notifications.ts` unchanged
- Different concern (generic notification pub/sub vs typed API events)
- Used by 15+ files across hooks, components, and tests

### Phase 7: Update test for `src/lib/__tests__/axios.test.ts`
- Updated mocks to match new import structure (apiClient from api/axiosInstance)
- Added test for withToken=false case

## Files Modified
1. `src/lib/api/index.ts` - Added apiClient, registerInterceptors, token refresh exports
2. `src/lib/axios.ts` - Uses shared apiClient, added deprecation comment
3. `src/lib/httpInterceptor.ts` - Added deprecation comment (no functional change)
4. `src/lib/apiNotifications.ts` - Added deprecation comment
5. `src/lib/queryClient.ts` - Added header comment (linter also fixed type assertion)
6. `src/lib/__tests__/axios.test.ts` - Updated to match new import structure

## Files NOT Modified (and why)
- `src/lib/notifications.ts` - Different concern, many active consumers
- `src/lib/http/methods.ts` - Imports from `../axios` which still works
- `src/lib/http/endpoints.ts` - Imports from `./methods` which is unchanged
- `src/auth/useKeycloakExchange.ts` - Imports `deffHttp` from `../lib/axios` which still works
- `src/auth/AuthProvider.tsx` - Does not import from any migrated files

## Key Design Decision: Shared Instance, Old Interceptors
The migration uses the new `apiClient` as the shared axios instance, but registers the OLD
interceptors on it (from `httpInterceptor.ts`). This is because:
1. The old interceptors use `notifySuccess()`/`notifySignOut()` from `notifications.ts`
2. The new interceptors emit via `apiEventBus` which uses `ApiEventsProvider`
3. `ApiEventsProvider` is NOT mounted in the app yet
4. Switching to new interceptors would silently break all UI notifications

**Next step**: Mount `ApiEventsProvider` in the app, then switch to new interceptors.

## Success Criteria
- [x] All existing imports continue to work (backward compatibility)
- [x] Old files have deprecation comments pointing to new locations
- [x] New API module's barrel exports `apiClient` and `registerInterceptors`
- [x] Interceptors are registered exactly once (old interceptors on shared apiClient)
- [x] `npm run lint:fix` passes (no errors in modified files)
- [x] `npm run test:coverage` passes (1742/1742 tests, 132 suites)
- [x] `npx expo export --platform web` succeeds

## Test Results
- **Lint**: 0 errors in modified files (14 pre-existing errors in other files)
- **Unit Tests**: 1742 passed, 0 failed (132 test suites)
- **Build**: Web export succeeded (1368 modules bundled in 15912ms)
- **YAGNI**: No new unused exports introduced
