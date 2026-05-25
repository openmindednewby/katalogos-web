# Menu Style Generator Utility

> **Reference**: Task 3.1 from menu-customization-feature.md

## Status: COMPLETED

## Problem Statement

Create a utility that converts menu styling settings to React Native StyleSheet objects. This utility is needed for the Menu Customization Feature to apply dynamic styling based on tenant configurations.

## Implementation Plan

1. Create `BaseClient/src/utils/menuStyleGenerator.ts` with the following functions:
   - `generateCategoryStyles()` - generates styles for a category
   - `generateItemStyles()` - generates styles for a menu item
   - `generateTypographyStyles()` - generates text styles from GlobalTypography
   - `generateBoxStyles()` - generates container styles from BoxStyling
   - `generateMediaStyles()` - generates image styles from MediaSettings

2. Each function should:
   - Accept the corresponding type from menuStyleTypes.ts
   - Merge with defaults from menuDefaults.ts when properties are undefined
   - Return proper React Native style objects (ViewStyle, TextStyle, ImageStyle)

3. Create comprehensive unit tests in `__tests__/menuStyleGenerator.test.ts`

## Files Modified

- `BaseClient/src/utils/menuStyleGenerator.ts` (CREATED - 257 lines)
- `BaseClient/src/utils/__tests__/menuStyleGenerator.test.ts` (CREATED - 768 lines)

## Implementation Details

### Main Generator Functions

1. **generateCategoryStyles(category, colorScheme)** - Returns `CategoryStyles` with:
   - container: ViewStyle (padding, margin, borders, shadows)
   - title: TextStyle (font size, weight, color, alignment)
   - description: TextStyle
   - image: ImageStyle

2. **generateItemStyles(item, colorScheme)** - Returns `ItemStyles` with:
   - container: ViewStyle (includes minHeight, maxWidth)
   - name: TextStyle
   - description: TextStyle
   - price: TextStyle
   - image: ImageStyle

3. **generateTypographyStyles(typography, colorScheme)** - Returns `TypographyStyles` with:
   - title: TextStyle (with fontFamily)
   - body: TextStyle
   - price: TextStyle

4. **generateBoxStyles(box, colorScheme)** - Returns ViewStyle with full box model

5. **generateMediaStyles(media)** - Returns ImageStyle with:
   - Dimensions based on size preset (thumbnail/small/medium/large/custom/full)
   - resizeMode mapped from fit property
   - borderRadius and opacity

### Additional Helper Functions

- `generateCategoryTypographyStyles()` - Category-specific typography
- `generateItemTypographyStyles()` - Item-specific typography
- `generatePriceStyles()` - Price-specific styles

### Key Features

- All functions handle undefined inputs gracefully
- Merges user settings with defaults from menuDefaults.ts
- Uses colorScheme for default colors when not specified
- Cross-platform shadow support (iOS shadowColor/shadowOffset/shadowRadius/shadowOpacity, Android elevation)
- Maps MediaFit to React Native resizeMode
- Maps ContentAlignment to textAlign

## Success Criteria

- [x] All 5+ generator functions implemented
- [x] Default value handling for undefined properties
- [x] Unit tests with 80%+ coverage (achieved 100% lines, 94.44% branches)
- [x] `npm run lint -- src/utils/menuStyleGenerator.ts` passes (only file length warning)
- [x] `npm run test -- --testPathPattern="menuStyleGenerator"` passes (63 tests)
- [x] `npx expo export --platform web` succeeds

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       63 passed, 63 total

Coverage for menuStyleGenerator.ts:
- Statements: 100%
- Branches: 94.44%
- Functions: 100%
- Lines: 100%
```

### Test Categories

1. **generateCategoryStyles tests** (10 tests)
   - Default styles, typography, layout alignment, box styling, shadows, colorScheme integration

2. **generateItemStyles tests** (8 tests)
   - Default styles, typography, layout, price styling, box model, colorScheme

3. **generateTypographyStyles tests** (5 tests)
   - Default styles, typography settings, System font handling, colorScheme

4. **generateBoxStyles tests** (7 tests)
   - Default styles, all properties, shadow on/off, colorScheme, default shadow color

5. **generateMediaStyles tests** (9 tests)
   - Default styles, all sizes (thumbnail/small/medium/large/custom/full), fit mappings

6. **generateCategoryTypographyStyles tests** (4 tests)
7. **generateItemTypographyStyles tests** (4 tests)
8. **generatePriceStyles tests** (5 tests)
9. **Edge cases** (11 tests)
   - Empty objects, zero values, null/undefined handling, alignment options, partial objects
