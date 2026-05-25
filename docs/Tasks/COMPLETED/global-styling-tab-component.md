# Create Global Styling Tab Component

> **Reference**: Menu Customization Feature Task 2.8

## Status: IN_PROGRESS

## Problem Statement
Create a GlobalStylingTab component that serves as the main entry point for global menu styling in the editor. This component should combine all existing styling editors (LayoutTemplateSelector, ColorSchemeEditor, TypographyEditor, MediaPositionEditor) into a unified tabbed interface with collapsible sections.

## Root Cause Analysis
N/A - This is a new feature implementation.

## Implementation Plan
1. Create GlobalStylingTab.tsx with tabbed interface
2. Use React Native Paper's SegmentedButtons for tab-like navigation
3. Create collapsible sections for each editor:
   - Layout Template (LayoutTemplateSelector)
   - Color Scheme (ColorSchemeEditor)
   - Typography (TypographyEditor)
   - Media Settings (MediaPositionEditor)
   - Spacing Settings (new simple section)
4. Implement onChange propagation from sub-editors
5. Create unit tests focusing on logic, not rendering
6. Add testIds to shared/testIds.ts

## Files to Modify
- `src/components/OnlineMenus/Styling/GlobalStylingTab.tsx` (create)
- `src/components/OnlineMenus/Styling/__tests__/GlobalStylingTab.test.tsx` (create)
- `src/shared/testIds.ts` (add new test IDs)

## Success Criteria
- [ ] Component renders tabbed interface with 5 sections
- [ ] Each section is collapsible/expandable
- [ ] onChange propagates correctly from sub-editors
- [ ] Tab switching works correctly
- [ ] File is under 200 lines
- [ ] npm run lint passes
- [ ] npm run test passes for GlobalStylingTab

## Changes Made
(To be updated after implementation)

## Test Results
(To be updated after tests pass)
