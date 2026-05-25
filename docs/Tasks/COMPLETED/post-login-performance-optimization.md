# Post-Login Performance Optimization

## Status: COMPLETED

## Problem Statement

The app takes too long to load after login. Investigation reveals several performance bottlenecks in the post-login flow.

## Root Cause Analysis

### 1. Race condition: Double `setLoading(false)` in AuthProvider (FIXED)

The `authSlice` initialState has `loading: true`. Two separate mechanisms raced to set it to false:
- `initReduxStore()` in `reduxStore.ts` (async, dispatches `setLoading(false)` after loading persisted state)
- `AuthProvider` useEffect (sync, dispatches `setLoading(false)` on mount)

The AuthProvider's `useEffect(() => { dispatch(setLoading(false)) }, [dispatch])` always fired immediately on mount, potentially before `initReduxStore()` finished restoring tokens. This caused the protected layout to see `loading=false` + `token=null` and redirect to login.

**Fix**: Removed the redundant `setLoading(false)` from AuthProvider. Added error recovery in `initReduxStore()` catch handler to dispatch `setLoading(false)` on failure.

### 2. No prefetch of dashboard data during login (FIXED)

After login, the user navigated to the dashboard where 4+ API calls started from scratch (menu list, template list, preferences, business profile). The dashboard showed a loading spinner until all resolved.

**Fix**: Created `prefetchDashboardData()` utility that fires all 4 dashboard queries via `queryClient.prefetchQuery()` immediately after successful login, before navigation. By the time the dashboard mounts, the React Query cache is already warm.

### 3. LazyQueryProvider chunk not preloaded (FIXED)

The `LazyQueryProvider` lazy-loads `@tanstack/react-query` and `queryClient` via `React.lazy()`. After login, the protected routes had to wait for this chunk to load before rendering.

**Fix**: Added `preloadCriticalChunks()` to `routePreloader.ts` that preloads `@tanstack/react-query` and `queryClient` alongside route chunks on the login page.

### 4. Duplicate API hooks in Dashboard (NOT FIXED - by design)

`useSetupChecklist` and `useBusinessProfileNudge` independently call the same hooks as `useDashboardData`. React Query deduplicates these at the network level (same query key = same cache entry). The overhead is minimal (extra hook subscriptions) and the architecture is cleaner with self-contained hooks.

### 5. Sequential theme waterfall (NOT FIXED - by design)

The TenantThemeBridge fetches the theme after auth state is available. This is a natural dependency. The theme is cached in localStorage which prevents flash-of-unstyled-content.

## Changes Made

### Files Modified

1. **`src/auth/AuthProvider.tsx`** - Removed redundant `setLoading(false)` useEffect that raced with store initialization
2. **`src/store/reduxStore.ts`** - Added `setLoading(false)` dispatch in `initReduxStore` error handler to prevent infinite spinner on init failure
3. **`src/config/routePreloader.ts`** - Added `preloadCriticalChunks()` to preload `@tanstack/react-query` and `queryClient` modules during login page idle time
4. **`app/(auth)/login.tsx`** - Call `prefetchDashboardData()` after successful login before navigation

### Files Created

5. **`src/features/dashboard/utils/prefetchDashboardData.ts`** - Utility to prefetch all 4 dashboard API queries into React Query cache
6. **`src/features/dashboard/utils/prefetchDashboardData.test.ts`** - Unit tests covering all prefetch scenarios and feature flag gating

## Verification Results

- frontend-lint-fix: PASSED
- frontend-yagni: PASSED
- frontend-unit-tests: PASSED (328 suites, 4026 tests)
- frontend-prod-build: PASSED
- frontend-lighthouse: Performance 97, FCP 0.2s, LCP 1.3s, TBT 40ms, CLS 0

## Performance Impact Summary

| Optimization | Impact | Mechanism |
|---|---|---|
| Remove auth race condition | HIGH | Eliminates false redirect-to-login on session restore |
| Prefetch dashboard data | HIGH | Dashboard shows data immediately instead of 4 loading spinners |
| Preload React Query chunk | MEDIUM | Eliminates Suspense waterfall for LazyQueryProvider |
