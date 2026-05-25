# Box Style Editor Component

> **Reference**: Menu Customization Feature Task 2.5

## Status: COMPLETED

## Problem Statement
Create a reusable BoxStyleEditor component for editing BoxStyling properties from `src/types/menuStyleTypes.ts`. This component will be used for styling category boxes, item boxes, and other container elements in the menu customization feature.

## Implementation Plan

1. Create constants file `boxStyleEditorConstants.ts` with:
   - Range constants (min/max for border width, radius, padding)
   - Color input configuration

2. Create styles file `boxStyleEditorStyles.ts` with:
   - Component styles following existing patterns

3. Create main component `BoxStyleEditor.tsx` with:
   - Props: value, onChange, label (optional)
   - Border color input
   - Border width slider (0-4)
   - Border radius slider (0-24)
   - Shadow enabled toggle
   - Padding slider (0-32)
   - Live preview box showing current styling

4. Create unit tests `__tests__/BoxStyleEditor.test.tsx` with:
   - Tests for all property changes
   - Tests for preview rendering with styles
   - Tests for shadow toggle behavior
   - Edge cases (empty values, partial values)
   - 80%+ coverage target

## Files Created

- `src/components/OnlineMenus/Styling/boxStyleEditorConstants.ts` - Constants for ranges, validation
- `src/components/OnlineMenus/Styling/boxStyleEditorStyles.ts` - StyleSheet definitions
- `src/components/OnlineMenus/Styling/BoxStyleEditor.tsx` - Main component
- `src/components/OnlineMenus/Styling/SliderRow.tsx` - Extracted slider component for reusability
- `src/components/OnlineMenus/Styling/__tests__/BoxStyleEditor.test.tsx` - Unit tests

## Files Modified

- `src/shared/testIds.ts` - Added 14 test IDs for BoxStyleEditor elements

## Success Criteria
- [x] Component renders all controls (1 color input, 3 sliders, 1 toggle)
- [x] Live preview box displays current styling accurately
- [x] All property changes call onChange with updated values
- [x] Shadow toggle works correctly
- [x] Unit tests pass with 80%+ coverage (achieved 98.68% statements, 100% lines)
- [x] `npm run lint:fix` passes (only warnings for file length, no errors)
- [x] `npm run test -- --testPathPattern="BoxStyleEditor"` passes (38 tests)
- [x] No magic numbers or hardcoded colors (all values in constants)
- [x] All interactive elements have testID and accessibility props

## Changes Made

### BoxStyleEditor.tsx
- Created main component with Props interface: `{ value: BoxStyling; onChange: (value: BoxStyling) => void; label?: string; disabled?: boolean }`
- Implements border color input with hex validation
- Implements border width slider (0-4px, step 1)
- Implements border radius slider (0-24px, step 2)
- Implements padding slider (0-32px, step 4)
- Implements shadow toggle with preview
- Live preview box shows all styling including shadow effects
- Full theme support (light/dark mode)
- All accessibility props included

### SliderRow.tsx
- Extracted reusable slider component with increment/decrement buttons
- Can be reused by other styling editors
- Full accessibility support with role="adjustable"

### boxStyleEditorConstants.ts
- Range constants for all sliders
- Hex color validation function
- Default values and preview colors
- Shadow configuration constants

### testIds.ts
- Added 14 new test IDs:
  - BOX_STYLE_EDITOR
  - BOX_STYLE_PREVIEW
  - BOX_STYLE_BACKGROUND_COLOR_INPUT/SWATCH
  - BOX_STYLE_BORDER_COLOR_INPUT/SWATCH
  - BOX_STYLE_BORDER_WIDTH_SLIDER/DECREASE/INCREASE
  - BOX_STYLE_BORDER_RADIUS_SLIDER/DECREASE/INCREASE
  - BOX_STYLE_PADDING_SLIDER/DECREASE/INCREASE
  - BOX_STYLE_SHADOW_TOGGLE

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       38 passed, 38 total

Coverage:
- BoxStyleEditor.tsx:         97.67% statements, 100% lines
- SliderRow.tsx:             100% statements, 100% lines
- boxStyleEditorConstants.ts: 100% statements, 100% lines
- Overall:                   98.68% statements, 100% lines
```

Test categories:
- Rendering (6 tests)
- Border color input (5 tests)
- Border width slider (5 tests)
- Border radius slider (3 tests)
- Padding slider (3 tests)
- Shadow toggle (4 tests)
- Preview box (3 tests)
- Disabled state (3 tests)
- Edge cases (3 tests)
- Accessibility (3 tests)
