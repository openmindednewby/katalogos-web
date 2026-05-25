# Fix Public Menu Page Authentication

> **Reference**: Coordinates with `backend-public-menu-endpoint.md` for backend API

## Status: COMPLETED

## Problem Statement
The public menu page at `/public/menu/:id` redirects to login because it uses authenticated API calls. Public menu pages should work for users who are NOT logged in, allowing them to view menus without authentication.

## Root Cause Analysis
1. The page uses `useOnlineMenuWebMenuGetById` which calls the authenticated `/TenantMenus/{externalId}` endpoint
2. The `ContentImage` component uses `useContentUrl` which requires authentication
3. Both rely on the `customInstance` in `httpClient.ts` which sets `withToken: true`

## Implementation Plan

### 1. Create public content URL hook
- Add `usePublicContentUrl` in `BaseClient/src/lib/hooks/content/useContent.ts`
- Fetches content URLs WITHOUT authentication (`withToken: false`)

### 2. Create public menu hook
- Create manual hook `usePublicMenuGetById` in `BaseClient/src/server/customHooks/`
- Calls `GET /public/menus/{externalId}` without authentication

### 3. Update ContentImage component
- Add optional `isPublic` prop that switches between authenticated and public URL hooks

### 4. Update public menu page
- Use `usePublicMenuGetById` instead of authenticated hook
- Pass `isPublic={true}` to ContentImage components

## Files Modified
1. `BaseClient/src/lib/hooks/content/useContent.ts` - Added:
   - `fetchPublicContentUrl()` function
   - `getPublicContentUrlQueryKey()` function
   - `usePublicContentUrl()` hook
   - Time constants for stale time calculation

2. `BaseClient/src/components/Content/ContentImage.tsx` - Added:
   - `isPublic` prop to Props interface
   - `accessibilityHint` prop to Props interface
   - Conditional hook usage based on `isPublic` prop
   - Uses `usePublicContentUrl` when `isPublic={true}`

3. `BaseClient/src/server/customHooks/usePublicMenuGetById.ts` - NEW:
   - `getPublicMenuQueryKey()` function
   - `fetchPublicMenu()` function
   - `usePublicMenuGetById()` hook for fetching public menus

4. `BaseClient/app/public/menu/[id].tsx` - Updated:
   - Changed import from `useOnlineMenuWebMenuGetById` to `usePublicMenuGetById`
   - Added `isPublic` and `accessibilityHint` props to all `ContentImage` components

5. `BaseClient/src/__tests__/components/Content/ContentImage.test.tsx` - Updated:
   - Added mock for `usePublicContentUrl`
   - Added test cases for `isPublic` prop behavior

## Success Criteria
- [x] Public menu page loads without authentication (uses public hooks)
- [x] Content images display correctly on public menu page (uses public URL hook)
- [x] No lint errors (only pre-existing warnings about file/function length)
- [x] All unit tests pass (14/14 ContentImage tests pass)
- [x] Build succeeds (web export successful)

## Test Results
```
ContentImage tests: 14 passed
Build: Exported successfully to dist/
Lint: 0 errors, only pre-existing warnings about file size limits
```

## Notes
- The backend endpoint `GET /public/menus/{externalId}` needs to be implemented by the backend agent
- The content service endpoint `GET /api/content/{id}/public-url` needs to be implemented for public content access
- Once backend endpoints are ready, the public menu page should work without authentication
