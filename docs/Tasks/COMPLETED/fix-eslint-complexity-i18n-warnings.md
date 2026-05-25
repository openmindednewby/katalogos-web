# Fix ESLint Complexity and i18n Warnings

## Status: COMPLETED

## Problem Statement
12 ESLint warnings needed to be fixed across 8 files: 3 i18n literal string warnings and 9 complexity warnings.

## Changes Made

### I18N Literal String Fixes

1. **`app/(protected)/notifications/index.tsx`** - Replaced literal `&#9881;` with named constant `SETTINGS_GEAR_ICON` using unicode escape `\u2699`.

2. **`app/(protected)/users/index.tsx:108`** - Replaced hardcoded "You do not have permission..." with `t('users.noAccessPermission')`.

3. **`app/(protected)/users/index.tsx:140`** - Replaced hardcoded "Create First User" with `t('users.createFirstUser')`.

4. **`src/localization/locales/en.json`** - Added translation keys `users.noAccessPermission` and `users.createFirstUser`.

### Complexity Fixes

5. **`CategoryMedia.tsx` (18 -> below 15)** - Extracted `getCategoryMediaFlags()` and `getMediaDimensions()` helper functions.

6. **`CategorySection.tsx` (16 -> below 15)** - Extracted `getMediaDisplayFlags()` helper function combining media position, visibility, and background checks.

7. **`ItemPrice.tsx` (18 -> below 15)** - Extracted `resolvePriceSettings()` helper to consolidate all price style defaults.

8. **`MenuHeader.tsx` (30 -> below 15)** - Extracted 5 helper functions: `getHeaderVisibility()`, `resolveHeaderLayout()`, `buildTitleTextStyle()`, `buildDescriptionTextStyle()`, `getPositionAlignmentStyles()`, `getLogoAlignmentStyle()`.

9. **`MenuItemDisplay.tsx` (16 -> below 15)** - Extracted `resolveItemDisplayProps()` helper function.

10. **`menuConfigImport.ts` (25 -> below 15)** - Extracted `isOptionalString()`, `isOptionalNumber()`, `isOptionalPlainObject()`, `validateLegacyFields()`, `validateCategoriesField()`, `validateObjectSubFields()` helper functions.

## Test Results
- ESLint: 0 warnings, 0 errors across all 8 files (verified with `--max-warnings 0`)
