# Task: Error States & Feedback

> **Status**: COMPLETED
> **Priority**: P1
> **Agent**: frontend-dev (x2 parallel)
> **Phase**: 0.2 roadmap

## Problem Statement

Many actions lack success/error toasts, loading indicators, and empty states. Additionally, ~8 files use `t()` from `useTranslation()` instead of the required `FM()` convention, and some mutation handlers have hardcoded English strings.

## Implementation Plan

### Batch 1: Translation keys + mutation handler fixes
1. Add ~15 translation keys to `en.json` for users/tenants
2. `userMutationHandlers.ts` - hardcoded strings -> FM()
3. `userPasswordHandlers.ts` - hardcoded strings -> FM()
4. `useTenantMutations.ts` - t() -> FM()
5. `useTemplateMutations.ts` - t() -> FM()

### Batch 2: Page-level UI fixes
6. `ThemeSettingsScreen.tsx` - add error toast on save failure, t() -> FM()
7. `useTenantActions.ts` + `tenants/index.tsx` - add error/retry state, t() -> FM()
8. `users/index.tsx` - add error/retry, fix empty state, t() -> FM()
9. `TenantListRenderer.tsx` - add empty state, fix a11y
10. Privacy settings (5 files) + NotificationPreferencesScreen + CategoryPreferenceRow - t() -> FM()

### Code Review Fixes (post-review)
11. Copied `settings.privacy.*` keys from `en/features.json` into `en.json`
12. Replaced hardcoded ModalShell titles with FM() in users/tenants pages
13. Replaced hardcoded addLabel props with FM()
14. Replaced magic testID strings with TestIds constants
15. Extracted `NotificationCategoriesSection` component (216 -> 200 lines)
16. Extracted `AdminThemeControls` component (204 -> 168 lines)

## Files Modified

~20 files modified, 2 new files created:
- `en.json` — ~30 translation keys added
- `userMutationHandlers.ts`, `userPasswordHandlers.ts` — hardcoded strings -> FM()
- `useTenantMutations.ts`, `useTemplateMutations.ts` — t() -> FM()
- `useTenantActions.ts` — added isError to return
- `tenants/index.tsx`, `users/index.tsx` — error/retry states, FM(), TestIds
- `TenantListRenderer.tsx` — empty state, a11y
- `ThemeSettingsScreen.tsx` — error toast, t() -> FM()
- Privacy settings (5 files), NotificationPreferencesScreen, CategoryPreferenceRow — t() -> FM()
- `commonTestIds.ts` — TENANTS_RETRY_BUTTON, USERS_RETRY_BUTTON
- Test files (4) + setupMocks — assertions updated for FM key format
- NEW: `NotificationCategoriesSection.tsx` (extracted from NotificationPreferencesScreen)
- NEW: `AdminThemeControls.tsx` (extracted from ThemeSettingsScreen)

## Lifecycle Results

| Stage | Status | Details |
|-------|--------|---------|
| Lint | PASS | 0 errors in changed files |
| YAGNI | PASS | No unused exports |
| Unit Tests | PASS | 2464/2464 pass |
| Prod Build | PASS | Clean build |
| Quality Gate | PASS | All checks pass for our changes |
| Code Review | PASS | 8 issues found and fixed |
| Visual QA | PASS | All changed files verified correct |
| Regression | BLOCKED | Identity API infra down (unrelated) |

**LIFECYCLE_PASSED**
