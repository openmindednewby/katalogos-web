# Menu View Analytics Frontend (Section 1.4 Dashboard)

## Problem Statement
Users need a detail analytics screen for individual menus, showing views over time, device breakdown, top items, and summary stats. The backend API is being built in parallel.

## API Endpoints (assumed)
- `GET /api/analytics/menu/{menuId}?from=YYYY-MM-DD&to=YYYY-MM-DD` -> MenuAnalyticsDetail
- `POST /api/menus/{menuId}/views` -> 204 (anonymous)

## Implementation Summary

### Phase 1: Foundation
- Created `AnalyticsTimeRange` const enum (`shared/enums/AnalyticsTimeRange.ts`)
- Added `ScansByDayEntry`, `DeviceBreakdown`, `ItemViewEntry`, `MenuAnalyticsDetail` types to `Analytics/types.ts`
- Added 13 new testIds to `analyticsTestIds.ts`
- Added `MENU_ANALYTICS` route to `routes.ts`
- Added `analytics.detail.*` translation keys to `en.json` (25+ keys including time range, stats, chart labels, errors)

### Phase 2: API Hook
- Created `useMenuAnalytics.ts` hook following the `useTenantAnalytics` manual pattern
- Created `useMenuAnalytics.test.ts` with 4 tests for query key generation

### Phase 3: Chart Components (SVG-based, no external chart library)
- Created `TimeRangeSelector.tsx` — Today/7 Days/30 Days tab selector
- Created `ViewsOverTimeChart.tsx` — SVG line chart using react-native-svg
- Created `DeviceBreakdownChart.tsx` — SVG pie chart with legend
- Created `TopItemsList.tsx` — FlatList for top viewed menu items
- Created `MenuStatsSummary.tsx` — 3-column stat cards grid
- Extracted `pieChartUtils.ts` for polar coordinate math

### Phase 4: Screen and Navigation
- Created `MenuAnalyticsScreen.tsx` (main screen, extracted loading/error into sub-components)
- Created `MenuAnalyticsLoadingState.tsx` and `MenuAnalyticsErrorState.tsx`
- Created `app/(protected)/analytics/menu/[id].tsx` — Expo Router dynamic route
- Modified `AnalyticsDashboardScreen.tsx` — added `handleMenuPress` with `router.push`
- Modified `TopMenusList.tsx` — accepts optional `onMenuPress` prop, wraps rows in `TouchableOpacity`
- Modified `Analytics/index.ts` — exports `MenuAnalyticsScreen`
- Added route preload to `routePreloader.ts`

## Files Created
- `src/shared/enums/AnalyticsTimeRange.ts`
- `src/components/Analytics/hooks/useMenuAnalytics.ts`
- `src/components/Analytics/hooks/useMenuAnalytics.test.ts`
- `src/components/Analytics/components/TimeRangeSelector.tsx`
- `src/components/Analytics/components/ViewsOverTimeChart.tsx`
- `src/components/Analytics/components/DeviceBreakdownChart.tsx`
- `src/components/Analytics/components/TopItemsList.tsx`
- `src/components/Analytics/components/MenuStatsSummary.tsx`
- `src/components/Analytics/components/MenuAnalyticsScreen.tsx`
- `src/components/Analytics/components/MenuAnalyticsLoadingState.tsx`
- `src/components/Analytics/components/MenuAnalyticsErrorState.tsx`
- `src/components/Analytics/utils/pieChartUtils.ts`
- `app/(protected)/analytics/menu/[id].tsx`

## Files Modified
- `src/components/Analytics/types.ts`
- `src/shared/testIds/analyticsTestIds.ts`
- `src/navigation/routes.ts`
- `src/localization/locales/en.json`
- `src/components/Analytics/components/AnalyticsDashboardScreen.tsx`
- `src/components/Analytics/components/TopMenusList.tsx`
- `src/components/Analytics/index.ts`
- `src/config/routePreloader.ts`

## Quality Gate Results
- **YAGNI**: PASSED (no unused exports)
- **Unit tests**: PASSED (267/270 suites pass, 3 failures are pre-existing in unrelated files)
- **Prod build**: PASSED
- **Lint**: 1 warning (complexity 18 in MenuAnalyticsScreen) — all 28 errors are pre-existing

## Status: COMPLETED
