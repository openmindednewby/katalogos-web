# Fix i18n Interpolation Parameter Bugs

## Status: COMPLETED

## Problem Statement
Several call sites used `t()` from react-i18next with wrong interpolation parameter names (e.g., `{ count }` instead of `{ p1: count }`). Translation JSON files use `{{p1}}`/`{{p2}}`/`{{p3}}` placeholders, so mismatched param names result in raw `{{p1}}` being shown to users instead of the actual values.

## Root Cause Analysis
- The `FM()` helper enforces positional params by design, but some components used `t()` directly with non-standard param names
- The existing `i18n-interpolation` ESLint rule only checks JSON translation files, not TypeScript/TSX call sites
- No linter rule existed to catch param name mismatches in `t()` calls

## Bugs Found and Fixed

| File | Bug | Fix |
|------|-----|-----|
| `ExportButtons/index.tsx:68` | `t('quizAnswers.exportCount', { count })` | `FM('quizAnswers.exportCount', String(count))` |
| `NotificationItemComponent.tsx:110` | `t('...minutesAgo', { count: diffMinutes })` | `FM('...minutesAgo', String(diffMinutes))` |
| `NotificationItemComponent.tsx:111` | `t('...hoursAgo', { count: diffHours })` | `FM('...hoursAgo', String(diffHours))` |
| `NotificationItemComponent.tsx:112` | `t('...daysAgo', { count: diffDays })` | `FM('...daysAgo', String(diffDays))` |
| `IOSAddToHomePrompt.tsx:56-67` | Used `{{share}}`/`{{addToHome}}` with broken string splitting | Refactored to use proper translation keys and FM() |

## New Linter Rule Created

**`eslint-plugins/i18n-param-names.mjs`** - Enforces p1/p2/p3 parameter names in `t()` call sites.

- Catches: `t('key', { count })`, `t('key', { message: err })`, etc.
- Allows: `{ p1: value }`, `{ p2: value }`, `{ p3: value }`
- Allows i18next config keys: `defaultValue`, `ns`, `lng`, `context`, etc.
- Severity: `error`
- Applies to: `src/**/*.ts`, `src/**/*.tsx` (excludes test files)

## Files Modified
- `src/components/Buttons/ExportButtons/index.tsx` - Fixed `{ count }` to `FM()`
- `src/components/Notifications/NotificationItemComponent.tsx` - Fixed 3x `{ count }` to `FM()`
- `src/pwa/IOSAddToHomePrompt.tsx` - Refactored broken string splitting to proper translations
- `src/localization/locales/en.json` - Added `pwa.*` translation keys
- `eslint-plugins/i18n-param-names.mjs` - New linter rule (created)
- `eslint.config.mjs` - Registered new rule
- `app/(protected)/notifications/__tests__/NotificationsScreen.test.tsx` - Added FM mock

## Test Results
- Lint: 0 errors, 0 warnings
- TypeScript: 0 errors
- Unit tests: 132 suites, 1746 tests - all pass
- Build: Successful (632.67 kB gzipped, under 635 kB limit)
