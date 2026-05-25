# TableNative Core Features Implementation

> **Reference**: Feature parity with Syncfusion DataGrid for selection, grouping, aggregates, and editing

## Status: COMPLETED

## Problem Statement
The TableNative component currently supports only columns, sorting, filtering, pagination, striped rows, hover, compact mode, and custom formatters. It needs four major feature additions to achieve parity with Syncfusion DataGrid: Selection, Grouping, Aggregates, and Editing systems.

## Implementation Plan

### Phase 1: Hooks (Pure Logic)
1. `useTableSelection.ts` - Single/multi row selection, checkbox, cell selection
2. `useTableGrouping.ts` - Group by columns, collapse/expand, nested groups
3. `useTableAggregates.ts` - Sum/Average/Count/Min/Max/TrueCount/FalseCount/Custom
4. `useTableEditing.ts` - Inline/Dialog/Batch edit modes

### Phase 2: UI Components
5. `GroupRow.tsx` - Collapsible group header row
6. `GroupDropArea.tsx` - Drag-to-group drop zone
7. `AggregateRow.tsx` - Footer row with computed values
8. `EditCell.tsx` - Inline cell editor
9. `EditDialog.tsx` - Modal form editor
10. `CommandCell.tsx` - Edit/Delete/Save/Cancel buttons

### Phase 3: Main Component Refactor
11. Split `index.tsx` into sub-components: `TableHeader.tsx`, `TableBody.tsx`, `TableFooter.tsx`
12. Update `index.tsx` with new props, hook orchestration, and data pipeline

### Phase 4: Unit Tests
13. `useTableSelection.test.ts` - 20 tests
14. `useTableGrouping.test.ts` - 15 tests
15. `useTableAggregates.test.ts` - 24 tests
16. `useTableEditing.test.ts` - 21 tests

### Phase 5: Localization
17. Add translation keys to `en.json`

## Files Created

### Hook files (split to comply with 30-line function limit):

**Selection system:**
- `hooks/selectionUtils.ts` - Types and utility functions (defaultRowKey, buildCellKey, getSelectedRows)
- `hooks/useSelectionState.ts` - State management (selectedRowIds, selectedCells, computed flags)
- `hooks/useSelectModes.ts` - useSingleSelect and useMultiToggle hooks
- `hooks/useRowClickHandler.ts` - Row click with range select support
- `hooks/useSelectionHandlers.ts` - Cell click, select-all, clear handlers
- `hooks/useTableSelection.ts` - Main selection hook (orchestrator)

**Grouping system:**
- `hooks/groupingUtils.ts` - Types and utility functions (groupDataByColumns, collectGroupKeys)
- `hooks/useGroupColumnActions.ts` - Add/remove/reorder group columns
- `hooks/useCollapseActions.ts` - Toggle/collapse-all/expand-all with grouped data computation
- `hooks/useTableGrouping.ts` - Main grouping hook (orchestrator)

**Aggregates system:**
- `hooks/useTableAggregates.ts` - Complete aggregate computation (all types)

**Editing system:**
- `hooks/editingUtils.ts` - Types and utility functions (buildCellKey, findRowByKey, etc.)
- `hooks/useEditingState.ts` - All editing state variables
- `hooks/useEditingQueries.ts` - Read-only query helpers (getCellValue, isCellDirty, isRowDeleted)
- `hooks/useStartEditCallbacks.ts` - startEdit and startCellEdit callbacks
- `hooks/useInlineEditActions.ts` - Inline editing actions (update, save, cancel, delete)
- `hooks/useBatchActions.ts` - Batch save/cancel with dirty cell/row tracking
- `hooks/useEditActions.ts` - Main edit actions hook (orchestrator)
- `hooks/useTableEditing.ts` - Main editing hook (orchestrator)

### UI Components:
- `GroupRow.tsx` - Collapsible group header row with indent, toggle, count
- `GroupDropArea.tsx` - Drag-and-drop target zone with group chips
- `AggregateRow.tsx` - Footer row with computed values aligned to columns
- `EditCell.tsx` - Inline cell editor with auto-focus and keyboard handlers
- `EditDialog.tsx` - Modal form editor with auto-generated fields
- `CommandCell.tsx` - Edit/Delete/Save/Cancel action buttons
- `DataRow.tsx` - Single table row with selection, editing, dirty highlighting

### Sub-components:
- `TableHeader.tsx` - thead with sortable columns, optional checkbox, filter row
- `TableBody.tsx` - tbody with flat or grouped row rendering
- `TableFooter.tsx` - tfoot with aggregate rows

### Test files:
- `hooks/useTableSelection.test.ts` - 20 tests
- `hooks/useTableGrouping.test.ts` - 15 tests
- `hooks/useTableAggregates.test.ts` - 24 tests
- `hooks/useTableEditing.test.ts` - 21 tests

## Files Modified
- `index.tsx` - Complete rewrite integrating all 4 hooks and sub-components
- `localization/locales/en.json` - Added table.* translation keys

## Success Criteria
- [x] Selection hook handles single/multi/checkbox/cell selection
- [x] Grouping hook groups data by one or more columns with collapse/expand
- [x] Aggregates hook computes Sum/Average/Count/Min/Max/TrueCount/FalseCount/Custom
- [x] Editing hook supports Normal/Dialog/Batch modes with dirty tracking
- [x] All UI sub-components created
- [x] Main component refactored under 200 lines with sub-components
- [x] All new props are optional (backwards compatible)
- [x] Unit tests cover logic paths for all 4 hooks (80 tests total)
- [x] TypeScript compiles without errors
- [x] ESLint passes (0 errors in hooks directory)

## Test Results
- **All 80 hook tests pass** (24 aggregates + 20 selection + 15 grouping + 21 editing)
- **All 617 project tests pass** (31 test files, 0 failures)
- **TypeScript**: Clean compilation with `npx tsc --noEmit`
- **ESLint**: 0 errors on all `.ts` files in hooks directory
- **Note**: Pre-existing ESLint crash (`context.getSource is not a function`) affects `.tsx` files due to `eslint-plugin-react-hooks` incompatibility with ESLint 9.39 -- not caused by these changes
