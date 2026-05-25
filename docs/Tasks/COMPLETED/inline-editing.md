# Inline Editing for Menu Editor (Phase 1.2, P1)

## Problem Statement
Currently, editing a category or item name/price requires expanding the category and using full input fields. Restaurant owners should be able to click directly on the collapsed category name or item name to edit it in-place, making the editor feel more direct and responsive.

## Implementation Plan

### New Files
1. `src/hooks/useInlineEdit.ts` - Reusable hook for inline edit state management
2. `src/hooks/useInlineEdit.test.ts` - Unit tests for the hook
3. `src/components/Shared/InlineEditableText.tsx` - Reusable inline editable text component
4. `src/components/Shared/InlineEditableText.test.tsx` - Unit tests for the component
5. `src/components/Shared/inlineEditableTextStyles.ts` - Styles for the component

### Modified Files
1. `src/components/OnlineMenus/CategoryEditor.tsx` - Add inline edit to category name in header
2. `src/components/OnlineMenus/MenuItemEditor.tsx` - Add inline edit to item name in header
3. `src/localization/locales/en.json` - Add translation keys for inline editing
4. `src/shared/testIds/commonTestIds.ts` - Add test IDs for inline edit component

### Success Criteria
- [x] Single click on category/item name text toggles to editable input
- [x] Input is pre-filled with current value and auto-focused
- [x] Enter or blur commits the change
- [x] Escape cancels and reverts to original value
- [x] Visual hover indicator (cursor change) shows text is editable
- [x] Validation: name must be non-empty
- [x] Calls appropriate update callback on commit
- [x] All text uses FM() from localization/helpers
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Unit tests for useInlineEdit hook logic
- [x] Unit tests for InlineEditableText component logic
- [x] Lint, YAGNI, unit tests, and build all pass

## Changes Made
- Created `useInlineEdit` hook with edit state management, commit, cancel, and validation
- Created `InlineEditableText` shared component with display/edit toggle
- Integrated inline editing into CategoryEditor (category name in header)
- Integrated inline editing into MenuItemEditor (item name in header)
- Added translation keys to `en.json` under `onlineMenus.inlineEdit`
- Added test IDs (`INLINE_EDIT_DISPLAY`, `INLINE_EDIT_INPUT`) to commonTestIds.ts
- Wrote 15 unit tests for `useInlineEdit` hook (state transitions, commit, cancel, validation, keyboard)
- Wrote 8 unit tests for `InlineEditableText` component (display/edit toggle, blur, keyboard events)
- Updated 6 existing test files to use testID-based selectors instead of text matching for category expansion

## Verification Results
- Lint: All new/modified files pass (remaining errors are pre-existing in unrelated files)
- YAGNI: No unused exports (PASS)
- Unit tests: All 23 new tests pass, all 18 updated tests pass
- Production build: PASS
