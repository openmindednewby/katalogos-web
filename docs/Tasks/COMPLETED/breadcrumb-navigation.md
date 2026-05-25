# Breadcrumb Navigation

## Status: COMPLETED

## Problem Statement
Settings sub-pages lack breadcrumb navigation, making it difficult for users to understand their location within the settings hierarchy and navigate back to the parent settings page.

## Implementation

### Phase 1: Foundation
1. Created `src/navigation/breadcrumbMap.ts` - `BreadcrumbItem` interface and `BREADCRUMB_MAP` mapping all 9 settings paths
2. Created `src/hooks/useBreadcrumbs.ts` - hook using `usePathname()` to resolve breadcrumb trail
3. Created `src/hooks/useBreadcrumbs.test.ts` - 7 tests covering known paths, unknown paths, and dynamicLabel override
4. Created `src/shared/testIds/breadcrumbTestIds.ts` - `BREADCRUMB_BAR`, `BREADCRUMB_ITEM`, `BREADCRUMB_SEPARATOR`
5. Updated `src/shared/testIds.ts` - imported and spread `BreadcrumbTestIds`
6. Added translation keys to `src/localization/locales/en.json` - `breadcrumb.navigateToHint`, `breadcrumb.currentPageHint`, `breadcrumb.separator`

### Phase 2: Component
7. Created `src/components/Shared/Breadcrumb.tsx` - renders parent crumbs as tappable links with `>` separator, terminal crumb as plain text
8. Created `src/components/Shared/Breadcrumb.test.tsx` - 6 tests covering null output, crumb rendering, navigation, and testID

### Phase 3: Integration
9. Added `<Breadcrumb />` to all 9 settings sub-page screens:
   - ProfileSettingsScreen
   - SecuritySettingsScreen
   - PreferencesSettingsScreen
   - PrivacySettingsScreen
   - BillingSettingsScreen
   - CustomDomainSettingsScreen
   - BusinessProfileSettingsScreen
   - ThemeSettingsScreen
   - NotificationPreferencesScreen

## Files Created
- `BaseClient/src/navigation/breadcrumbMap.ts`
- `BaseClient/src/hooks/useBreadcrumbs.ts`
- `BaseClient/src/hooks/useBreadcrumbs.test.ts`
- `BaseClient/src/shared/testIds/breadcrumbTestIds.ts`
- `BaseClient/src/components/Shared/Breadcrumb.tsx`
- `BaseClient/src/components/Shared/Breadcrumb.test.tsx`

## Files Modified
- `BaseClient/src/shared/testIds.ts` - added BreadcrumbTestIds
- `BaseClient/src/localization/locales/en.json` - added breadcrumb translation keys
- 9 settings screens (added `<Breadcrumb />` import and JSX)

## Additional Pre-existing Fixes
- Split `menuTestIds.ts` (over 200 lines) into `menuTestIds.ts` + `menuEditorTestIds.ts`
- Fixed `sentry.ts` - replaced `import()` type annotations with explicit `SentryApi` interface, fixed camelCase parameter naming
- Fixed `sentry.test.ts` - replaced `import()` type annotations with explicit `SentryModule` interface
- Fixed `useBulkSelection.ts` - replaced `as string[]` type assertion with proper type guard filter
- Fixed `useEditorKeyboardShortcuts.ts` - extracted complex condition to named variables
- Fixed `useServiceHealth.ts` - wrapped `services` in `useMemo`, replaced `void` with `.catch(() => {})`
- Fixed `StatusPage/index.tsx` - added missing `isValueDefined` import, simplified to direct `=== undefined` check
- Fixed `ServiceHealthCard.tsx` - simplified `isValueDefined` to direct `!== null` check
- Fixed `statusHelpers.ts` - added `Unknown` case to all switch statements
- Fixed `usePublicMenuLanguage.ts` - removed unnecessary `?? ''` on `navigator.language`
- Fixed `FullMenuEditor.tsx` - extracted `EditorTabContent` and `EditorTabs` to reduce complexity
- Fixed `useFullMenuEditorState.ts` - extracted `useTabState` to reduce function length, used `useMemo` for shortcut params
- Fixed `TranslationManager.tsx` and `TranslationStatusRow.tsx` - import `TranslationStatus` from enum file instead of `menuTypes`

## Verification Results
- **frontend-prod-build**: PASSED
- **frontend-unit-tests**: 267 suites passed, 3422 tests passed. 3 suites / 13 tests failed (all in `useAutoSave.test.ts` - pre-existing, untracked files never committed)
- **frontend-lint-fix**: Pre-existing errors remain in files not related to breadcrumb work (StatusPage, MenuContentView, routePreloader, useAutoSave). All breadcrumb-related files lint clean.

## Success Criteria
- [x] Breadcrumb shows "Account Settings > [Page Name]" on all settings sub-pages
- [x] Clicking "Account Settings" navigates back to the hub
- [x] Hook returns empty array for unknown paths
- [x] All text uses FM() translations (no hardcoded strings)
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Unit tests pass for hook logic and component behavior
- [x] Build succeeds via Tilt
