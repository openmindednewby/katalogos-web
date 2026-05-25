# Notification Screen Improvements

## Problem Statement
The notification screen at `app/(protected)/notifications/index.tsx` exists but has several code quality issues:
1. Hardcoded accessibility hint strings (should use `FM()`)
2. Uses Redux + `themePalette` instead of `useTheme()` hook
3. Hardcoded color constants for warning banner and mark-all-read button text
4. File is 210 lines, slightly over the 200-line component limit
5. Missing translation keys for accessibility hints
6. Type guard for `useNotifications` result is overly defensive

## Implementation Plan
1. Add missing translation keys to `en.json` for accessibility hints
2. Refactor to use `useTheme()` hook instead of Redux + themePalette
3. Replace hardcoded colors with theme-derived colors
4. Replace hardcoded accessibility hints with `FM()` calls
5. Extract hook logic to a separate `useNotificationsScreen.ts` file to reduce component size
6. Run lint and unit tests

## Files to Modify
- `BaseClient/src/localization/locales/en.json` -- add missing translation keys
- `BaseClient/app/(protected)/notifications/index.tsx` -- refactor component

## Success Criteria
- All user-facing text uses `FM()`
- No hardcoded colors
- Uses `useTheme()` hook
- Component under 200 lines
- Lint passes
- Unit tests pass
