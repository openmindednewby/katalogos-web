# Create Header Editor Component

> **Reference**: Menu Customization Feature Task 2.7

## Status: COMPLETED

## Problem Statement
Create a HeaderEditor component for editing HeaderSettings as part of the Menu Customization Feature. This component allows users to configure the menu header appearance including logo display, positioning, colors, and layout options.

## Implementation Plan
1. Create HeaderEditor component in `src/components/OnlineMenus/Styling/HeaderEditor.tsx`
2. Create styles file `headerEditorStyles.ts`
3. Create constants file `headerEditorConstants.ts`
4. Add testIDs to `src/shared/testIds.ts`
5. Create unit tests in `__tests__/HeaderEditor.test.tsx`
6. Run verification suite

## Files Created/Modified
- `src/components/OnlineMenus/Styling/HeaderEditor.tsx` (new - main component)
- `src/components/OnlineMenus/Styling/HeaderEditorPreview.tsx` (new - preview sub-component)
- `src/components/OnlineMenus/Styling/HeaderPositionSelector.tsx` (new - position selector sub-component)
- `src/components/OnlineMenus/Styling/HeaderLogoSizeSelector.tsx` (new - logo size selector sub-component)
- `src/components/OnlineMenus/Styling/headerEditorStyles.ts` (new - styles)
- `src/components/OnlineMenus/Styling/headerEditorConstants.ts` (new - constants)
- `src/components/OnlineMenus/Styling/__tests__/HeaderEditor.test.tsx` (new - unit tests)
- `src/shared/testIds.ts` (modified - added Header Editor testIDs)

## Component Architecture

The HeaderEditor was split into multiple files to stay under the 200 line limit:

### Main Component (HeaderEditor.tsx)
- Main container with controls
- Delegates rendering to sub-components
- Handles all onChange callbacks

### Sub-Components
- **HeaderEditorPreview.tsx**: Shows live preview of header layout
- **HeaderPositionSelector.tsx**: Reusable selector for horizontal positions (left/center/right)
- **HeaderLogoSizeSelector.tsx**: Selector for logo sizes (small/medium/large)

### Controls Implemented
1. Show Logo toggle (Switch)
2. Logo Position selector (left/center/right buttons) - shown only when showLogo is true
3. Logo Size selector (small/medium/large buttons) - shown only when showLogo is true
4. Banner Height slider (100-400px)
5. Show Menu Name toggle
6. Show Menu Description toggle
7. Title Position selector (left/center/right buttons)
8. Live preview showing header layout with logo, title, and description

## Props Interface
```typescript
interface Props {
  value: HeaderSettings;
  onChange: (value: HeaderSettings) => void;
  disabled?: boolean;
}
```

## Success Criteria
- [x] Component renders all controls correctly
- [x] All property changes call onChange with updated value
- [x] Toggle behaviors work correctly
- [x] Position selectors highlight active option
- [x] Preview updates with settings changes
- [x] Unit tests pass with 100% line coverage
- [x] Lint passes with no errors
- [x] Files stay under 200 lines
- [x] Build succeeds

## Test Results

### Unit Tests
```
Test Suites: 1 passed, 1 total
Tests:       49 passed, 49 total
```

### Coverage
```
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
HeaderEditor.tsx            |    97.5 |    81.48 |   88.88 |     100 |
HeaderEditorPreview.tsx     |   77.77 |    71.42 |     100 |     100 |
HeaderLogoSizeSelector.tsx  |     100 |      100 |     100 |     100 |
HeaderPositionSelector.tsx  |     100 |      100 |     100 |     100 |
```

### Lint
- No errors in HeaderEditor component files

### Build
- Successfully exported to dist folder
