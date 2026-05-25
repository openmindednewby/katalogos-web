# AI Menu Descriptions - Frontend

## Status: COMPLETED

## Problem Statement
Add an "AI Generate Description" feature to the menu item editor, allowing users to generate professional menu item descriptions using AI. The backend endpoint `POST /TenantMenus/{externalId}/generate-description` is already implemented.

## Implementation Summary

### New files created
- `BaseClient/src/hooks/useGenerateMenuItemDescription.ts` -- React Query mutation hook wrapping the AI generation endpoint
- `BaseClient/src/hooks/useGenerateMenuItemDescription.test.tsx` -- Unit tests (5 tests covering API call, success, error, pending states)
- `BaseClient/src/components/OnlineMenus/components/AiDescriptionButton.tsx` -- UI button with loading/error states
- `BaseClient/src/components/OnlineMenus/components/MenuItemContentPickers.tsx` -- Extracted from MenuItemEditor to reduce complexity

### Modified files
- `BaseClient/src/shared/testIds/menuTestIds.ts` -- Added AI test IDs
- `BaseClient/src/localization/locales/en.json` -- Added 7 translation keys under `onlineMenus`
- `BaseClient/src/components/OnlineMenus/MenuItemEditor.tsx` -- Added description TextInput + AiDescriptionButton, new optional props `menuExternalId` and `categoryName`
- `BaseClient/src/components/OnlineMenus/CategoryEditor.tsx` -- Threads `menuExternalId` and `category.name` to MenuItemEditor
- `BaseClient/src/components/OnlineMenus/MenuContentEditor.tsx` -- Receives and passes optional `menuExternalId`
- `BaseClient/src/features/onlinemenus/components/FullMenuEditor.tsx` -- Passes `item?.externalId` to MenuContentEditor

### Verification results
- `frontend-lint-fix`: PASSED (zero errors, zero warnings)
- `frontend-unit-tests`: PASSED (232 suites, 2965 tests)
- `frontend-prod-build`: PASSED

## Success Criteria
- [x] AI button visible in menu item editor (when menuExternalId is available)
- [x] Clicking generates description via backend API
- [x] Description populates the description TextInput via onUpdate callback
- [x] Loading state shown during generation (ActivityIndicator + "Generating..." text)
- [x] Error state shown on failure (auto-dismisses after 4 seconds)
- [x] All text uses FM() translations
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Lint, unit tests, and build pass
