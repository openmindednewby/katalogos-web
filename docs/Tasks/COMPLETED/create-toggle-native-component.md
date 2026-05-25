# Create ToggleNative Component

> **Reference**: SyncfusionThemeStudio/src/components/ui/ (AlertNative, ButtonNative patterns)

## Status: COMPLETED

## Problem Statement
The DimensionsEditor.tsx has an inline toggle button that:
1. Looks too circular/ugly - improperly sized (h-5 w-9 track, h-4 w-4 thumb)
2. Does not work properly (user reports it does nothing)

Need to create a shared, reusable ToggleNative component and replace the inline toggle.

## Root Cause Analysis
The inline toggle has sizing issues (too small track and thumb) and potentially the onClick handler
`onClick={() => onFullWidthChange(!layout.contentFullWidth)}` may not be properly propagating
the state change. A dedicated component with proper sizing and accessibility will fix both issues.

## Implementation Plan
1. Add TOGGLE_NATIVE to shared testIds (src/shared/testIds.ts + e2e/shared/testIds.ts)
2. Add toggle CSS styles to src/styles/layers/components.css
3. Create ToggleNative component at src/components/ui/ToggleNative/index.tsx
4. Write unit tests at src/components/ui/ToggleNative/ToggleNative.test.tsx
5. Replace inline toggle in DimensionsEditor.tsx with ToggleNative
6. Run verification suite (lint, tests, build)

## Files Modified
- `src/shared/testIds.ts` - Added `TOGGLE_NATIVE: 'toggle-native'` under new Toggle section
- `e2e/shared/testIds.ts` - Added `TOGGLE_NATIVE: 'toggle-native'` (synced)
- `src/styles/layers/components.css` - Added TOGGLE SWITCH section with CSS variables
- `src/components/ui/ToggleNative/index.tsx` - New component (75 lines)
- `src/components/ui/ToggleNative/ToggleNative.test.tsx` - 10 unit tests
- `src/components/layout/ThemeSettingsDrawer/sections/LayoutSection/DimensionsEditor.tsx` - Replaced inline toggle with ToggleNative

## Success Criteria
- [x] ToggleNative component renders a properly-sized pill-shaped toggle switch (h-6 w-11 track, h-5 w-5 thumb)
- [x] Toggle calls onChange with the toggled boolean value on click
- [x] Disabled state prevents onChange from firing
- [x] Proper accessibility: role="switch", aria-checked, aria-label
- [x] CSS variables support theming (--component-toggle-active-bg, --component-toggle-inactive-bg, --component-toggle-thumb-bg)
- [x] DimensionsEditor uses ToggleNative instead of inline button
- [x] All tests pass (474/474)
- [x] Lint passes (0 errors, 9 pre-existing warnings)
- [x] Build succeeds

## Changes Made

### 1. ToggleNative Component (`src/components/ui/ToggleNative/index.tsx`)
- Props: `checked`, `onChange`, `label`, `disabled`, `testId`, `className`
- Uses `memo` for performance, `useCallback` for click handler
- Pill-shaped track (`h-6 w-11 rounded-full`) with circular thumb (`h-5 w-5 rounded-full`)
- Active color: `bg-primary-500`, Inactive: `bg-neutral-300 dark:bg-neutral-600`
- Smooth sliding transition via Tailwind `translate-x-5` / `translate-x-0.5`
- Full accessibility: `role="switch"`, `aria-checked`, `aria-label`, `disabled`
- Uses `cn()` for classnames, `isValueDefined()` for null checks

### 2. CSS Variables (`src/styles/layers/components.css`)
- Added `/* ===== TOGGLE SWITCH ===== */` section before toast notifications
- CSS classes: `.toggle-track`, `.toggle-thumb`
- Theme variables: `--component-toggle-active-bg`, `--component-toggle-inactive-bg`, `--component-toggle-thumb-bg`
- Focus-visible ring for keyboard accessibility

### 3. DimensionsEditor Update
- Replaced 16-line inline button with single `<ToggleNative>` component call
- Added import for ToggleNative
- Passes `onFullWidthChange` directly (no inline arrow function wrapper)

### 4. Unit Tests (10 tests)
- onChange: calls with true from unchecked, false from checked, exactly once per click
- Disabled: does not call onChange, has disabled attribute
- Accessibility: role="switch", aria-checked true/false, aria-label set/unset

### 5. TestIds
- Added `TOGGLE_NATIVE: 'toggle-native'` to both `src/shared/testIds.ts` and `e2e/shared/testIds.ts`

## Test Results
- Lint: 0 errors, 9 pre-existing warnings
- Unit tests: 474/474 pass (25 test files), including 10 new ToggleNative tests
- Build: Success (tsc + vite build + PWA)
