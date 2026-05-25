# i18n Interpolation Placeholder Linter Rule + Fixes

## Status: COMPLETED

## Problem Statement
Translation JSON files contain mismatched placeholder names (`{{message}}`, `{{min}}`, `{{count}}`, etc.) that the FM() helper can't fill since it only accepts positional params `p1`, `p2`. This causes broken translations shown literally to users. SyncfusionThemeStudio also uses single braces `{p1}` instead of i18next's required double braces `{{p1}}`.

## Implementation Plan
1. Install jsonc-eslint-parser in both projects
2. Create custom ESLint rule `i18n-interpolation.mjs` in both projects
3. Register rule in ESLint configs
4. Extend FM helper to support p3
5. Fix all translation files
6. Create Zod structured error helpers (SyncfusionThemeStudio)
7. Update form field components to use resolveTranslationError
8. Add unit tests

## Files to Modify
- `BaseClient/eslint-plugins/i18n-interpolation.mjs` (new)
- `SyncfusionThemeStudio/eslint-plugins/i18n-interpolation.mjs` (new)
- `BaseClient/eslint.config.mjs`
- `SyncfusionThemeStudio/eslint.config.mjs`
- `BaseClient/src/localization/helpers.ts`
- `SyncfusionThemeStudio/src/localization/helpers.ts`
- `BaseClient/src/localization/locales/en.json`
- `SyncfusionThemeStudio/src/localization/locales/en.json`
- `SyncfusionThemeStudio/src/localization/translation-error.ts` (new)
- `SyncfusionThemeStudio/src/lib/forms/schemas/common.ts`
- 7x Form field components in SyncfusionThemeStudio
- Test files

## Success Criteria
- [x] Custom ESLint rule detects and autofixes non-standard placeholders
- [x] All translation files pass linting
- [x] FM helper supports p3
- [x] Zod validation shows interpolated messages
- [x] All unit tests pass
- [x] Both projects build successfully

## Changes Made

### New Files (4)
- `BaseClient/eslint-plugins/i18n-interpolation.mjs` - Custom ESLint rule
- `SyncfusionThemeStudio/eslint-plugins/i18n-interpolation.mjs` - Same rule (identical)
- `SyncfusionThemeStudio/src/localization/translation-error.ts` - TE() and resolveTranslationError()
- `SyncfusionThemeStudio/src/localization/translation-error.test.ts` - Unit tests

### Modified Files
- Both `eslint.config.mjs` - Added jsonc parser + i18n-interpolation rule registration
- Both `helpers.ts` - Added p3 param, fixed JSDoc to use `{{p1}}` syntax
- Both `en.json` - Fixed all non-standard/single-brace placeholders
- `SyncfusionThemeStudio/src/lib/forms/schemas/common.ts` - Use TE() for Zod messages
- 7x FormField components - Use resolveTranslationError() instead of FM()
- Both helpers test files - Added p3 test cases

## Test Results
- BaseClient: 1458 tests passed (115 suites), 0 lint errors, build OK
- SyncfusionThemeStudio: 439 tests passed (21 suites), 0 lint errors, build OK
