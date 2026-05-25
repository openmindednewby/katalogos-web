# Refactor MediaPositionEditor to be under 200 lines

> **Reference**: CLAUDE.md - File and Function Size Limits

## Status: COMPLETED

## Problem Statement
The `MediaPositionEditor.tsx` component was 233 lines (target: <200 lines).
This exceeded the React component limit of 200 lines per the ESLint rules.

## Root Cause Analysis
The file contained:
1. Interface definitions (PositionOption, SizeOption, FitOption) - 15 lines
2. Constants (POSITION_OPTIONS, SIZE_OPTIONS, FIT_OPTIONS, color constants) - 33 lines
3. A generic `renderOptionButton` helper function - 39 lines
4. The main component - remaining lines

## Implementation Plan
1. Create `mediaPositionConstants.ts` with:
   - Interface definitions (PositionOption, SizeOption, FitOption)
   - All option arrays (POSITION_OPTIONS, SIZE_OPTIONS, FIT_OPTIONS)
   - Numeric constants (MIN/MAX_BORDER_RADIUS, etc.)
   - Color constants

2. Create `MediaOptionButton.tsx` sub-component to replace `renderOptionButton`

3. Create `MediaBorderRadiusSlider.tsx` sub-component for border radius slider

4. Create `MediaShowToggle.tsx` sub-component for the show/hide toggle

5. Update `MediaPositionEditor.tsx` to:
   - Import from the new constants file
   - Use the new sub-components
   - Re-export constants for backward compatibility with tests

## Files Modified
- `BaseClient/src/components/OnlineMenus/Styling/mediaPositionConstants.ts` (NEW - 56 lines)
- `BaseClient/src/components/OnlineMenus/Styling/MediaOptionButton.tsx` (NEW - 69 lines)
- `BaseClient/src/components/OnlineMenus/Styling/MediaBorderRadiusSlider.tsx` (NEW - 55 lines)
- `BaseClient/src/components/OnlineMenus/Styling/MediaShowToggle.tsx` (NEW - 37 lines)
- `BaseClient/src/components/OnlineMenus/Styling/MediaPositionEditor.tsx` (MODIFIED - 184 lines, down from 233)

## Success Criteria
- [x] MediaPositionEditor.tsx is under 200 lines (184 lines)
- [x] All existing tests pass (60/60 tests pass)
- [x] `npm run lint` passes for all modified files
- [x] Re-exports maintain backward compatibility with test imports

## Changes Made
1. **Extracted constants** to `mediaPositionConstants.ts`:
   - Moved `PositionOption`, `SizeOption`, `FitOption` interfaces
   - Moved `POSITION_OPTIONS`, `SIZE_OPTIONS`, `FIT_OPTIONS` arrays
   - Moved numeric constants (MIN/MAX_BORDER_RADIUS, etc.)
   - Moved color constants

2. **Extracted MediaOptionButton** component:
   - Generic arrow function component for rendering option buttons
   - Handles styling, accessibility, and press events

3. **Extracted MediaBorderRadiusSlider** component:
   - Encapsulates the border radius slider section
   - Receives value, onChange, and styling props

4. **Extracted MediaShowToggle** component:
   - Encapsulates the show/hide image toggle
   - Receives visibility state and change handler

5. **Updated MediaPositionEditor**:
   - Imports from new constants file
   - Uses extracted sub-components
   - Re-exports constants for backward compatibility

## Test Results
```
Test Suites: 1 passed, 1 total
Tests:       60 passed, 60 total
```

All 60 existing tests pass without modification, confirming backward compatibility.
