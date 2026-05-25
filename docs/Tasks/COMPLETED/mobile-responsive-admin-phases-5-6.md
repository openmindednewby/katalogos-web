# Mobile-Responsive Admin: Phases 5-6

## Status: COMPLETED
## Priority: P1
## Started: 2026-03-18
## Depends on: Phases 1-4 (COMPLETED)

## Problem Statement

The menu editor modal and settings/forms screens do not work well on phone screens (<=480px). Restaurant owners frequently edit menus and settings on their phones between service shifts. The menu editor modal uses fixed maxWidth values that waste space on phones, tab buttons have excessive padding, and operating hours rows overflow horizontally.

## Phase 5: Menu Editor Modal

### Changes

- [x] FullMenuEditor: full-screen on phone (no maxWidth, no overlay padding, flex: 1)
- [x] FullMenuEditor: reduce tab padding on phone (12px H, 8px V) with equal-width tabs
- [x] FullMenuEditor: reduce tab font size on phone (14px vs 16px)
- [x] FullMenuEditor: button row stacks vertically on phone
- [x] FullMenuEditor: extracted TabButton to EditorTabButton.tsx to stay under 200-line limit
- [x] FullMenuEditor: extracted toLocalMenuContents to menuContentsAdapter.ts
- [x] MenuEditorModalStyles: full-screen on phone, vertical button stacking
- [x] MenuEditorModal: responsive styles via useBreakpoint
- [x] CategoryEditor: content pickers stack vertically on phone
- [x] CategoryEditor: reduced card padding on phone
- [x] MenuItemEditor: content pickers stack vertically on phone
- [x] MenuItemEditor: reduced item indent on phone (4px vs 16px marginLeft)
- [x] Fix hardcoded accessibility strings in FullMenuEditor (cancel/save hints+labels)
- [x] Fix hardcoded accessibility strings in MetadataTab (name/description hints+labels)
- [x] Fix hardcoded accessibility strings in CategoryEditor (toggle/delete/name/desc/add item)
- [x] Fix hardcoded accessibility strings in MenuItemEditor (delete/name/price/availability)
- [x] Fix hardcoded accessibility strings in MenuContentEditor (add category)
- [x] All new FM() calls have corresponding keys in en.json

### Phase 6: Forms & Settings

- [x] DayHoursRow: stack row vertically on phone (day label, time inputs, switch)
- [x] DayHoursRow: bold day label on phone, auto-width instead of fixed 100px
- [x] BillingHistoryTable: horizontal ScrollView wrapper on phone
- [x] PlanComparisonSection: plan grid stacks vertically on phone (column layout)

## Files Created
- `src/features/onlinemenus/components/EditorTabButton.tsx` -- extracted tab button sub-component
- `src/features/onlinemenus/components/menuContentsAdapter.ts` -- extracted DTO adapter

## Files Modified

### Phase 5
- `src/features/onlinemenus/components/FullMenuEditor.tsx` -- responsive modal + tabs + buttons, FM() accessibility
- `src/components/OnlineMenus/MenuEditorModalStyles.ts` -- phone styles for overlay, modal, buttons
- `src/features/onlinemenus/components/MenuEditorModal.tsx` -- responsive styles, FM() accessibility
- `src/components/OnlineMenus/categoryEditorStyles.ts` -- phone styles for card, content pickers
- `src/components/OnlineMenus/CategoryEditor.tsx` -- useBreakpoint, FM() accessibility, responsive pickers
- `src/components/OnlineMenus/MenuItemEditor.tsx` -- useBreakpoint, FM() accessibility, responsive pickers
- `src/components/OnlineMenus/MenuContentEditor.tsx` -- FM() accessibility for add category button
- `src/components/OnlineMenus/MetadataTab.tsx` -- FM() accessibility for name/description inputs

### Phase 6
- `src/components/Settings/BusinessProfileSettings/components/DayHoursRow.tsx` -- vertical layout on phone
- `src/components/Settings/BillingSettings/components/BillingHistoryTable.tsx` -- horizontal scroll on phone
- `src/components/Settings/BillingSettings/components/PlanComparisonSection.tsx` -- column grid on phone

### Translation keys added to en.json
- `onlineMenus.tab.metadataHint` -- "Edit menu name and description"
- `onlineMenus.tab.contentHint` -- "Edit menu categories and items"
- `onlineMenus.tab.previewHint` -- "Preview how the menu will look"
- `onlineMenus.cancelHint` -- "Cancel and close the editor"
- `onlineMenus.saveHint` -- "Save the menu"
- `onlineMenus.menuNameLabel` -- "Menu name"
- `onlineMenus.menuNameHint` -- "Enter the menu name"
- `onlineMenus.menuDescriptionLabel` -- "Menu description"
- `onlineMenus.menuDescriptionHint` -- "Enter an optional description"
- `onlineMenus.addCategoryHint` -- "Add a new category to the menu"
- `onlineMenus.toggleCategoryLabel` -- "Toggle category {{p1}}"
- `onlineMenus.expandCategoryHint` -- "Expand this category"
- `onlineMenus.collapseCategoryHint` -- "Collapse this category"
- `onlineMenus.deleteCategoryLabel` -- "Delete category {{p1}}"
- `onlineMenus.deleteCategoryHint` -- "Delete this category"
- `onlineMenus.categoryNameLabel` -- "Category name input"
- `onlineMenus.categoryNameInputHint` -- "Enter the name for this category"
- `onlineMenus.categoryDescriptionLabel` -- "Category description input"
- `onlineMenus.categoryDescriptionInputHint` -- "Enter an optional description for this category"
- `onlineMenus.addItemHint` -- "Add a new menu item to this category"
- `onlineMenus.deleteItemLabel` -- "Delete item {{p1}}"
- `onlineMenus.deleteItemHint` -- "Delete this menu item"
- `onlineMenus.itemNameLabel` -- "Menu item name input"
- `onlineMenus.itemNameInputHint` -- "Enter the name for this menu item"
- `onlineMenus.priceLabel` -- "Menu item price input"
- `onlineMenus.priceInputHint` -- "Enter the price for this menu item"
- `onlineMenus.toggleAvailabilityHint` -- "Toggle item availability"

## Quality Checks
- [x] `frontend-lint-fix` -- PASS (no new errors; remaining 14 errors + 7 warnings are all pre-existing)
- [x] `frontend-yagni` -- PASS (no unused exports)
- [x] `frontend-unit-tests` -- PASS
- [x] `frontend-prod-build` -- PASS
