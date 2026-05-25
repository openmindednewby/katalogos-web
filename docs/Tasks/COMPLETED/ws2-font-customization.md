# WS2 - Font Customization (Expand Font Options + Custom Font Input)

## Status: COMPLETED

## Problem Statement
The typography editor currently only has 4 generic font family options (System, Serif, Sans-serif, Monospace). Users need access to popular Google Fonts and the ability to specify custom CSS font-family strings for full flexibility.

## Implementation Plan

### 1. Expand `FONT_FAMILY_OPTIONS` in `typographyConstants.ts`
- Added 12 popular Google Fonts after the existing 4 generic options
- Total: 16 font options (4 generic + 12 Google Fonts)
- Added `GENERIC_FONT_COUNT` and `TOTAL_FONT_COUNT` named constants

### 2. Add custom font support to `TypographyMenuPicker.tsx`
- Added `allowCustom` prop (defaults to false)
- When search text does not exactly match any option label, appends a "Use custom font: {searchText}" item
- Selecting it passes the raw search text as both label and value
- Added `hasExactFontMatch` helper (case-insensitive) to typographyConstants

### 3. Update `TypographySection.tsx`
- Added `allowCustom` prop to font family picker
- Replaced inline `FONT_FAMILY_OPTIONS.find()` with `getFontFamilyLabel()` helper
- Fixed type of `handleFontChange` to accept generic `MenuOption` instead of `FontFamilyOption`

### 4. Update `getCssFontFamily` in `typographyConstants.ts`
- Custom font values (not in FONT_FAMILY_OPTIONS) are returned as-is
- Added `getFontFamilyLabel` helper for display labels

### 5. Updated existing test for FONT_FAMILY_OPTIONS.length to 16

### 6. Wrote new unit tests
- New `typographyConstants.test.ts` file with 16 tests
- Added 6 custom font tests to `TypographyMenuPicker.test.tsx`

## Files Modified
1. `BaseClient/src/components/OnlineMenus/Styling/typographyConstants.ts` - Expanded font options, added helpers
2. `BaseClient/src/components/OnlineMenus/Styling/TypographyMenuPicker.tsx` - Custom font support
3. `BaseClient/src/components/OnlineMenus/Styling/TypographySection.tsx` - allowCustom prop, updated font label logic
4. `BaseClient/src/components/OnlineMenus/Styling/typographyEditorStyles.ts` - Added menuCustomOptionText style
5. `BaseClient/src/components/OnlineMenus/Styling/__tests__/TypographyMenuPicker.test.tsx` - Custom font tests
6. `BaseClient/src/components/OnlineMenus/Styling/__tests__/TypographyEditor.test.tsx` - Updated count assertion
7. `BaseClient/src/components/OnlineMenus/Styling/__tests__/typographyConstants.test.ts` - New test file

## Success Criteria
- [x] FONT_FAMILY_OPTIONS has 16 entries (4 generic + 12 Google Fonts)
- [x] Generic options remain at the top
- [x] Custom font option appears when search text has no exact match
- [x] Selecting custom font passes raw text as value
- [x] getCssFontFamily returns custom values as-is
- [x] All existing tests pass (with count update)
- [x] New unit tests for custom font logic pass
- [x] npm run lint:fix passes (0 errors in modified files)
- [x] npm run test:coverage passes (1353 tests, 110 suites)
- [x] npx expo export --platform web succeeds

## Test Results
- **Lint**: 0 errors in modified files (1 pre-existing warning in TypographyEditor.test.tsx for file length)
- **Unit Tests**: 1353 passed, 0 failed (110 suites)
- **Build**: Successful web export
