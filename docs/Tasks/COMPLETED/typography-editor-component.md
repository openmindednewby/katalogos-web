# Create Typography Editor Component

> **Reference**: Menu Customization Feature - Task 2.3

## Status: COMPLETED

## Problem Statement
Create a TypographyEditor component that allows users to edit GlobalTypography settings for menu customization. This component is part of the Menu Customization Feature (Phase 2) and needs to provide an intuitive interface for configuring font settings for titles, subtitles, and body text.

## Root Cause Analysis
N/A - New feature implementation

## Implementation Plan

1. Create constants file for typography options (`typographyConstants.ts`)
   - Define font family options (System, Serif, Sans-serif, Monospace)
   - Define font weight options mapping to FontWeight type
   - Define min/max font size constraints

2. Create styles file (`typographyEditorStyles.ts`)
   - Follow pattern from colorSchemeEditorStyles.ts

3. Create main component (`TypographyEditor.tsx`)
   - Props: { value: GlobalTypography; onChange: (value: GlobalTypography) => void; }
   - Support optional `onReset` and `disabled` props for consistency
   - Include sections for:
     - Title typography (font, size, weight)
     - Body typography (font, size, weight)
     - Price typography (font, size, weight)
   - Include font preview section

4. Add test IDs to shared/testIds.ts

5. Create unit tests (`__tests__/TypographyEditor.test.tsx`)
   - Test onChange callbacks for all font properties
   - Test preview updates correctly
   - Test default values applied
   - Test disabled state
   - Test reset functionality

## Files to Create/Modify

### New Files
- `src/components/OnlineMenus/Styling/typographyConstants.ts`
- `src/components/OnlineMenus/Styling/typographyEditorStyles.ts`
- `src/components/OnlineMenus/Styling/TypographyEditor.tsx`
- `src/components/OnlineMenus/Styling/__tests__/TypographyEditor.test.tsx`

### Modified Files
- `src/shared/testIds.ts` - Add typography editor test IDs
- `jest.setup.js` - Add react-native-paper mock for tests

## Success Criteria
- [x] Component renders all font property inputs (title, body, price)
- [x] Font family dropdown with System, Serif, Sans-serif, Monospace options
- [x] Font size number input with 16-48 range for titles, appropriate ranges for body/price
- [x] Font weight dropdown with normal, medium (500), semibold (600), bold options
- [x] Font preview showing how text will look
- [x] onChange callback triggered for all property changes
- [x] onReset functionality works correctly
- [x] disabled state prevents all interactions
- [x] Unit tests pass with 80%+ coverage
- [x] npm run lint:fix passes (no errors, only warnings about file length)
- [x] Build succeeds

## Changes Made

### Created Files

1. **typographyConstants.ts** - Constants and helper functions
   - `FONT_FAMILY_OPTIONS` - Array of font family options (System, Serif, Sans-serif, Monospace)
   - `FONT_WEIGHT_OPTIONS` - Array of font weight options (normal, 500, 600, bold)
   - `FONT_SIZE_LIMITS` - Size constraints per section (title: 16-48, body: 12-24, price: 12-32)
   - `TYPOGRAPHY_SECTIONS` - Configuration for title, body, price sections
   - `getCssFontFamily()` - Maps font family name to CSS value for preview
   - `getNumericFontWeight()` - Maps FontWeight to numeric string for styling

2. **typographyEditorStyles.ts** - StyleSheet for component
   - Container, section, input, and preview styles
   - Picker and dropdown styles
   - Disabled state styles

3. **TypographyEditor.tsx** - Main component (~320 lines)
   - Three sections: Title, Body, Price typography
   - Each section has: Font picker, Size input, Weight picker
   - Live preview showing all three text styles
   - Reset button (optional via onReset prop)
   - Proper accessibility labels and hints

4. **TypographyEditor.test.tsx** - Unit tests (30 tests)
   - Tests for all typography sections
   - Font/size/weight change callbacks
   - Edge cases (empty values, clamping)
   - Disabled state behavior
   - Reset button functionality

### Modified Files

1. **testIds.ts** - Added test IDs:
   - `TYPOGRAPHY_EDITOR`
   - `TYPOGRAPHY_SECTION`
   - `TYPOGRAPHY_FONT_PICKER`
   - `TYPOGRAPHY_SIZE_INPUT`
   - `TYPOGRAPHY_WEIGHT_PICKER`
   - `TYPOGRAPHY_PREVIEW`
   - `TYPOGRAPHY_RESET_BUTTON`

2. **jest.setup.js** - Added react-native-paper mock
   - MockMenu, MockSegmentedButtons, MockSwitch components
   - Required for testing components that use react-native-paper

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       30 passed, 30 total

Coverage:
- TypographyEditor.tsx: 94% statements, 86% branches, 86% functions, 97% lines
- typographyConstants.ts: 100% across all metrics
```

## Build Status
- `npm run lint:fix` - Passes (0 errors, warnings only for file length)
- `npx expo export --platform web` - Builds successfully
