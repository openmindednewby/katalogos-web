# Analytics Phase 4 -- Frontend Analytics Dashboard

## Status: COMPLETED

## Problem Statement

The backend endpoint `GET /api/analytics/tenant-summary` is implemented in the OnlineMenu service but has no frontend dashboard to display the data. We need to build an analytics dashboard screen that shows tenant-level analytics: total menus, active menus, QR scan counts, and top menus by scan count.

## Key Findings

- The `tenant-summary` endpoint is NOT in the current swagger spec, so no auto-generated hook exists.
- Created a custom React Query hook to call the endpoint manually via the existing `customInstance` HTTP client.
- The sidebar uses a module registry pattern (`@baseclient/core` ModuleRegistry) with items defined in module packages.
- Analytics sidebar item added to the `onlinemenu-module` since it is part of the OnlineMenu service.
- All text uses `FM()` from `localization/helpers`, never `t()`.
- All keys added to `en.json` (NOT `en/core.json`).
- Module structure convention enforced: Analytics directory uses `components/` and `hooks/` subdirectories.

## Files Created

- `src/components/Analytics/types.ts` -- TenantAnalyticsSummary and TopMenuDto interfaces
- `src/components/Analytics/hooks/useTenantAnalytics.ts` -- custom React Query hook
- `src/components/Analytics/hooks/useTenantAnalytics.test.ts` -- unit tests for query key
- `src/components/Analytics/components/StatCard.tsx` -- reusable stat card component
- `src/components/Analytics/components/TopMenusList.tsx` -- top menus FlatList
- `src/components/Analytics/components/AnalyticsDashboardScreen.tsx` -- main screen
- `src/components/Analytics/index.ts` -- barrel export
- `src/shared/testIds/analyticsTestIds.ts` -- test IDs
- `app/(protected)/analytics/index.tsx` -- route page

## Files Modified

- `src/localization/locales/en.json` -- added analytics translation keys + menu.analytics
- `src/navigation/routes.ts` -- added ANALYTICS route
- `src/shared/testIds.ts` -- imported and spread AnalyticsTestIds
- `src/config/routePreloader.ts` -- added analytics route preload
- `packages/onlinemenu-module/src/index.ts` -- added analytics sidebar item

## Verification Results

- [x] `frontend-lint-fix` -- PASSED
- [x] `frontend-yagni` -- PASSED
- [x] `frontend-unit-tests` -- PASSED
- [x] `frontend-prod-build` -- PASSED

## Success Criteria

- [x] Analytics dashboard displays 4 stat cards (Total Menus, Active Menus, QR Scans Today, Total QR Scans)
- [x] Top menus list shows menus with scan counts
- [x] Loading state with ActivityIndicator
- [x] Error state with retry button
- [x] Admin-only access via sidebar requiredRoles: ['admin', 'superUser']
- [x] All text via FM() with keys in en.json
- [x] Full accessibility (testID + accessibilityLabel + accessibilityHint on all interactive elements)
- [x] No magic numbers or hardcoded colors
- [x] Files under line limits (all components under 200 lines)
- [x] Lint, YAGNI, tests, and build all pass

## Notes for Follow-up

- When the backend swagger spec is updated to include the `/api/analytics/tenant-summary` endpoint, run `npm run generate:hooks` to get an auto-generated hook. The custom `useTenantAnalytics` hook can then be replaced with the generated one.
- Visual QA should be performed once the backend endpoint is live and returning data.
- E2E tests should be added once the feature is visually verified.
