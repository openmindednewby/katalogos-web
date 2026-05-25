# Price Style Editor Component

> **Reference**: Menu Customization Feature - Task 2.6

## Status: COMPLETED

## Problem Statement
Create a component for editing PriceStyle from the menu style types. This is part of the Menu Customization Feature (Phase 2) that enables tenants to customize how prices are displayed on their menus.

## Implementation Plan

1. Create `PriceStyleEditor.tsx` component with controls for:
   - Font size (12-32 range slider)
   - Font weight (dropdown: normal, medium, semibold, bold)
   - Color (color input)
   - Currency symbol position (before, after)
   - Show currency toggle
   - Strikethrough for original price toggle (for discounts)
   - Live preview showing price formatting

2. Create `priceStyleEditorStyles.ts` for component styles

3. Add test IDs to `testIds.ts`

4. Create unit tests in `__tests__/PriceStyleEditor.test.tsx`

## Files Created/Modified

### New Files
- `BaseClient/src/components/OnlineMenus/Styling/PriceStyleEditor.tsx` - Main component (170 lines)
- `BaseClient/src/components/OnlineMenus/Styling/PriceStylePreview.tsx` - Live preview subcomponent (59 lines)
- `BaseClient/src/components/OnlineMenus/Styling/PriceStyleControls.tsx` - Reusable control components (235 lines)
- `BaseClient/src/components/OnlineMenus/Styling/priceStyleConstants.ts` - Constants and helper functions (56 lines)
- `BaseClient/src/components/OnlineMenus/Styling/priceStyleEditorStyles.ts` - StyleSheet (104 lines)
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/PriceStyleEditor.test.tsx` - Unit tests (348 lines)

### Modified Files
- `BaseClient/src/shared/testIds.ts` - Added 9 new test IDs for PriceStyleEditor
- `BaseClient/package.json` - Added react-native-paper dependency

## Success Criteria
- [x] Component renders all required controls
- [x] Live preview shows formatted price with current settings
- [x] onChange is called with updated PriceStyle on any change
- [x] Unit tests pass (26 tests)
- [x] `npm run lint:fix` passes (no errors, only warnings for file length)
- [x] `npm run test -- --testPathPattern="PriceStyleEditor"` passes
- [x] `npx expo export --platform web` succeeds

## Changes Made

### Component Architecture
The component was split into multiple files to keep each under the 200-line limit:

1. **PriceStyleEditor.tsx** - Main container component that:
   - Manages state for font weight menu visibility and color validation errors
   - Provides handlers for all property changes
   - Computes default values when properties are undefined
   - Renders all subcomponents with proper theming

2. **PriceStyleControls.tsx** - Reusable control components:
   - `FontSizeControl` - Slider for font size (12-32 range)
   - `FontWeightControl` - Dropdown menu for font weight
   - `ColorInputControl` - Hex color input with swatch preview
   - `CurrencyPositionControl` - Segmented buttons for before/after
   - `ToggleControl` - Generic switch component

3. **PriceStylePreview.tsx** - Live preview component that:
   - Shows formatted price with current settings
   - Applies font size, weight, color from props
   - Shows strikethrough when enabled
   - Formats currency position correctly

4. **priceStyleConstants.ts** - Constants and helpers:
   - Font size limits (MIN=12, MAX=32, DEFAULT=18)
   - Font weight options array
   - `parseCurrencyPosition()` - Type-safe position parser
   - `formatPricePreview()` - Preview text formatter
   - `getFontWeightLabel()` - Label lookup helper

### Test Coverage
26 tests covering:
- Font size changes via slider
- Font weight selection via dropdown
- Color input validation (valid/invalid hex)
- Currency position toggling
- Show currency toggle
- Strikethrough toggle
- Preview display formats
- Disabled state behavior
- Accessibility (testIDs present)
- Edge cases (empty/partial values)

## Test Results

```
PASS src/components/OnlineMenus/Styling/__tests__/PriceStyleEditor.test.tsx
  PriceStyleEditor
    font size - 3 tests passed
    font weight - 5 tests passed
    color input - 5 tests passed
    currency position - 2 tests passed
    show currency toggle - 2 tests passed
    strikethrough toggle - 2 tests passed
    preview - 3 tests passed
    disabled state - 1 test passed
    accessibility - 1 test passed
    edge cases - 2 tests passed

Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
```

## Dependencies Added
- `react-native-paper` - For Menu, SegmentedButtons, and Switch components
- `react-native-safe-area-context` - Peer dependency of react-native-paper
