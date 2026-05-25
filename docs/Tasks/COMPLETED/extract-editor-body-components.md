# Extract Editor Body Components

## Problem
CategoryEditor.tsx (204 lines) and MenuItemEditor.tsx (207 lines) both exceed the 200-line component limit.

## Plan
1. Extract CategoryEditor expanded-state body (lines 122-199) into `components/CategoryEditorBody.tsx`
2. Extract MenuItemEditor detail body (lines 111-202) into `components/MenuItemEditorBody.tsx`
3. Run lint-fix and unit tests via Tilt

## Files to Modify
- `src/components/OnlineMenus/CategoryEditor.tsx` (shrink below 200)
- `src/components/OnlineMenus/MenuItemEditor.tsx` (shrink below 200)

## Files to Create
- `src/components/OnlineMenus/components/CategoryEditorBody.tsx`
- `src/components/OnlineMenus/components/MenuItemEditorBody.tsx`

## Success Criteria
- Both parent files under 200 lines
- Both new files under 200 lines
- No behavior changes
- All lint and unit tests pass
