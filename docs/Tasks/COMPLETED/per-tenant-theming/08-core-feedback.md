# Task 08: Build Core Feedback Components with Theme

> **Status**: COMPLETED (2026-03-06) — 7 unit tests, zero hardcoded colors
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider), 04 (default preset)
> **Blocks**: 12 (domain migration)
> **Estimated effort**: Small-Medium

---

## Problem Statement

Feedback components (modals, dialogs, toasts, badges) use various theme access patterns. They need to consume theme via `useTheme()` for consistent per-tenant styling.

---

## Requirements

### Components to Refactor

| Component | Current Location | Purpose |
|-----------|-----------------|---------|
| ConfirmDialog | `components/Shared/ConfirmDialog.tsx` | Confirmation modal |
| ModalShell | `components/Shared/ModalShell.tsx` | Modal wrapper/backdrop |
| StatusBadge | `components/Status/StatusBadge.tsx` | Status indicator |
| GenericStatusBadge | `components/Status/GenericStatusBadge.tsx` | Generic badge |
| ToastContainer | `components/Notifications/ToastContainer.tsx` | Toast notifications |
| RealTimeToastContainer | `components/Notifications/RealTimeToastContainer.tsx` | RT toast |
| NotificationBellButton | `components/Notifications/NotificationBellButton.tsx` | Bell icon |
| ChoicePill | `components/Shared/ChoicePill.tsx` | Selectable pill |

### Theme Consumption
- Modal backdrop: `colors.overlay` or a semi-transparent version of `colors.background`
- Modal surface: `colors.surfaceElevated`
- Status badges: Use semantic colors (`colors.success`, `colors.error`, `colors.warning`, `colors.info`)
- Toast: Background from `colors.surfaceElevated`, border from semantic color based on toast type
- Bell button badge: `palette.primary[500]` background
- Choice pills: `palette.primary[100]` background when selected, `palette.primary[500]` text

---

## Acceptance Criteria

- [ ] All 8 feedback components consume theme via `useTheme()`
- [ ] No direct Redux theme access in feedback components
- [ ] Confirm dialog uses theme-aware button variants (from Task 05)
- [ ] Status badges use semantic colors from theme
- [ ] Toast notifications styled with theme tokens
- [ ] Notification bell badge colored with primary palette
- [ ] Unit tests for StatusBadge color resolution logic
- [ ] No visual regressions

---

## Files to Modify

- `BaseClient/src/components/Shared/ConfirmDialog.tsx`
- `BaseClient/src/components/Shared/ModalShell.tsx`
- `BaseClient/src/components/Shared/ChoicePill.tsx`
- `BaseClient/src/components/Status/StatusBadge.tsx`
- `BaseClient/src/components/Status/GenericStatusBadge.tsx`
- `BaseClient/src/components/Notifications/ToastContainer.tsx`
- `BaseClient/src/components/Notifications/RealTimeToastContainer.tsx`
- `BaseClient/src/components/Notifications/NotificationBellButton.tsx`

---

## Files to Reference

- `BaseClient/src/components/Shared/ConfirmDialog.tsx` - Current implementation
- `BaseClient/src/components/Notifications/NotificationBellButton.tsx` - Redux theme pattern
- `BaseClient/src/theme/useTheme.ts` - Theme hook from Task 03
