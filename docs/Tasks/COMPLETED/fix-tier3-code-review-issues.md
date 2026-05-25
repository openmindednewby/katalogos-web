# Fix Tier 3 Code Review Issues (COMPLETED)

## Problem Statement
Code review found 8 MEDIUM issues across Tier 3 frontend features including hardcoded colors, missing testIDs, hardcoded strings, string literal testIDs, magic numbers, and duplicate accessibility labels.

## Issues Fixed
1. **Hardcoded colors in ShareButton.tsx** -- Removed `BACKGROUND_COLOR`, `TEXT_COLOR`, `SUCCESS_COLOR` constants. Added `surfaceColor`, `surfaceTextColor`, `successColor` props. Updated MenuContentView.tsx to pass them through.
2. **Missing testID on EditorTabButton.tsx** -- Added `testID: string` to Props. Added `MENU_TAB_METADATA`, `MENU_TAB_CONTENT`, `MENU_TAB_PREVIEW` to menuTestIds.ts. Updated FullMenuEditor.tsx to pass testIDs.
3. **Hardcoded strings in PreviewMenuItemCard.tsx** -- Added `onlineMenus.previewCard.itemImageHint/Label/itemVideoHint/Label` translation keys. Replaced hardcoded English strings with FM() calls.
4. **Hardcoded string in ItemPrice.tsx** -- Added `onlineMenus.priceHint` translation key. Replaced `Price is ${displayText}` with `FM('onlineMenus.priceHint', displayText)`.
5. **String literal testIDs in VariantGroupEditor/ModifierGroupEditor** -- Replaced `SECTION_TEST_ID` local constants and `"variant-group-add-button"` / `"modifier-group-add-button"` with `TestIds.*` constants.
6. **String literal testIDs in VariantGroupCard/ModifierGroupCard** -- Imported TestIds and replaced all raw string prefixes with `TestIds.*` constants.
7. **Magic number borderRadius in card components** -- Added `SMALL_BUTTON_BORDER_RADIUS = 4` constant in both card components.
8. **Duplicate accessibility label/hint in PlanComparisonSection.tsx** -- Added `settings.billing.monthlyCycleHint` and `settings.billing.annualCycleHint` translation keys. Used distinct hints.

## Verification Results
- frontend-lint-fix: PASSED
- frontend-unit-tests: PASSED (232 suites, 2965 tests)
- frontend-prod-build: PASSED

## Note
Initial attempt used `onlineMenus.preview` as the translation key namespace, which conflicted with the existing `onlineMenus.preview` string value ("Preview"). Renamed to `onlineMenus.previewCard` to avoid the key collision.

## Files Modified
- `BaseClient/src/components/PublicMenu/components/ShareButton.tsx`
- `BaseClient/src/components/PublicMenu/components/MenuContentView.tsx`
- `BaseClient/src/features/onlinemenus/components/EditorTabButton.tsx`
- `BaseClient/src/features/onlinemenus/components/FullMenuEditor.tsx`
- `BaseClient/src/components/OnlineMenus/PreviewMenuItemCard.tsx`
- `BaseClient/src/components/OnlineMenus/Display/components/ItemPrice.tsx`
- `BaseClient/src/components/OnlineMenus/VariantGroupEditor.tsx`
- `BaseClient/src/components/OnlineMenus/ModifierGroupEditor.tsx`
- `BaseClient/src/components/OnlineMenus/components/VariantGroupCard.tsx`
- `BaseClient/src/components/OnlineMenus/components/ModifierGroupCard.tsx`
- `BaseClient/src/components/Settings/BillingSettings/components/PlanComparisonSection.tsx`
- `BaseClient/src/shared/testIds/menuTestIds.ts`
- `BaseClient/src/localization/locales/en.json`
