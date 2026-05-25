# Menu Editor: Undo/Redo + Auto-save

## Status: COMPLETED

## Problem Statement
The Menu Editor currently has no undo/redo support and no auto-save capability. Users can lose work when making accidental changes. These two features are tightly coupled since auto-save reads from the same state managed by undo/redo.

## Implementation Plan

### Feature 1: Undo/Redo (Ctrl+Z/Y)
- Replace 3 `useState` hooks in FullMenuEditor with `useUndoRedo` hook
- State snapshot approach using `useReducer` with 50-snapshot cap
- Web-only keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Meta+Z)
- UndoRedoBar component with two buttons

**Files Created (by previous agent):**
1. `src/components/OnlineMenus/hooks/undoRedoConstants.ts`
2. `src/components/OnlineMenus/hooks/useUndoRedo.ts`
3. `src/components/OnlineMenus/hooks/useUndoRedo.test.ts`
4. `src/hooks/useEditorKeyboardShortcuts.ts`
5. `src/hooks/useEditorKeyboardShortcuts.test.ts`
6. `src/components/OnlineMenus/components/UndoRedoBar.tsx`

**Files Modified (by previous agent):**
7. `src/shared/testIds/menuEditorTestIds.ts` - Undo/redo test IDs
8. `src/localization/locales/en.json` - Undo/redo translation keys
9. `src/features/onlinemenus/components/FullMenuEditor.tsx` - Integration

### Feature 2: Auto-save with Indicator
- Debounced auto-save using change count comparison
- Visual indicator showing save status
- Only active in edit mode (externalId defined)

**Files Created (by previous agent):**
1. `src/shared/enums/SaveStatus.ts`
2. `src/features/onlinemenus/hooks/useAutoSave.ts` (note: in features/, not components/)
3. `src/features/onlinemenus/hooks/useAutoSave.test.ts`
4. `src/components/OnlineMenus/components/AutoSaveIndicator.tsx`
5. `src/components/OnlineMenus/components/AutoSaveIndicator.test.tsx`

**Files Modified (by previous agent):**
6. `src/utils/debounce.ts` - `useDebouncedCallback` already exported
7. `src/features/onlinemenus/components/FullMenuEditor.tsx` - Wired auto-save
8. `src/shared/testIds/menuEditorTestIds.ts` - Auto-save test IDs
9. `src/localization/locales/en.json` - Auto-save translation keys

## Completion Changes (this session)

### Bug Fix: Missing import in useAutoSave.ts
- Added `import { isValueDefined } from '@/utils/is'` -- was referenced but never imported
- Removed unnecessary eslint-disable comments that masked the real issue

### Enhancement: Save button disabled during auto-save
- Added `SaveStatus` import to FullMenuEditor.tsx
- Save button now disabled when `saveStatus === SaveStatus.Saving`

### Extraction: EditorTabs to its own file
- Created `src/features/onlinemenus/components/EditorTabs.tsx`
- Extracted from FullMenuEditor.tsx to keep file under 200-line limit

### Lint fixes (pre-existing, fixed per "fix ALL issues" policy)
- `src/components/OnlineMenus/MenuContentEditor.tsx`: Fixed `no-param-reassign` on MutableRefObject.current
- `src/components/OnlineMenus/hooks/useBreadcrumbState.test.ts`: Added return type
- `src/components/Shared/BreadcrumbBar.tsx`: Changed invalid `accessibilityRole="summary"` to `"toolbar"`
- `src/features/onlinemenus/hooks/useFullMenuEditorState.ts`: Extracted `useFieldHandlers` to reduce function size

### Auto-extracted by linter
- `src/features/onlinemenus/components/utils/deriveEditorColors.ts` -- extracted by lint-fix
- `src/features/onlinemenus/types.ts` -- `EditorColors` interface added by lint-fix

## Success Criteria
- [x] Ctrl+Z undoes last change, Ctrl+Y/Ctrl+Shift+Z redoes
- [x] 50-snapshot cap enforced
- [x] Undo/Redo buttons visually show enabled/disabled state
- [x] Auto-save triggers 1.5s after last change (edit mode only)
- [x] Save status indicator shows idle/saving/saved/error
- [x] All text via FM(), all interactive elements have testID + a11y
- [x] All unit tests pass
- [x] Lint clean, build succeeds

## Quality Gate Results
- frontend-lint-fix: OK
- frontend-yagni: OK
- frontend-unit-tests: OK
- frontend-prod-build: OK
