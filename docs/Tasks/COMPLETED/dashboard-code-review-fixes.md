# Dashboard Code Review Fixes

## Status: COMPLETED
## Priority: P0 (follow-up)
## Started: 2026-03-14
## Completed: 2026-03-14

## Problem Statement
11 code review issues from Dashboard guided action implementation needed fixing.

## Round 1 Issues Fixed (11 issues)
1. (HIGH) DashboardPage.tsx 47-line nested ternary → flattened to 5 independent conditional guards
2. (MEDIUM) Extracted shared `useThemeColors()` hook from duplicated pattern in 6 files
3. (MEDIUM) GuidedActionCard duplicate testID → new `DASHBOARD_GUIDED_ACTION_CARD_CTA`
4. (MEDIUM) OverviewCard duplicate testID → new `DASHBOARD_OVERVIEW_CARD_CTA`
5. (MEDIUM) GuidedActionCard magic `lineHeight: 20` → `DESCRIPTION_LINE_HEIGHT` constant
6. (MEDIUM) DashboardPage magic `paddingBottom: 32` → `SCROLL_CONTENT_PADDING_BOTTOM` constant
7. (MEDIUM) OverviewCard magic `marginRight: 8` → `ICON_MARGIN_RIGHT` constant
8. (MEDIUM) Removed duplicate `EmptyListStateProps` from `Dashboard/types.ts`
9. (MEDIUM) Renamed `WelcomeHeaderProps` → `Props` in WelcomeHeader
10. (LOW) Hardcoded `"/quiz-templates"` → `Routes.QUIZ_TEMPLATES`
11. (LOW) EmptyListState theme pattern → uses shared `useThemeColors()` hook

## Round 2 Issues Fixed (5 issues from quality-check re-review)
12. (HIGH) quiz-templates EmptyListState circular navigation → removed CTA props (create form already on page)
13. (MEDIUM) Duplicate testIDs across GuidedActionCard/OverviewCard instances → added testID prop, 4 new variant test IDs
14. (MEDIUM) EmptyListState `EmptyListStateProps` → renamed to `Props`
15. (MEDIUM) Moved `GuidedActionCardProps`/`OverviewCardProps` from types.ts inline as `Props`
16. (LOW) Removed all JSDoc file header comments per "avoid comments" standard

## Translation Infrastructure (added during this task)
- Established FM()-only convention: all user-facing strings must use `FM()` from `localization/helpers`, never `t()` from `useTranslation()`
- Added ESLint `no-restricted-imports` rule to warn on `useTranslation` imports
- Added 30+ missing translation keys to `en.json` (dashboard + landing namespaces)
- Migrated 22 files from `t()` to `FM()`
- Updated `docs/code-standards/frontend-react.md` Locale section
- Updated `CLAUDE.md` core rules
- Created memory files: `feedback_translations.md`, `feedback_locale_file.md`

## Files Created
- `src/hooks/useThemeColors.ts` — shared hook extracting theme color resolution

## Files Modified
- `src/components/Dashboard/components/DashboardPage.tsx` — flattened ternary, shared hook, magic number
- `src/components/Dashboard/components/GuidedActionCard.tsx` — shared hook, CTA testID, magic number
- `src/components/Dashboard/components/OverviewCard.tsx` — shared hook, CTA testID, magic number
- `src/components/Dashboard/components/WelcomeHeader.tsx` — shared hook, Props rename
- `src/components/Dashboard/components/QuickActions.tsx` — shared hook
- `src/components/Shared/EmptyListState.tsx` — shared hook
- `src/components/Dashboard/types.ts` — removed duplicate EmptyListStateProps
- `src/shared/testIds/dashboardTestIds.ts` — added CTA + variant test IDs
- `app/(protected)/quiz-templates/index.tsx` — Routes.QUIZ_TEMPLATES, removed circular CTA

## Quality Checks
- [x] `frontend-lint-fix` — PASSED
- [x] `frontend-yagni` — PASSED
- [x] `frontend-unit-tests` — PASSED
- [x] `frontend-prod-build` — PASSED
