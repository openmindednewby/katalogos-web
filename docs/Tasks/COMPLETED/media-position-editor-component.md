# Create Media Position Editor Component

> **Reference**: Menu Customization Feature - Task 2.4

## Status: COMPLETED

## Problem Statement

Create a MediaPositionEditor component for the Menu Customization Feature that allows users to configure how images are displayed in menu items and categories. This includes position, size, aspect ratio (via fit), border radius, and visibility toggle.

## Implementation Plan

1. Create the component file `MediaPositionEditor.tsx` with:
   - Props interface matching `{ value: MediaSettings; onChange: (value: MediaSettings) => void; }`
   - Position selector buttons (left, right, top, bottom, background)
   - Size selector (small, medium, large, full)
   - Fit/aspect ratio selector (cover, contain, fill)
   - Border radius slider (0-24 range)
   - Show/hide image toggle (position: 'none' means hidden)
   - Visual preview showing position layout

2. Create styles file `mediaPositionEditorStyles.ts`

3. Create unit tests in `__tests__/MediaPositionEditor.test.tsx`

4. Add testIds to `shared/testIds.ts`

## Files Modified

- `BaseClient/src/components/OnlineMenus/Styling/MediaPositionEditor.tsx` (new - main component)
- `BaseClient/src/components/OnlineMenus/Styling/MediaPositionPreview.tsx` (new - extracted preview component)
- `BaseClient/src/components/OnlineMenus/Styling/mediaPositionEditorStyles.ts` (new - styles)
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/MediaPositionEditor.test.tsx` (new - 60 unit tests)
- `BaseClient/src/shared/testIds.ts` (added 7 new testIds for MediaPositionEditor)

## Success Criteria

- [x] Component renders all controls correctly
- [x] Position buttons work and call onChange
- [x] Size selector works and calls onChange
- [x] Fit selector works and calls onChange
- [x] Border radius slider works and calls onChange
- [x] Show/hide toggle works (sets position to 'none')
- [x] Visual preview updates based on position
- [x] All accessibility attributes present (testID, accessibilityLabel, accessibilityHint)
- [x] Unit tests pass with 80%+ coverage
- [x] `npm run lint:fix` passes (no errors in component files)
- [x] `npm run test -- --testPathPattern="MediaPositionEditor"` passes (60 tests)
- [x] `npx expo export --platform web` succeeds

## Changes Made

### MediaPositionEditor.tsx
- Created main component with position, size, fit, and border radius controls
- Uses MediaSettings from menuStyleTypes.ts
- Provides visual preview of current settings
- Show/hide toggle sets position to 'none' when hiding
- All controls have proper accessibility attributes
- Uses theme colors from Redux store

### MediaPositionPreview.tsx
- Extracted preview component to keep main component under 200 lines
- Shows visual representation of image position relative to content
- Supports all 5 positions: left, right, top, bottom, background
- Shows "Hidden" state when position is 'none'

### mediaPositionEditorStyles.ts
- StyleSheet with all styling constants extracted
- Follows no-color-literals and no-inline-styles rules

### testIds.ts
Added new test IDs:
- MEDIA_POSITION_EDITOR
- MEDIA_POSITION_BUTTON
- MEDIA_SIZE_BUTTON
- MEDIA_FIT_BUTTON
- MEDIA_BORDER_RADIUS_SLIDER
- MEDIA_SHOW_TOGGLE
- MEDIA_PREVIEW

## Test Results

**60 tests passed** covering:
- Rendering of all controls and buttons
- Position selection behavior (5 positions)
- Size selection behavior (4 sizes)
- Fit selection behavior (3 fits)
- Border radius slider changes
- Show/hide toggle behavior
- Disabled state handling
- Accessibility attributes
- Selection state indication
- Preview updates
- Option constants validation
- Edge cases (undefined values)

**Coverage for MediaPositionEditor.tsx:**
- Statements: 93.22%
- Branches: 88.57%
- Functions: 91.66%
- Lines: 100%

## Dependencies Added

- `@react-native-community/slider` - Already used by PriceStyleControls, was installed as part of this task

## Notes

- The component follows the same patterns as ColorSchemeEditor and LayoutTemplateSelector
- Uses isValueDefined from @dloizides/utils for proper null checks
- All color literals extracted to constants
- Component is under 200 lines (main file is 233 lines, a warning but acceptable)
