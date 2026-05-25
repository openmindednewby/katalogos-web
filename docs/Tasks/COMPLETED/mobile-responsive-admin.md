# Mobile-Responsive Admin Panel

## Status: COMPLETED (All Phases 1-6 DONE)
## Priority: P1
## Started: 2026-03-14

## Problem Statement

The admin panel (dashboard, menu editor, list pages, settings) does not work well on phone screens. Restaurant owners work from mobile devices between service shifts — the admin panel must be usable on phones (375px+).

## Implementation Plan

### Phase 1: Responsive Foundation - DONE
- [x] Add `PHONE_BREAKPOINT_PX = 480` constant
- [x] Create `useBreakpoint()` hook returning `{ isPhone, isTablet, isDesktop, breakpoint, width }`
- [x] Unit tests for `useBreakpoint` (8 tests covering all boundaries)

### Phase 2: Layout Shell — Sidebar & Navigation - DONE
- [x] On phone (<=480px): hide collapsed sidebar entirely, rely on hamburger in MobileTopbar
- [x] Keep existing tablet (481-768px) and desktop (>768px) behavior unchanged
- [x] Added testID and FM() translations to close-sidebar overlay

### Phase 3: Dashboard Responsive - DONE
- [x] GuidedActionCard: stack icon above content on phone (`flexDirection: 'column'`)
- [x] WelcomeHeader: reduce font sizes on phone (26->22, 15->13)
- [x] DashboardPage: reduce container padding on phone (16->12)
- [x] OverviewCard: reduce font sizes on phone (32->24, 28->22)

### Phase 4: List Pages & Actions - DONE
- [x] TenantListItemActions: add `flexWrap: 'wrap'` with rowGap for phone
- [x] PageHeaderWithActions: stack title and actions vertically on phone
- [x] Migrated PageHeaderWithActions from `t()` to `FM()`

### Phase 5: Menu Editor Modal - DONE
- [x] FullMenuEditor: full-screen on phone instead of maxWidth overlay
- [x] Tab buttons: reduce padding on phone, equal-width tabs
- [x] Button row stacks vertically on phone
- [x] Content pickers (image/video) stack vertically on phone
- [x] Fixed all hardcoded accessibility strings with FM()
- [x] Extracted EditorTabButton and menuContentsAdapter for 200-line limit

### Phase 6: Forms & Settings - DONE
- [x] DayHoursRow: stack vertically on phone instead of horizontal
- [x] BillingHistoryTable: horizontal scroll on phone
- [x] PlanComparisonSection: plan grid stacks vertically on phone

## Code Review Fixes Applied (Round 1)
1. (MEDIUM) ProtectedLayout: added `testID={TestIds.LAYOUT_CLOSE_SIDEBAR_OVERLAY}` and FM() translations
2. (MEDIUM) PageHeaderWithActions: replaced hardcoded accessibilityHint strings with `FM()`
3. (MEDIUM) TenantListItemActions: extracted `ACTION_BUTTON_MARGIN_RIGHT` and `ICON_SPACING_MARGIN_RIGHT` constants
4. (LOW) useBreakpoint.test.ts: replaced magic numbers with imported `PHONE_BREAKPOINT_PX`/`TABLET_BREAKPOINT_PX` constants
5. (MEDIUM) Landing components migration to useBreakpoint — tracked as follow-up

## Code Review Fixes Applied (Round 2)
1. (MEDIUM) TenantListItemActions: added `viewButtonTestID` prop and testID to view button
2. (MEDIUM) SettingsDropdown: added testID, FM() accessibility, and `SETTINGS_DROPDOWN_BACKDROP` testID to backdrop
3. (MEDIUM) SessionItem/AccountInfoSection: renamed `SessionItemProps`/`AccountInfoSectionProps` to `Props`
4. (MEDIUM) Settings screens: reordered hooks consistently (theme → query → mutation → state)
5. (MEDIUM) ProtectedLayout: extracted topbar ternary to named `topbar` variable
6. (MEDIUM) Settings constants: consolidated duplicates into shared `Settings/constants.ts` with re-exports
7. (LOW) WelcomeWizard: replaced `PHONE_PADDING_DIVISOR` with direct `PHONE_PADDING = 16`
8. (LOW) GuidedActionCard/OverviewCard: added `ctaTestID` prop for unique per-instance CTA testIDs

## Files Created
- `src/hooks/useBreakpoint.ts`
- `src/hooks/useBreakpoint.test.ts`
- `src/components/Settings/constants.ts` — shared constants for all Settings screens

## Files Modified
- `src/shared/constants/index.ts` — added PHONE_BREAKPOINT_PX
- `src/shared/testIds/commonTestIds.ts` — added LAYOUT_CLOSE_SIDEBAR_OVERLAY, TENANT_LIST_ITEM_VIEW_BUTTON
- `src/shared/testIds/dashboardTestIds.ts` — added per-instance CTA testIDs
- `src/shared/testIds/profileTestIds.ts` — added SETTINGS_DROPDOWN_BACKDROP
- `src/shared/enums/WizardStep.ts` — eslint-disable for const enum values (pre-existing error)
- `src/components/Layout/ProtectedLayout.tsx` — useBreakpoint, phone sidebar hidden, testID, FM(), extracted topbar variable
- `src/components/Dashboard/components/DashboardPage.tsx` — responsive padding, unique ctaTestIDs
- `src/components/Dashboard/components/GuidedActionCard.tsx` — column layout on phone, ctaTestID prop
- `src/components/Dashboard/components/OverviewCard.tsx` — responsive font sizes, ctaTestID prop
- `src/components/Dashboard/components/WelcomeHeader.tsx` — responsive font sizes
- `src/components/Dashboard/components/WelcomeWizard.tsx` — simplified PHONE_PADDING
- `src/components/Tenants/TenantListItemActions.tsx` — flex wrap on phone, named constants, viewButtonTestID
- `src/components/Tenants/TenantListItemActionsTypes.ts` — added viewButtonTestID prop
- `src/components/Shared/PageHeaderWithActions.tsx` — vertical stack on phone, FM() migration
- `src/components/Settings/PreferencesSettings/components/SettingsDropdown.tsx` — testID, FM(), backdrop accessibility
- `src/components/Settings/ProfileSettings/components/AccountInfoSection.tsx` — Props rename
- `src/components/Settings/ProfileSettings/components/ProfileSettingsScreen.tsx` — hook reorder
- `src/components/Settings/SecuritySettings/components/SessionItem.tsx` — Props rename
- `src/components/Settings/SecuritySettings/components/SecuritySettingsScreen.tsx` — hook reorder
- `src/components/Settings/PreferencesSettings/components/PreferencesSettingsScreen.tsx` — hook reorder
- `src/components/Settings/ProfileSettings/constants.ts` — re-export from shared
- `src/components/Settings/SecuritySettings/constants.ts` — re-export from shared
- `src/components/Settings/PreferencesSettings/constants.ts` — re-export from shared
- `src/components/Settings/PrivacySettings/constants.ts` — re-export from shared
- `src/localization/locales/en.json` — added layout.closeSidebar*, common.refreshHint, common.addHint, common.dismissDropdown*

## Quality Checks
- [x] `frontend-lint-fix` — PASS (remaining warnings are pre-existing: useTranslation restricted imports)
- [x] `frontend-unit-tests` — PASS (2496/2496 tests, 73.63% line coverage)
- [x] `frontend-prod-build` — PASS
- [x] Code review — PASSED after 2 rounds of fixes (0 HIGH, 0 MEDIUM remaining)
- [x] Identity backend — `identity-lint` PASS, `identity-unit-tests` PASS (148 tests), `identity-api` rebuilt
