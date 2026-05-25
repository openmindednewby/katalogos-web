# Fix ARIA roles for Settings tabs and all 8 modal dialogs

## Status: COMPLETED

## Problem Statement

Two HIGH severity accessibility bugs found during visual QA:

1. **Issue #5**: Settings page tabs missing ARIA roles (`tablist`, `tab`, `tabpanel`, `aria-selected`) and keyboard navigation (Arrow keys).
2. **Issue #6**: All 8 custom modal dialogs missing `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape key handling, backdrop click-to-close, and focus trapping.

## Implementation Plan

### Issue #5 - Settings Tabs
- Add `role="tablist"` to tab container
- Add `role="tab"` + `aria-selected` to each tab button
- Add `role="tabpanel"` + `aria-labelledby` to content panel
- Add `id` attributes to tabs for `aria-controls`/`aria-labelledby`
- Extract keyboard navigation logic into `useTabNavigation` hook
- Write unit tests for the hook

### Issue #6 - Modal Dialogs
- Create shared `useDialog` hook providing: Escape key handling, backdrop click detection, focus trapping
- Create shared `DialogWrapper` component that applies `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Apply to all 8 dialog files
- Add `aria-label="Close"` to close buttons using unicode x
- Write unit tests for the hook

## Files to Modify
- `SyncfusionThemeStudio/src/hooks/useDialog.ts` (NEW)
- `SyncfusionThemeStudio/src/hooks/useDialog.test.ts` (NEW)
- `SyncfusionThemeStudio/src/hooks/useTabNavigation.ts` (NEW)
- `SyncfusionThemeStudio/src/hooks/useTabNavigation.test.ts` (NEW)
- `SyncfusionThemeStudio/src/features/settings/SettingsPage/index.tsx`
- `SyncfusionThemeStudio/src/features/settings/SettingsPage/index.test.ts`
- All 8 dialog files listed in the issue

## Success Criteria
- All ARIA roles properly applied
- Keyboard navigation works for tabs (Arrow keys)
- Escape key closes all dialogs
- Backdrop click closes all dialogs
- Focus is trapped within open dialogs
- All unit tests pass
- Lint passes
- Build succeeds

## Verification Results
- TypeScript: 0 errors
- ESLint: 0 errors, 0 warnings (all modified files)
- Tests: 117 files, 1549 tests all passing (27 new tests added)
- All files under line limits
