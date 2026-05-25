# Task 10 (Continued): ETag Support and Logo URL Resolution

> **Status**: COMPLETED
> **Agent**: `frontend-dev`
> **Started**: 2026-03-06
> **Completed**: 2026-03-06

---

## Problem Statement

Task 10 created the base tenant theme fetch/cache infrastructure, but three features remained unimplemented:

1. **ETag support**: `fetchTenantTheme.ts` hardcoded `etag: null`. The backend supports ETag via `If-None-Match` header for conditional GET, but the frontend didn't use it.
2. **Logo URL Resolution**: When theme config has `logoContentId`, the frontend should resolve it to a public URL via ContentService `GET /content/{id}/public-url`.
3. **Mutation hook export**: `useTenantThemeMutation` was not exported from the barrel index.

---

## Implementation Summary

### Files Modified

1. **`src/lib/theme/utils/fetchTenantTheme.ts`** - Major rewrite for ETag support:
   - Switched from `identityInstance` (strips headers) to `apiClient` (preserves headers)
   - Sends `If-None-Match` header when cached ETag is available
   - Extracts `ETag` from response headers on 200
   - Handles 304 Not Modified (both as response status and as axios error)
   - Added `notModified` field to `TenantThemeResponse`
   - Added `FetchTenantThemeOptions` interface with `signal` and `cachedEtag`
   - Uses `validateStatus` to accept 2xx and 304 without throwing

2. **`src/hooks/theme/hooks/useTenantTheme.ts`** - ETag integration:
   - Reads full `CachedThemeData` (including `etag`) from localStorage
   - Passes cached ETag to `fetchTenantTheme` via options
   - Skips cache write on 304 Not Modified (cache is already current)
   - Resolves cached config on 304 responses

3. **`src/hooks/theme/utils/TenantThemeBridge.ts`** - Logo URL integration:
   - Calls `useLogoUrl` to resolve `logoContentId` to public URL
   - Passes resolved `logoUrl` to ThemeProvider via `setBrandingUrls`
   - Clears branding URLs on logout

4. **`src/theme/utils/ThemeContext.ts`** - Added `setBrandingUrls` to context interface

5. **`src/theme/components/ThemeProvider.tsx`** - Added branding URL override state:
   - New `overrideUrls` state for resolved logo/favicon URLs
   - `setBrandingUrls` callback exposed on context
   - Merges resolved URLs over base `resolveTheme()` branding

6. **`src/theme/components/ThemeProvider.test.tsx`** - Added `setBrandingUrls` to mock context

7. **`src/hooks/theme/index.ts`** - Expanded barrel exports:
   - Added `useTenantThemeMutation`, `useLogoUrl`, and their return types

8. **`src/lib/theme/index.ts`** - Added `FetchTenantThemeOptions` type export

### Files Created

1. **`src/hooks/theme/hooks/useLogoUrl.ts`** - Logo URL resolution hook:
   - Extracts `logoContentId` from theme config
   - Uses existing `usePublicContentUrl` from ContentService hooks
   - Returns `{ logoUrl, isLoading }` with null fallback

2. **`src/lib/theme/utils/fetchTenantTheme.test.ts`** - 10 unit tests:
   - Tests ETag sending/extraction
   - Tests 304 handling (both as status and axios error)
   - Tests DTO transformation
   - Tests signal passing and error propagation

3. **`src/hooks/theme/hooks/useLogoUrl.test.ts`** - 7 unit tests:
   - Tests null config, missing contentId, URL resolution
   - Tests loading state, empty URL handling

### Architecture

```
TenantThemeBridge (side-effect hook)
  |-- useTenantTheme()
  |     |-- readThemeCache() -> get cached ETag
  |     |-- fetchTenantTheme(tenantId, { cachedEtag })
  |     |     |-- apiClient.request() with If-None-Match header
  |     |     |-- On 200: extract ETag, transform DTO
  |     |     |-- On 304: return notModified=true
  |     |-- writeThemeCache() on 200 (skip on 304)
  |     |-- resolve: fetched > cached > null
  |
  |-- useLogoUrl(themeConfig)
  |     |-- extract logoContentId from branding
  |     |-- usePublicContentUrl(contentId) via ContentService
  |     |-- return resolved URL or null
  |
  |-- setTenantConfig(config)   -> ThemeProvider
  |-- setBrandingUrls({ logoUrl }) -> ThemeProvider
```

### ETag Flow

1. **First load**: No cached ETag -> no `If-None-Match` -> 200 with ETag -> save to cache
2. **Subsequent loads**: Read cached ETag -> send `If-None-Match` -> 304 Not Modified -> use cached data (no cache rewrite)
3. **After theme change**: Mutation invalidates query -> refetch with old ETag -> 200 with new ETag -> update cache

---

## Verification Results

- [x] `npm run lint:fix` - zero errors
- [x] `npm run yagni` - no new unused exports
- [x] `npm run test:coverage` - 166 suites, 2087 tests, all pass
- [x] `npx expo export --platform web` - build succeeds
- [x] All files under 300 lines, components under 200
- [x] No magic numbers, no type assertions, no complex conditions
- [x] Unit tests focus on logic (ETag flow, URL resolution, caching), not rendering
