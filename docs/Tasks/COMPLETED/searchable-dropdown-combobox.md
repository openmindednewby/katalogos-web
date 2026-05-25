# WS1 - Searchable Dropdown (FormNativeSelect + TypographyMenuPicker)

## Status: COMPLETED

## Problem Statement
Transform `FormNativeSelect` from a native `<select>` into a searchable combobox, and upgrade `TypographyMenuPicker` with search filtering to improve UX when lists of options are long.

## Implementation Plan

### Part 1: FormNativeSelect (web-only HTML combobox)
1. Replaced `<select>` with text `<input>` + positioned `<ul>` dropdown
2. Added filtering logic (case-insensitive substring match) via `useCombobox` hook
3. Added keyboard navigation (Arrow keys, Enter, Escape)
4. Added click-outside-to-close behavior
5. Added full ARIA attributes for accessibility
6. Kept exact same external Props API (backward compatible)
7. Extracted helper hook `useCombobox` to keep component under 200 lines

### Part 2: CSS Styles
1. Added combobox-specific CSS classes to styles.ts

### Part 3: TypographyMenuPicker (React Native Modal)
1. Added TextInput at top of modal for filtering
2. Filter options as user types (case-insensitive)
3. Highlight matching text in option labels (bold)
4. Keep existing modal open/close pattern
5. Reset search text on close/select

### Part 4: Unit Tests
1. 24 tests for useCombobox hook (filtering, selection, keyboard nav, click-outside)
2. 10 tests for TypographyMenuPicker (filtering, selection, disabled state)

## Files Modified
- `BaseClient/src/components/ui/form-fields/FormNativeSelect.tsx` - Replaced select with combobox
- `BaseClient/src/features/showcase/pages/NativeFormsPage/styles.ts` - Added combobox CSS
- `BaseClient/src/components/OnlineMenus/Styling/TypographyMenuPicker.tsx` - Added search filtering
- `BaseClient/src/components/OnlineMenus/Styling/typographyEditorStyles.ts` - Added search input styles

## Files Created
- `BaseClient/src/components/ui/form-fields/useCombobox.ts` - Extracted combobox logic hook
- `BaseClient/src/components/ui/form-fields/__tests__/useCombobox.test.ts` - Unit tests (24 tests)
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/TypographyMenuPicker.test.tsx` - Unit tests (10 tests)

## Success Criteria
- [x] FormNativeSelect works as searchable combobox
- [x] TypographyMenuPicker has search filtering in modal
- [x] All ARIA attributes present (role=combobox, aria-expanded, aria-controls, aria-activedescendant, role=listbox, role=option, aria-selected, aria-autocomplete, aria-describedby, aria-invalid)
- [x] Keyboard navigation works (arrows, enter, escape)
- [x] Click outside closes dropdown
- [x] Backward compatible Props API
- [x] Components under 200 lines
- [x] Functions under 50 lines
- [x] Unit tests pass (34 new tests, 1307 total)
- [x] Lint passes (0 errors)
- [x] Build succeeds
- [x] Existing TypographyEditor tests still pass (30 tests)

## Test Results
- All 1307 tests pass across 108 test suites
- 34 new tests added (24 useCombobox + 10 TypographyMenuPicker)
- 0 lint errors on all modified/created files
- Web build succeeds
- No TypeScript errors in modified files
