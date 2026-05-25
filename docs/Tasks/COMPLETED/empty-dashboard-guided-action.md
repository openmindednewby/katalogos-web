# Empty Dashboard → Guided Action

## Status: COMPLETED
## Priority: P0
## Started: 2026-03-14
## Completed: 2026-03-14

## Problem

New users log in and see a completely blank page — empty FlatLists with no guidance. The TenantsPage (superAdmin only) or Menus/Quiz pages show zero empty state messaging. There's no onboarding, no "get started" flow, and no indication of what to do next.

## Solution

Replaced the bare `TenantsPage` pass-through at `/(protected)/index.tsx` with a proper **Dashboard** that:
1. Detects if the user has data (menus, questionnaires) via `useDashboardData` hook
2. Shows **guided action cards** when empty ("Create your first menu", "Create your first survey")
3. Shows **overview cards** when data exists (counts + "View All" links)
4. Shows **quick action buttons** for fast access to create flows
5. Shows **tenant management** section for superAdmin users
6. Added `ListEmptyComponent` to Menus and Quiz Templates FlatLists

## Files Created

- `src/components/Dashboard/index.ts` — Barrel exports
- `src/components/Dashboard/types.ts` — Dashboard type definitions
- `src/components/Dashboard/components/DashboardPage.tsx` — Main orchestrator
- `src/components/Dashboard/components/WelcomeHeader.tsx` — Personalized greeting
- `src/components/Dashboard/components/GuidedActionCard.tsx` — Empty state action card
- `src/components/Dashboard/components/OverviewCard.tsx` — Data count card
- `src/components/Dashboard/components/QuickActions.tsx` — Quick action buttons
- `src/components/Dashboard/hooks/useDashboardData.ts` — Data aggregation hook
- `src/components/Shared/EmptyListState.tsx` — Reusable FlatList empty state
- `src/shared/testIds/dashboardTestIds.ts` — Dashboard test IDs

## Files Modified

- `app/(protected)/index.tsx` — Renders DashboardPage instead of TenantsPage
- `app/(protected)/menus/index.tsx` — Added ListEmptyComponent to FlatList
- `app/(protected)/quiz-templates/index.tsx` — Added ListEmptyComponent to FlatList
- `src/localization/locales/en/core.json` — Added dashboard translation keys
- `src/shared/testIds.ts` — Integrated dashboardTestIds into barrel export

## Quality Checks

- [x] `frontend-lint-fix` — PASSED
- [x] `frontend-yagni` — PASSED
- [x] `frontend-unit-tests` — PASSED
- [x] `frontend-prod-build` — PASSED
- [x] All user-facing strings use `t()` or `FM()`
- [x] All TouchableOpacity have testID + accessibilityLabel + accessibilityHint
- [x] No hardcoded color literals (all use theme palette)
- [x] Files under 300 lines, components under 200 lines
- [x] Named constants for all magic numbers
