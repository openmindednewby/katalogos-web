# Task 10: Tenant Theme Fetch and Cache on Login

> **Status**: COMPLETED
> **Agent**: `frontend-dev`
> **Started**: 2026-02-14
> **Completed**: 2026-02-14

---

## Problem Statement

After login, the frontend needs to fetch the current tenant's theme configuration from the Identity API and inject it into the ThemeProvider. Theme should be cached in localStorage to prevent flash-of-default-theme on subsequent page loads.

---

## Implementation Summary

### Files Created

1. `src/lib/theme/themeCacheTypes.ts` - CachedThemeData interface for localStorage
2. `src/lib/theme/themeCacheStorage.ts` - read/write/clear localStorage cache with 24h expiry
3. `src/lib/theme/fetchTenantTheme.ts` - API call to GET /api/tenants/{tenantId}/theme via identityInstance
4. `src/lib/theme/index.ts` - Barrel export
5. `src/hooks/theme/useTenantTheme.ts` - React Query hook for fetching/caching theme
6. `src/hooks/theme/TenantThemeBridge.ts` - Side-effect hook connecting fetch lifecycle to ThemeProvider
7. `src/hooks/theme/index.ts` - Barrel export
8. `src/components/Providers/TenantThemeConnector.tsx` - Invisible connector component
9. `src/hooks/theme/__tests__/useTenantTheme.test.ts` - 12 unit tests
10. `src/lib/theme/__tests__/themeCacheStorage.test.ts` - 11 unit tests

### Files Modified

1. `app/_layout.tsx` - Added TenantThemeConnector inside LazyQueryProvider
2. `src/auth/authStorageCleanup.ts` - Added clearAllThemeCaches() to logout cleanup
3. `src/lib/queryClient.ts` - Added tenantTheme query keys

### Architecture

```
RootLayout
  Provider (Redux)
    ErrorBoundary
      ThemeProvider
        InnerApp
          LazyQueryProvider (QueryClient)
            TenantThemeConnector  <-- NEW: calls useTenantThemeBridge()
              useTenantTheme()    --> React Query fetch + localStorage cache
              useTheme()          --> setTenantConfig() on ThemeProvider
            AuthProvider
              ...rest of app
```

### Theme Fetch Flow

1. **Before login**: ThemeProvider uses defaults (null config)
2. **On page load (cached)**: useTenantTheme reads localStorage synchronously, applies cached config immediately (no flash)
3. **After login**: React Query fetches GET /api/tenants/{tenantId}/theme, writes to cache, applies via setTenantConfig
4. **Background refresh**: React Query refetches with 5min staleTime
5. **On logout**: TenantThemeBridge detects isLoggedIn=false, clears cache + reverts to defaults; authStorageCleanup also clears cache

### Key Decisions

- tenantId sourced from Redux auth state (`userInfo.tenantId` via KeycloakUserInfo index signature)
- API call uses identityInstance mutator directly (endpoint not yet in Swagger/Orval)
- Cache key format: `tenant-theme-{tenantId}`, max age 24h
- React Query staleTime: 5 minutes (STALE_TIME_LONG_MS)
- Config priority: fetched API data > localStorage cache > null (defaults)

---

## Verification Results

- [x] ESLint: All new/modified files pass with no errors
- [x] YAGNI: No unused exports from new files
- [x] Unit tests: 23 new tests pass (12 hook + 11 cache)
- [x] Existing tests: 49/49 related tests pass (including ThemeProvider and queryClient)
- [x] Web build: `npx expo export --platform web` succeeds
- [x] Type check: No new TypeScript errors in created/modified files
