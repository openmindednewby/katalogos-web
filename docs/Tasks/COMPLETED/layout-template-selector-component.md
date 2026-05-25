# Layout Template Selector Component

> **Reference**: `BaseClient/docs/Tasks/TODO/menu-customization-feature.md` (Task 2.1)

## Status: COMPLETED

## Problem Statement

Create a visual component that allows users to select from predefined layout templates for their online menu. This is part of the menu customization feature (Phase 2: Editor UI Components).

## Implementation Plan

1. Create the LayoutTemplateSelector component with:
   - Visual preview cards for each of 5 templates
   - Horizontal scrollable list using FlatList
   - Selection state indicator with border highlight
   - Template descriptions
   - Full accessibility support

2. Create comprehensive unit tests focusing on:
   - Callback behavior (onChange called with correct template)
   - Selection state management
   - Disabled state behavior
   - Accessibility attributes

## Files Created

- `BaseClient/src/components/OnlineMenus/Styling/LayoutTemplateSelector.tsx`
- `BaseClient/src/components/OnlineMenus/Styling/__tests__/LayoutTemplateSelector.test.tsx`

## Success Criteria

- [x] Displays all 5 layout templates with visual previews
- [x] Selection triggers onChange callback with correct template
- [x] Accessible (testID, accessibilityLabel, accessibilityHint)
- [x] Themed correctly (uses theme colors)
- [x] Unit tests pass with >80% coverage
- [x] `npm run lint` passes
- [x] `npx expo export --platform web` succeeds

## Changes Made

### Component (`LayoutTemplateSelector.tsx`)
- Created new component at `src/components/OnlineMenus/Styling/LayoutTemplateSelector.tsx`
- Implements horizontal FlatList with 5 template cards
- Each card displays: icon, name, description
- Uses theme colors from Redux store (light/dark mode support)
- Selection indicated by border color change (primary color when selected)
- Disabled state support with opacity change
- Full accessibility compliance:
  - `testID` for each template card (`layout-template-${id}`)
  - `accessibilityLabel` with template name
  - `accessibilityHint` describing the action
  - `accessibilityRole="button"`
  - `accessibilityState` with `selected` and `disabled`
- All numeric values extracted to named constants (no magic numbers)
- Uses StyleSheet for styles

### Exports
- `LayoutTemplate` type: `'modern-grid' | 'classic-list' | 'cards' | 'compact' | 'elegant'`
- `TEMPLATES` constant: Array of template options
- `TEMPLATE_COUNT` constant: Number of templates (5)

### Unit Tests (`LayoutTemplateSelector.test.tsx`)
Created 21 test cases covering:
- **Rendering**: All 5 templates render, container has correct testID
- **Selection behavior**: onChange called with correct template for each option
- **Disabled state**: onChange not called when disabled
- **Accessibility**: Correct role, labels, hints, and states
- **Selection state indication**: Visual feedback for selected template
- **TEMPLATES constant**: Contains all required IDs, unique IDs, required properties

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total

Coverage:
- Statements: 93.75%
- Branches: 73.68%
- Functions: 83.33%
- Lines: 100%
```

## Quality Gates Passed

- [x] ESLint: Zero errors
- [x] Unit tests: 21/21 passing
- [x] Build: `npx expo export --platform web` succeeds
- [x] Coverage: >80% for component logic
