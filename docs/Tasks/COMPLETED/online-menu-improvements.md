# Online Menu Improvements

> **Reference**: CLAUDE.md, API_HOOKS_GUIDE.md, react-code-standards.md

## Status: COMPLETED

## Problem Statement
The online menu feature required several improvements:

1. **New "Active Menus" Tab**: Create a dedicated tab where users can filter and view only their active menus
2. **Show Template ID in List**: Display the ID of the active template in the menu list items
3. **Fix Decimal Number Input**: Decimal numbers like 0.5 don't work properly for price inputs

## Root Cause Analysis

### Decimal Number Input Issue
The original implementation in `MenuContentEditor.tsx` had:
```typescript
onChangeText={(text) => {
  const price = parseFloat(text);
  if (!isNaN(price)) {
    handleUpdateItem(categoryIndex, itemIndex, { price });
  }
}}
```

**Issue**: When typing "0.5":
1. User types "0" -> parseFloat("0") = 0 -> valid, updates to 0
2. User types "." -> parseFloat("0.") = 0 -> valid, updates to 0 (loses the ".")
3. The display `String(item.price ?? 0)` shows "0" not "0."

**Solution**: Created a `PriceInput` component that tracks raw text separately from parsed numeric value, only parsing on blur or when a complete valid number is entered.

## Implementation Plan

### 1. Add "Active Menus" Tab to Menu List Page - COMPLETED
**File**: `app/(protected)/menus/index.tsx`
- Added tab bar component above the list
- Created state for selected tab (`all` | `active`)
- Implemented filtering logic for active menus
- Added i18n keys for tab labels

### 2. Display External ID in Menu List Items - COMPLETED
**File**: `src/components/Tenants/TenantListItem.tsx`
- Added `showId?: boolean` prop (default: false)
- Added `idTestID?: string` prop
- Display external ID below the title when enabled
- Styled with secondary text color and smaller font

### 3. Fix Decimal Number Input - COMPLETED
**File**: `src/components/OnlineMenus/MenuContentEditor.tsx`
- Created new `PriceInput` component that:
  - Tracks raw text input separately from parsed number
  - Validates with regex pattern: `/^(\d*\.?\d*)?$/`
  - Allows intermediate states like "0." during typing
  - Parses and validates on blur
  - Rejects invalid characters (letters, symbols)
  - Normalizes display on blur (e.g., "0." becomes "0")

### 4. Add New TestIds - COMPLETED
**File**: `src/shared/testIds.ts`
- Added `MENU_TAB_ALL: 'menu-tab-all'`
- Added `MENU_TAB_ACTIVE: 'menu-tab-active'`
- Added `MENU_CARD_ID: 'menu-card-id'`

### 5. Add i18n Keys - COMPLETED
**File**: `src/localization/locales/en.json`
- Added `onlineMenus.tabs.all: "All Menus"`
- Added `onlineMenus.tabs.active: "Active Menus"`
- Added `onlineMenus.id: "ID"`
- Added `onlineMenus.copyId: "Copy ID"`

### 6. Write Unit Tests - COMPLETED
**File**: `src/components/OnlineMenus/__tests__/MenuContentEditor.test.tsx`
- Added tests for decimal number input handling:
  - `allows typing decimal numbers like 0.5`
  - `allows typing multi-decimal prices like 12.99`
  - `does not update price for intermediate states like a single decimal point`
  - `rejects non-numeric characters in price input`

## Files Modified

1. **`app/(protected)/menus/index.tsx`**
   - Added `MenuTabFilter` type
   - Added `activeTab` state
   - Added `allItems` and filtered `items` memos
   - Added `renderTabBar` callback
   - Added `showId` and `idTestID` props to TenantListItem
   - Added tab bar to render output
   - Added screen styles for tabs

2. **`src/components/Tenants/TenantListItem.tsx`**
   - Added `showId?: boolean` prop (default: false)
   - Added `idTestID?: string` prop
   - Added `idText` style
   - Added conditional rendering of ID below title

3. **`src/components/OnlineMenus/MenuContentEditor.tsx`**
   - Added `PriceInput` component (~80 lines)
   - Replaced inline price TextInput with PriceInput component

4. **`src/shared/testIds.ts`**
   - Added `MENU_TAB_ALL`, `MENU_TAB_ACTIVE`, `MENU_CARD_ID`

5. **`src/localization/locales/en.json`**
   - Added `onlineMenus.tabs.all`, `onlineMenus.tabs.active`, `onlineMenus.id`, `onlineMenus.copyId`

6. **`src/components/OnlineMenus/__tests__/MenuContentEditor.test.tsx`**
   - Added 4 new tests for decimal price input handling

## Success Criteria

- [x] Active Menus tab shows only menus with isActive === true
- [x] All Menus tab shows all menus (existing behavior)
- [x] External ID is visible in the menu list
- [x] Decimal numbers (0.5, 1.25, etc.) can be entered correctly
- [x] All unit tests pass (237 tests)
- [x] Linting passes with no errors (only warnings)
- [x] Build succeeds

## Test Results

### ESLint
```
npm run lint:fix
- 0 errors
- 5 warnings (acceptable - array index keys and complexity)
```

### Unit Tests
```
npm run test:coverage
- Test Suites: 42 passed, 42 total
- Tests: 237 passed, 237 total
- Coverage: 75.99% statements, 65.7% branches, 75.12% functions, 77.37% lines
```

### Build
```
npx expo export --platform web
- Bundle size: 1.62 MB (1019 modules)
- Build time: 8913ms
- Status: SUCCESS
```

## Summary of Changes

### User-Facing Changes
1. **Tab Bar**: Users can now switch between "All Menus" and "Active Menus" tabs
2. **ID Display**: Each menu card now shows its external ID below the title
3. **Decimal Prices**: Users can now enter decimal prices like $0.50 or $12.99 without issues

### Technical Changes
1. Created reusable `PriceInput` component for proper decimal handling
2. Extended `TenantListItem` with optional ID display capability
3. Added tab filtering infrastructure that can be reused for other filter types
4. Added accessibility support for tab navigation

### Code Quality
- All changes follow react-code-standards.md
- Proper TypeScript typing throughout
- Full accessibility support (labels, hints, roles)
- Comprehensive unit test coverage for new logic
- No ESLint errors
