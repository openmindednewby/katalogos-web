# Mobile-Responsive Admin Panel

## Status: COMPLETED
## Priority: P1
## Started: 2026-03-14

## Problem Statement

The admin panel (dashboard, menu editor, list pages, settings) does not work well on phone screens. Restaurant owners work from mobile devices between service shifts — the admin panel must be usable on phones (375px+).

## Current State

- **ProtectedLayout** already switches between desktop sidebar (220px) and tablet collapsed sidebar (56px) at 768px breakpoint
- **Landing pages** are fully responsive with 3-tier breakpoints
- **Dashboard cards** render vertically but some use `flexDirection: 'row'` which can overflow on narrow screens
- **TenantListItemActions** renders 6+ buttons in a single horizontal row with no wrapping — overflows on phone
- **PageHeaderWithActions** renders title + buttons in a row — collides on narrow screens
- **Menu editor modals** use fixed `maxWidth` values not optimized for phone
- No centralized responsive hook — each component independently calls `useWindowDimensions()`

## Implementation Plan

### Phase 1: Responsive Foundation
- [x] Add `PHONE_BREAKPOINT_PX = 480` constant
- [x] Create `useBreakpoint()` hook returning `{ isPhone, isTablet, isDesktop, breakpoint, width }`
- [x] Unit test for `useBreakpoint`

### Phase 2: Layout Shell — Sidebar & Navigation
- [x] On phone (<=480px): hide collapsed sidebar entirely, rely on hamburger in MobileTopbar
- [x] Keep existing tablet (481-768px) and desktop (>768px) behavior unchanged

### Phase 3: Dashboard Responsive
- [x] GuidedActionCard: stack icon above content on phone (`flexDirection: 'column'`)
- [x] WelcomeHeader: reduce font sizes on phone
- [x] DashboardPage: reduce padding on phone
- [x] OverviewCard: reduce font sizes on phone

### Phase 4: List Pages & Actions
- [x] TenantListItemActions: add `flexWrap: 'wrap'` with row gap for phone
- [x] PageHeaderWithActions: stack title and actions vertically on phone

### Phase 5: Menu Editor Modal
- [ ] FullMenuEditor: full-screen on phone instead of maxWidth overlay
- [ ] Tab buttons: reduce padding on phone

### Phase 6: Forms & Settings
- [ ] Form rows: stack vertically on phone instead of horizontal

## Files Created
- `src/hooks/useBreakpoint.ts` — centralized responsive breakpoint hook
- `src/hooks/useBreakpoint.test.ts` — unit tests for breakpoint logic

## Files Modified
- `src/shared/constants/index.ts` — added PHONE_BREAKPOINT_PX
- `src/components/Layout/ProtectedLayout.tsx` — replaced raw useWindowDimensions with useBreakpoint; phone hides collapsed sidebar
- `src/components/Dashboard/components/DashboardPage.tsx` — responsive padding on phone
- `src/components/Dashboard/components/GuidedActionCard.tsx` — column layout on phone
- `src/components/Dashboard/components/OverviewCard.tsx` — responsive font sizes on phone
- `src/components/Dashboard/components/WelcomeHeader.tsx` — responsive font sizes on phone
- `src/components/Tenants/TenantListItemActions.tsx` — flex wrap on phone
- `src/components/Shared/PageHeaderWithActions.tsx` — vertical stack on phone, extracted magic numbers

## Quality Checks
- [x] `frontend-lint-fix` — passed
- [x] `frontend-yagni` — passed
- [x] `frontend-unit-tests` — passed
- [x] `frontend-prod-build` — passed
