# Task 08: Refactor Core Feedback Components to useTheme()

> **Status**: COMPLETE
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider), 04 (default preset) -- both COMPLETE
> **Blocks**: 12 (domain migration)

---

## Problem Statement

Eight feedback components (modals, dialogs, toasts, badges, pills) needed full theme token compliance. All components already consumed `useTheme()` from the new tenant theme system, but several had hardcoded color literals and incorrect token mappings per the theme specification.

---

## Changes Made

### 1. ChoicePill - Updated color mapping per spec
- **Before**: Selected bg used `palette.primary[500]`, text used `colors.surfaceElevated`
- **After**: Selected bg uses `palette.primary[100]` (lighter, per spec), text uses `palette.primary[500]`
- File: `src/components/Shared/ChoicePill.tsx`

### 2. ToastContainer - Removed hardcoded `#fff`
- **Before**: `TOAST_TEXT_COLOR = '#fff'` hardcoded constant used in static styles
- **After**: Toast text color uses `theme.colors.surfaceElevated` dynamically (light color for contrast on semantic-colored backgrounds)
- File: `src/components/Notifications/ToastContainer.tsx`

### 3. NotificationBellButton - Removed hardcoded `#ffffff`
- **Before**: `BADGE_TEXT_COLOR = '#ffffff'` hardcoded constant used in static styles
- **After**: Badge text color uses `theme.colors.surfaceElevated` dynamically
- File: `src/components/Notifications/NotificationBellButton.tsx`

### 4. StatusBadge - Added unit tests for color resolution logic
- Created `src/components/Status/StatusBadge.test.ts` with 7 tests covering:
  - All 4 semantic keys (success, error, warning, info) resolve to correct `[500]` shade
  - "subtext" key falls back to `textSecondary`
  - Unknown key falls back to `textSecondary`
  - Empty string key falls back to `textSecondary`

### 5. Components already compliant (no changes needed)
- `ConfirmDialog.tsx` - Already uses `useTheme()` correctly with all theme tokens
- `ModalShell.tsx` - Already uses `useTheme()` correctly
- `GenericStatusBadge.tsx` - Already uses `useTheme()` with semantic colors
- `RealTimeToastContainer.tsx` - Already uses `useTheme()` correctly

---

## Theme Token Mapping (Final State)

| Component | Token Usage |
|-----------|-------------|
| ConfirmDialog | surfaceElevated (bg), text, textSecondary, border, semantic.error[500]/palette.primary[500] (buttons) |
| ModalShell | background (bg), textSecondary (close icon) |
| ChoicePill | palette.primary[100] (selected bg), palette.primary[500] (selected text), text (unselected text) |
| StatusBadge | semantic.[key][500] via resolveSemanticColor, textSecondary fallback |
| GenericStatusBadge | semantic.success[500] (active), textSecondary (inactive) |
| ToastContainer | palette.primary[500], semantic.success[500], semantic.error[500] (bg), surfaceElevated (text) |
| RealTimeToastContainer | surfaceElevated (bg), text, textSecondary |
| NotificationBellButton | text (bell icon), palette.primary[500] (badge bg), surfaceElevated (badge text) |

---

## Quality Checks

- [x] `npm run lint:fix` - passes with no errors
- [x] `npm run yagni` - no new unused exports
- [x] `npm run test:coverage` - all related tests pass (22/22)
- [x] `npx expo export --platform web` - build succeeds
- [x] No hardcoded color literals in any of the 8 components
- [x] No direct Redux theme access
- [x] All status badges use semantic colors
- [x] Bell badge uses palette.primary[500] bg, surfaceElevated text
- [x] StatusBadge color resolution has unit test coverage

Note: 9 pre-existing failures in FormNativeInput.test.tsx are from a separate in-progress task (refactor-form-components-theme-consumption) and are unrelated to this work.
