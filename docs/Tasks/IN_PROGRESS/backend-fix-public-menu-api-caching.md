# Fix Public Menu API Caching Issue

## Problem Statement
When a menu is activated via `PATCH /api/v1/TenantMenus/{id}/activate`, the public menu list page (`/public/menus`) does not immediately reflect the change. E2E tests require up to 5 retry attempts, and sometimes skip the test entirely as a "known caching issue".

## Root Cause Analysis
1. **No server-side caching** exists in the OnlineMenu backend (confirmed: no IMemoryCache, OutputCache, or ResponseCache)
2. **No explicit Cache-Control headers** are set on API responses. ASP.NET Core does not set Cache-Control by default.
3. **Browser heuristic caching** may cache GET responses (e.g., `/api/v1/TenantMenus/list`) when no explicit cache directives are present.
4. The public menus list page (`app/public/menus/index.tsx`) uses `useOnlineMenuWebMenuList()` which fetches from `/api/v1/TenantMenus/list` (an authenticated tenant endpoint).
5. React Query default `staleTime` is 1 minute, but each `goto()` in E2E tests creates a fresh page (destroying the React app), so this is not the primary issue.

## Solution
1. **Backend**: Add `NoCacheHeadersMiddleware` that sets `Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache` on all `/api/*` responses. This prevents browser heuristic caching.
2. **Frontend**: Set `staleTime: 0` on the public menus list page query so React Query always refetches on mount, ensuring fresh data even within the same SPA session.
3. **E2E Tests**: Remove retry loops and `test.skip()` workarounds since the fix eliminates the caching issue.

## Changes Made

### Backend (OnlineMenu Service)
- **NEW**: `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Middleware/NoCacheHeadersMiddleware.cs` - Middleware that adds no-cache headers to all API responses
- **MODIFIED**: `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Program.cs` - Registered NoCacheHeadersMiddleware in the pipeline
- **NEW**: `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/Web/NoCacheHeadersMiddlewareTests.cs` - 7 unit tests covering happy path, edge cases, and non-API paths

### Frontend
- **MODIFIED**: `BaseClient/app/public/menus/index.tsx` - Added `staleTime: 0` to the menu list query for immediate freshness

### E2E Tests
- **MODIFIED**: `E2ETests/tests/online-menus/public-viewer-active-filtering-states.spec.ts` - Removed retry loops and `test.skip()` workarounds from two tests

### Pre-existing Fixes
- Fixed UTF-8 BOM encoding on 9 pre-existing test files that had CHARSET errors
- Fixed CRLF line endings on all test files in the OnlineMenu unit test project

## Verification Results
- [x] `onlinemenu-lint` - PASSED
- [x] `onlinemenu-yagni` - PASSED
- [x] `onlinemenu-unit-tests` - PASSED (1178 tests, 0 failures)
- [x] `onlinemenu-api` - PASSED (container rebuilt successfully)
- [ ] E2E public viewer tests - pending (requires full environment)
