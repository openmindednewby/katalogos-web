# Grid Component Suite - Full Feature Implementation

> **Project**: SyncfusionThemeStudio
> **Priority**: HIGH
> **Estimated Agents**: 4-6 parallel streams
> **Status**: COMPLETED (2026-02-11)

## Problem Statement

The grid/table component is critical infrastructure for the application. Both the Syncfusion DataGrid wrapper and the native TableNative need to be elevated to full-featured, production-grade grid components that:

1. Expose ALL Syncfusion Grid capabilities through the wrapper
2. Mirror every Syncfusion feature with a zero-dependency native implementation
3. Share a common interface (`GridConfig`) so consumers can swap implementations
4. Be fully CSS-customizable via the theme editor (~30 CSS variables)
5. Have dedicated showcase pages demonstrating every feature
6. Be covered by unit tests and E2E tests

## Current State

### What Exists

| Feature | Syncfusion DataGrid | Native TableNative |
|---------|--------------------|--------------------|
| Basic columns | Yes | Yes |
| Sorting (single column) | Yes | Yes |
| Filtering (type-aware) | Yes (Menu/FilterBar/Excel) | Yes (inline text/number/date/boolean) |
| Pagination | Yes | Yes |
| Row selection | Yes (single) | No |
| Loading overlay | Yes | No |
| Empty state | Yes | Yes |
| Striped rows | No (CSS only) | Yes (prop) |
| Hover effect | No (CSS only) | Yes (prop) |
| Compact mode | No | Yes (prop) |
| Custom formatter | No | Yes (column.format) |
| GridConfig shared types | Yes | Yes |
| Theme CSS variables | 10 variables | Uses Tailwind classes |

### What's Missing (Both)

- Grouping with drag & drop
- Aggregates (sum, average, count, min, max in footer)
- Column reorder / resize / freeze
- Column chooser (show/hide columns)
- Editing (inline, dialog, batch, command column)
- Nested/detail rows (child grids, expandable rows)
- Row drag & drop (reorder, cross-grid)
- Toolbar (search, add, delete, export buttons)
- Context menu (right-click actions)
- Excel / CSV / PDF export
- Virtualization (row + column for large datasets)
- Infinite scrolling
- Clipboard (copy/paste)
- Multi-row selection + checkbox selection
- Cell selection
- Stacked headers
- Column spanning
- Custom cell templates / row templates
- Action column (edit/delete/view buttons)

### Files Involved

```
src/components/ui/TableNative/          # Native grid
  index.tsx                              # Main component (231 lines)
  filters/FilterRow.tsx                  # Filter row container
  filters/TextFilter.tsx                 # Text filter input
  filters/NumberFilter.tsx               # Number filter input
  filters/DateFilter.tsx                 # Date filter input
  filters/BooleanFilter.tsx              # Boolean filter select
  pagination/TablePagination.tsx         # Pagination controls
  pagination/utils.ts                    # Page number generation

src/components/ui/syncfusion/DataGrid/  # Syncfusion grid wrapper
  index.tsx                              # Main component (226 lines)

src/lib/grid/                           # Shared grid infrastructure
  types/index.ts                         # GridConfig, FilterConfig, etc.
  hooks/useNativeGridState.ts            # Native grid state manager
  hooks/useSyncfusionFilters.ts          # Syncfusion filter bridge
  hooks/useSyncfusionDefaultSort.ts      # Syncfusion sort bridge
  adapters/useTanStackQueryAdapter.ts    # Server-mode adapter
  utils/detectColumnTypes.ts             # Auto column type detection

src/stores/theme/types/componentTypes.ts # DataGridConfig interface
src/stores/theme/injectors/componentInjector.ts # CSS variable injection
src/stores/theme/defaults/defaultComponentsDark.ts
src/stores/theme/defaults/defaultComponentsLight.ts
src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/DataGridEditor.tsx

src/features/components/pages/DataGridPage/index.tsx  # Existing showcase (basic)
src/features/products/pages/ProductsListPage/         # Syncfusion usage
src/features/products/pages/NativeProductsPage/        # Native usage
```

---

## Implementation Plan

### Phase 1: Common Interface & Shared Types

**Goal**: Define the unified interface that both grid implementations will adhere to.

#### Task 1.1: Extend GridConfig Types
**File**: `src/lib/grid/types/index.ts`
**Changes**:
- Add `GroupConfig` interface (fields to group by, drag-to-group, collapse state)
- Add `AggregateConfig` interface (column, type: sum/avg/count/min/max, format, custom function)
- Add `EditConfig` interface (mode: inline/dialog/batch/command, allowAdd, allowEdit, allowDelete)
- Add `SelectionConfig` interface (type: single/multiple/checkbox, mode: row/cell)
- Add `DetailRowConfig` interface (template component, expand/collapse callbacks)
- Add `ToolbarConfig` interface (items: search/add/delete/export/print/custom)
- Add `ContextMenuConfig` interface (items: copy/edit/delete/export/custom)
- Add `ExportConfig` interface (excel, csv, pdf options)
- Add `ColumnFeatures` interface (resizable, reorderable, freezable, visible, template)
- Add `DragDropConfig` interface (allowDragRows, allowDropRows, cross-grid target)
- Add `VirtualizationConfig` interface (enabled, rowHeight, buffer)
- Add `ClipboardConfig` interface (enabled, copyHeader)
- Add `ActionColumnConfig` interface (buttons: edit/delete/view/custom, position: left/right)

**Acceptance Criteria**:
- [ ] All interfaces exported from `lib/grid/types`
- [ ] GridConfig extended with all new optional configs
- [ ] Zero breaking changes to existing GridConfig consumers
- [ ] Types compile with `tsc --noEmit`

#### Task 1.2: Define Common Column Interface
**File**: `src/lib/grid/types/columns.ts` (new)
**Changes**:
- Create `GridColumn` interface that both native and Syncfusion accept
- Fields: field, headerText, width, textAlign, visible, frozen, resizable, sortable, filterable, groupable, template, headerTemplate, editTemplate, format, aggregate, type, validationRules, allowEditing, isPrimaryKey, commands (for command column)
- Create adapter functions: `toSyncfusionColumn(GridColumn): ColumnModel` and `toNativeColumn(GridColumn): TableColumn`
- Both grids should accept `GridColumn[]` as their primary column prop

**Acceptance Criteria**:
- [ ] `GridColumn` interface covers all features needed by both implementations
- [ ] Adapter functions for Syncfusion ColumnModel
- [ ] Adapter functions for native TableColumn
- [ ] Unit tests for adapter functions

---

### Phase 2: Syncfusion DataGrid - Full Feature Enablement

**Goal**: Expose all Syncfusion EJ2 Grid features through the wrapper.

#### Task 2.1: Core Grid Features (Grouping, Aggregates, Selection)
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx`
**Changes**:
- Import and inject: `Group`, `Aggregate`, `Selection` services
- Add `allowGrouping` prop with `GroupSettingsModel`
- Add `aggregates` prop with `AggregateRowModel[]`
- Add `selectionSettings` prop (type, mode, checkboxMode)
- Add `cellSelected` / `cellDeselected` callbacks
- Read from `gridConfig.group`, `gridConfig.aggregates`, `gridConfig.selection`

**Acceptance Criteria**:
- [ ] Grouping works with drag-to-group header
- [ ] Aggregates display in group footer and grid footer
- [ ] Checkbox selection + multi-row selection works
- [ ] Cell selection mode works
- [ ] Unit tests for new feature resolution logic

#### Task 2.2: Editing Features
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx` + new editing helpers
**Changes**:
- Import and inject: `Edit`, `CommandColumn` services
- Add `editSettings` prop (allowEditing, allowAdding, allowDeleting, mode: Normal/Dialog/Batch)
- Add `onActionBegin` / `onActionComplete` callbacks for edit lifecycle
- Add command column support (Edit, Delete, Save, Cancel buttons)
- Add validation rules support via column definitions
- Read from `gridConfig.edit`

**Acceptance Criteria**:
- [ ] Inline editing: click cell to edit, save on blur/enter
- [ ] Dialog editing: edit form in modal dialog
- [ ] Batch editing: edit multiple cells, commit all
- [ ] Command column: edit/delete/save buttons per row
- [ ] Validation rules enforced on edit
- [ ] Edit lifecycle callbacks fire correctly
- [ ] Unit tests for edit configuration

#### Task 2.3: Column Features (Resize, Reorder, Freeze, Chooser)
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx`
**Changes**:
- Import and inject: `Resize`, `Reorder`, `Freeze`, `ColumnChooser` services
- Add `allowResizing`, `allowReordering` props
- Add `frozenColumns` / `frozenRows` props
- Add `showColumnChooser` prop
- Add `columnDragStart`, `columnDrop` callbacks
- Read from column-level `GridColumn` features

**Acceptance Criteria**:
- [ ] Columns resize via drag on header border
- [ ] Columns reorder via drag & drop header
- [ ] Frozen columns stay visible on horizontal scroll
- [ ] Column chooser dialog to show/hide columns
- [ ] Unit tests

#### Task 2.4: Export, Toolbar, Context Menu
**Files**: `src/components/ui/syncfusion/DataGrid/index.tsx` + toolbar/context helpers
**Changes**:
- Import and inject: `ExcelExport`, `PdfExport`, `Toolbar`, `ContextMenu` services
- Add `toolbar` prop (items array: Search, Add, Delete, ExcelExport, PdfExport, Print, custom)
- Add `contextMenuItems` prop
- Add `toolbarClick` callback
- Add `excelExport()`, `pdfExport()`, `csvExport()` methods via ref
- Read from `gridConfig.toolbar`, `gridConfig.contextMenu`, `gridConfig.export`

**Acceptance Criteria**:
- [ ] Toolbar renders with configured buttons
- [ ] Search input in toolbar filters globally
- [ ] Excel/PDF/CSV export downloads file
- [ ] Context menu appears on right-click with configured items
- [ ] Unit tests for toolbar and export configuration

#### Task 2.5: Detail Rows (Nested/Hierarchical Grids)
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx` + detail template
**Changes**:
- Import and inject: `DetailRow` service
- Add `detailTemplate` prop (React component receiving parent row data)
- Add `childGrid` prop for hierarchical grid (grid within grid)
- Add `detailDataBound` callback
- Read from `gridConfig.detailRow`

**Acceptance Criteria**:
- [ ] Expand button on each row reveals detail template
- [ ] Child grid renders inside expanded row
- [ ] Detail row can be a custom React component
- [ ] Unit tests

#### Task 2.6: Row Drag & Drop
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx`
**Changes**:
- Import and inject: `RowDD` service
- Add `allowRowDragAndDrop` prop
- Add `rowDropSettings` prop (target grid ID)
- Add `rowDragStart`, `rowDrop` callbacks
- Read from `gridConfig.dragDrop`

**Acceptance Criteria**:
- [ ] Rows can be dragged to reorder within same grid
- [ ] Rows can be dragged to a different target grid
- [ ] Callbacks fire with drag/drop data
- [ ] Unit tests

#### Task 2.7: Virtualization & Infinite Scrolling
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx`
**Changes**:
- Import and inject: `VirtualScroll`, `InfiniteScroll` services
- Add `enableVirtualization` / `enableColumnVirtualization` props
- Add `enableInfiniteScrolling` prop
- Add `infiniteScrollSettings` prop
- Read from `gridConfig.virtualization`

**Acceptance Criteria**:
- [ ] Row virtualization works with 10k+ rows (smooth scrolling)
- [ ] Column virtualization works with 50+ columns
- [ ] Infinite scrolling loads data on scroll
- [ ] Unit tests

#### Task 2.8: Clipboard, Stacked Headers, Templates
**File**: `src/components/ui/syncfusion/DataGrid/index.tsx`
**Changes**:
- Import and inject: `Clipboard` service
- Add `enableClipboard` prop, `copyHeader` option
- Add column `template` support (React component per cell)
- Add column `headerTemplate` support
- Add `stackedHeaders` prop for multi-level headers
- Read from `gridConfig.clipboard`

**Acceptance Criteria**:
- [ ] Ctrl+C copies selected cells/rows
- [ ] Custom cell templates render correctly
- [ ] Custom header templates render correctly
- [ ] Stacked (grouped) column headers display correctly
- [ ] Unit tests

---

### Phase 3: Native TableNative - Feature Parity

**Goal**: Implement all Syncfusion features using zero-dependency native HTML/CSS/JS.

#### Task 3.1: Selection & Multi-Select
**File**: `src/components/ui/TableNative/index.tsx` + new selection hook
**Changes**:
- Add `selectionConfig` prop (type: single/multiple/checkbox, mode: row/cell)
- Create `useTableSelection` hook managing selected rows/cells state
- Add checkbox column rendering when checkbox selection enabled
- Add keyboard navigation (Shift+click for range, Ctrl+click for toggle)
- Add `onRowSelected`, `onRowDeselected`, `onSelectionChange` callbacks
- CSS: selected row highlight using theme variable

**Acceptance Criteria**:
- [ ] Single row selection on click
- [ ] Multi-row selection with Ctrl+click / Shift+click
- [ ] Checkbox column for batch selection
- [ ] Select-all checkbox in header
- [ ] Cell selection mode
- [ ] Keyboard navigation support
- [ ] Unit tests for selection hook

#### Task 3.2: Grouping
**File**: `src/components/ui/TableNative/` + new grouping files
**Changes**:
- Create `useTableGrouping` hook (group by field, collapse/expand, nested groups)
- Add drag-to-group area (drop zone above table)
- Render group header rows with collapse toggle + group label
- Support multi-level grouping
- Group footer rows with aggregate values
- Read from `gridConfig.group`

**Acceptance Criteria**:
- [ ] Group by single or multiple columns
- [ ] Drag column header to group area
- [ ] Collapse/expand groups
- [ ] Group footer shows aggregates
- [ ] Unit tests for grouping logic

#### Task 3.3: Aggregates
**File**: `src/components/ui/TableNative/` + aggregate utilities
**Changes**:
- Create `computeAggregates` utility (sum, avg, count, min, max, custom function)
- Render footer row with aggregate values
- Support group-level aggregates (in group footer)
- Format aggregate values using column format
- Read from `gridConfig.aggregates`

**Acceptance Criteria**:
- [ ] Footer row displays configured aggregates
- [ ] All aggregate types work: sum, average, count, min, max
- [ ] Custom aggregate function support
- [ ] Group footer aggregates
- [ ] Unit tests for all aggregate computations

#### Task 3.4: Editing (Inline, Dialog, Batch, Command)
**File**: `src/components/ui/TableNative/` + editing components
**Changes**:
- Create `useTableEditing` hook (edit state, validation, dirty tracking)
- Inline mode: click cell → render input, save on blur/enter/tab
- Dialog mode: open modal form with all editable fields
- Batch mode: edit multiple cells, show dirty indicators, commit/cancel all
- Command column: render edit/delete/save/cancel buttons per row
- Validation rules (required, min, max, regex, custom)
- Add row / delete row support
- `onEditBegin`, `onEditComplete`, `onAddRow`, `onDeleteRow` callbacks
- Read from `gridConfig.edit`

**Acceptance Criteria**:
- [ ] Inline editing: double-click cell → input → save
- [ ] Dialog editing: edit button → modal form → save
- [ ] Batch editing: edit multiple cells → save all / cancel all
- [ ] Command column buttons work correctly
- [ ] Validation prevents invalid saves
- [ ] Add new row functionality
- [ ] Delete row with confirmation
- [ ] Dirty state tracking and indicators
- [ ] Unit tests for editing hook and validation

#### Task 3.5: Column Resize, Reorder, Freeze, Chooser
**File**: `src/components/ui/TableNative/` + column management
**Changes**:
- Create `useColumnManagement` hook
- Column resize: drag handle on header border, cursor change, min-width
- Column reorder: drag header to new position
- Frozen columns: sticky positioning with proper z-index
- Column chooser: button → dropdown/modal with checkboxes to toggle visibility
- Persist column widths and order in state

**Acceptance Criteria**:
- [ ] Drag column border to resize
- [ ] Drag column header to reorder
- [ ] Frozen columns scroll independently
- [ ] Column chooser shows/hides columns
- [ ] Column state persists during session
- [ ] Unit tests

#### Task 3.6: Detail Rows / Nested Tables
**File**: `src/components/ui/TableNative/` + detail row components
**Changes**:
- Add expand/collapse button column
- Render detail template in expanded `<tr>` with full colspan
- Support nested TableNative (hierarchical grid)
- Custom detail template via React component prop
- `onDetailExpand`, `onDetailCollapse` callbacks
- Animate expand/collapse

**Acceptance Criteria**:
- [ ] Expand button toggles detail row visibility
- [ ] Detail template receives parent row data
- [ ] Nested table renders inside detail row
- [ ] Multiple rows can be expanded simultaneously
- [ ] Animation on expand/collapse
- [ ] Unit tests

#### Task 3.7: Toolbar, Context Menu, Export
**File**: `src/components/ui/TableNative/` + toolbar/menu components
**Changes**:
- Create `TableToolbar` component (search, add, delete, export buttons, custom items)
- Create `TableContextMenu` component (right-click menu with positioned overlay)
- Implement export: CSV (native), Excel (via simple array-to-xlsx), Print (window.print)
- Global search filtering
- Read from `gridConfig.toolbar`, `gridConfig.contextMenu`, `gridConfig.export`

**Acceptance Criteria**:
- [ ] Toolbar renders above table with configured buttons
- [ ] Search input filters all visible columns
- [ ] Right-click opens context menu at cursor position
- [ ] CSV export downloads file
- [ ] Print opens browser print dialog
- [ ] Unit tests for toolbar and export

#### Task 3.8: Row Drag & Drop
**File**: `src/components/ui/TableNative/` + drag hook
**Changes**:
- Create `useTableDragDrop` hook using HTML5 Drag and Drop API
- Drag handle column (grip icon)
- Visual feedback during drag (shadow row, drop indicator line)
- Reorder within same table
- Cross-table drag & drop via data transfer
- `onRowDragStart`, `onRowDrop`, `onReorder` callbacks

**Acceptance Criteria**:
- [ ] Drag handle initiates row drag
- [ ] Visual drop indicator shows target position
- [ ] Rows reorder on drop
- [ ] Cross-table drag works
- [ ] Unit tests

#### Task 3.9: Virtualization
**File**: `src/components/ui/TableNative/` + virtual scroll
**Changes**:
- Create `useVirtualScroll` hook (windowed rendering)
- Only render visible rows + buffer
- Fixed row height mode for predictable scrolling
- Maintain scroll position on data changes
- Column virtualization for wide tables
- Read from `gridConfig.virtualization`

**Acceptance Criteria**:
- [ ] 10k+ rows render smoothly (only visible rows in DOM)
- [ ] Scroll position maintained on filter/sort
- [ ] Column virtualization hides off-screen columns
- [ ] Unit tests for virtualization calculations

#### Task 3.10: Clipboard & Keyboard Navigation
**File**: `src/components/ui/TableNative/` + keyboard hook
**Changes**:
- Ctrl+C copies selected cells/rows to clipboard
- Tab/Shift+Tab navigates between cells
- Arrow keys navigate cells in selection mode
- Enter starts editing (in edit mode)
- Escape cancels edit
- Ctrl+A selects all

**Acceptance Criteria**:
- [ ] Keyboard navigation works in all directions
- [ ] Copy to clipboard copies tab-separated values
- [ ] Keyboard editing triggers inline edit
- [ ] Unit tests for keyboard handler

---

### Phase 4: Theme System Enhancement

**Goal**: Expand DataGrid theming from 10 to ~30 CSS variables.

#### Task 4.1: Expand DataGridConfig Type
**File**: `src/stores/theme/types/componentTypes.ts`
**Changes**: Add new properties to `DataGridConfig`:
```typescript
interface DataGridConfig {
  // Existing (10)
  headerBackground: string;
  headerTextColor: string;
  headerBorder: string;
  rowEvenBackground: string;
  rowOddBackground: string;
  rowHoverBackground: string;
  rowSelectedBackground: string;
  cellBorderColor: string;
  cellPadding: string;
  paginationBackground: string;

  // New - Toolbar (~3)
  toolbarBackground: string;
  toolbarTextColor: string;
  toolbarBorderColor: string;

  // New - Filter Row (~3)
  filterRowBackground: string;
  filterRowBorderColor: string;
  filterInputBackground: string;

  // New - Grouping (~3)
  groupHeaderBackground: string;
  groupHeaderTextColor: string;
  groupDropAreaBackground: string;

  // New - Footer/Aggregates (~2)
  footerBackground: string;
  footerTextColor: string;

  // New - Editing (~3)
  editCellBackground: string;
  editCellBorderColor: string;
  editDirtyIndicatorColor: string;

  // New - Selection (~2)
  rowSelectedTextColor: string;
  cellSelectedBackground: string;

  // New - Sort & Resize (~2)
  sortIconColor: string;
  resizeHandleColor: string;

  // New - Pagination (~2)
  paginationTextColor: string;
  paginationActiveBackground: string;

  // New - Action Column (~2)
  actionButtonColor: string;
  actionButtonHoverColor: string;

  // New - Detail Row (~1)
  detailRowBackground: string;

  // New - Drag & Drop (~1)
  dragHandleColor: string;
}
```

**Acceptance Criteria**:
- [ ] All new properties added with correct types
- [ ] Zero breaking changes
- [ ] TypeScript compiles

#### Task 4.2: Update Default Theme Values
**Files**: `defaultComponentsDark.ts`, `defaultComponentsLight.ts`
**Changes**: Add sensible default values for all new DataGrid properties in both light and dark themes.

**Acceptance Criteria**:
- [ ] Light theme defaults look good visually
- [ ] Dark theme defaults look good visually
- [ ] All new properties have values in both themes

#### Task 4.3: Update CSS Variable Injection
**File**: `src/stores/theme/injectors/componentInjector.ts`
**Changes**: Add `root.style.setProperty()` calls for all new `--component-datagrid-*` CSS variables.

**Acceptance Criteria**:
- [ ] All ~30 CSS variables are injected
- [ ] Variables update reactively when theme changes

#### Task 4.4: Update Theme Editor UI
**File**: `src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/DataGridEditor.tsx`
**Changes**: Expand the editor to include color pickers for all new properties, organized in sub-sections (Toolbar, Filter, Grouping, Editing, Selection, etc.).

**Acceptance Criteria**:
- [ ] All ~30 properties editable via color pickers
- [ ] Organized in logical sub-sections with headers
- [ ] Changes apply in real-time to grid components
- [ ] File stays under 200 lines (split into sub-editors if needed)

#### Task 4.5: Apply CSS Variables to Both Grids
**Files**: TableNative styles + Syncfusion override CSS
**Changes**:
- TableNative: Use CSS variables in Tailwind classes / inline styles
- Syncfusion: Add CSS overrides in `syncfusion-overrides.css` using the variables
- Both grids should respond to all ~30 theme variables

**Acceptance Criteria**:
- [ ] Changing a theme variable updates both grid implementations
- [ ] Visual consistency between Syncfusion and Native grids
- [ ] Theme editor preview shows changes in real-time

---

### Phase 5: Showcase Pages

**Goal**: Create 2 dedicated pages demonstrating all grid features.

#### Task 5.1: Syncfusion Grid Showcase Page
**Route**: `/dashboard/components/grid/syncfusion`
**File**: `src/features/components/pages/SyncfusionGridShowcase/index.tsx`
**Content**: Multiple DataGrid instances demonstrating:
- Basic grid with sorting, filtering, paging
- Grouping with aggregates (footer + group footer)
- Inline editing with validation
- Dialog editing
- Batch editing with dirty indicators
- Command column (edit/delete buttons)
- Column resize, reorder, freeze
- Detail row with nested grid
- Row drag & drop
- Toolbar with search, export
- Context menu
- Virtualization (large dataset)
- Clipboard
- Column chooser

Each section should have:
- Descriptive heading
- Toggle switches for enabling/disabling features
- Code snippet preview (optional)
- The live grid instance

**Acceptance Criteria**:
- [ ] All features demonstrated with working examples
- [ ] Page loads without errors
- [ ] Theme editor panel available (SplitterComponent layout like existing DataGridPage)
- [ ] Feature toggle switches work correctly
- [ ] Page under 300 lines (split into section components)

#### Task 5.2: Native Grid Showcase Page
**Route**: `/dashboard/components/grid/native`
**File**: `src/features/components/pages/NativeGridShowcase/index.tsx`
**Content**: Mirrors Syncfusion showcase exactly, using TableNative instead.

**Acceptance Criteria**:
- [ ] Same feature sections as Syncfusion showcase
- [ ] All features work identically
- [ ] Theme editor panel available
- [ ] Page under 300 lines

#### Task 5.3: Update Routes & Navigation
**Files**: `routePaths.ts`, `routes.tsx`, sidebar navigation
**Changes**:
- Add `ComponentsGridSyncfusion = 'components/grid/syncfusion'`
- Add `ComponentsGridNative = 'components/grid/native'`
- Update existing `ComponentsGrid` to redirect to a choice page or Syncfusion by default
- Add sidebar menu items under Components section
- Update route preloading

**Acceptance Criteria**:
- [ ] Both pages accessible via sidebar navigation
- [ ] URL routing works correctly
- [ ] Lazy loading configured
- [ ] Preloading added for both pages

---

### Phase 6: Testing

#### Task 6.1: Unit Tests - Shared Types & Utilities
**Files**: `src/lib/grid/**/*.test.ts`
**Tests**:
- Column adapter functions (toSyncfusionColumn, toNativeColumn)
- Aggregate computations (sum, avg, count, min, max, custom)
- Column type detection with new column types
- GridConfig validation/resolution helpers

**Acceptance Criteria**:
- [ ] 100% coverage on aggregate utilities
- [ ] 100% coverage on column adapters
- [ ] All tests pass

#### Task 6.2: Unit Tests - Native Grid Hooks
**Files**: `src/components/ui/TableNative/**/*.test.ts`
**Tests**:
- `useTableSelection` - single, multi, checkbox, cell selection
- `useTableGrouping` - group, ungroup, collapse, expand
- `useTableEditing` - inline, dialog, batch edit, validation
- `useColumnManagement` - resize, reorder, freeze
- `useTableDragDrop` - drag events, reorder
- `useVirtualScroll` - visible row calculations

**Acceptance Criteria**:
- [ ] Each hook has dedicated test file
- [ ] Tests cover happy path + edge cases
- [ ] All tests pass

#### Task 6.3: Unit Tests - Syncfusion Grid Feature Resolution
**Files**: `src/components/ui/syncfusion/DataGrid/**/*.test.ts`
**Tests**:
- Feature service resolution from GridConfig
- Edit settings computation
- Page settings computation
- Column conversion from GridColumn
- Toolbar items resolution

**Acceptance Criteria**:
- [ ] All configuration resolution logic tested
- [ ] All tests pass

#### Task 6.4: E2E Tests - Syncfusion Grid Showcase
**Files**: `E2ETests/tests/showcase/syncfusion-grid-features.spec.ts`
**Tests**:
- Sorting (click header, verify order)
- Filtering (enter filter, verify results)
- Pagination (navigate pages, change page size)
- Grouping (drag to group, collapse/expand)
- Editing (inline edit cell, save, cancel)
- Column resize (drag border, verify width change)
- Detail row (expand, verify content)
- Export (click export, verify download)
- Selection (click row, Ctrl+click, checkbox)
- Toolbar search (type query, verify filter)

**Acceptance Criteria**:
- [ ] Each feature has at least 2 E2E tests
- [ ] Tests use proper page objects
- [ ] No flaky tests
- [ ] All tests pass

#### Task 6.5: E2E Tests - Native Grid Showcase
**Files**: `E2ETests/tests/showcase/native-grid-features.spec.ts`
**Tests**: Mirror all Syncfusion E2E tests for the native implementation.

**Acceptance Criteria**:
- [ ] Same test coverage as Syncfusion tests
- [ ] All tests pass

#### Task 6.6: E2E Tests - Theme Editor Grid Customization
**Files**: `E2ETests/tests/showcase/grid-theme-editor.spec.ts`
**Tests**:
- Change grid header background → verify CSS variable updates
- Change row colors → verify alternating rows
- Change selection color → verify selected row
- Change toolbar colors → verify toolbar styling
- All ~30 CSS variables respond to theme editor changes

**Acceptance Criteria**:
- [ ] At least 10 theme variable E2E tests
- [ ] Tests verify both Syncfusion and Native grids
- [ ] All tests pass

---

## Agent Parallelization Strategy

### Wave 1: Foundation (Can start immediately, all independent)
| Agent | Task | Type |
|-------|------|------|
| Agent A | Task 1.1 + 1.2: Shared types & column interface | frontend-dev |
| Agent B | Task 4.1 + 4.2: Theme type expansion + defaults | frontend-dev |
| Agent C | Research: Verify all Syncfusion Grid imports available | Explore |

### Wave 2: Core Features (After Wave 1 types are ready)
| Agent | Task | Type |
|-------|------|------|
| Agent A | Task 2.1-2.4: Syncfusion core features | frontend-dev |
| Agent B | Task 3.1-3.4: Native core features (selection, grouping, aggregates, editing) | frontend-dev |
| Agent C | Task 4.3 + 4.4: CSS injection + Theme editor UI | frontend-dev |

### Wave 3: Advanced Features (After Wave 2 core is ready)
| Agent | Task | Type |
|-------|------|------|
| Agent A | Task 2.5-2.8: Syncfusion advanced features | frontend-dev |
| Agent B | Task 3.5-3.10: Native advanced features | frontend-dev |
| Agent C | Task 4.5: Apply CSS variables to both grids | frontend-dev |

### Wave 4: Pages & Integration (After Wave 3)
| Agent | Task | Type |
|-------|------|------|
| Agent A | Task 5.1: Syncfusion showcase page | frontend-dev |
| Agent B | Task 5.2: Native showcase page | frontend-dev |
| Agent C | Task 5.3: Routes & navigation | frontend-dev |

### Wave 5: Testing (After Wave 4)
| Agent | Task | Type |
|-------|------|------|
| Agent A | Task 6.1 + 6.3: Unit tests (shared + Syncfusion) | frontend-dev |
| Agent B | Task 6.2: Unit tests (Native hooks) | frontend-dev |
| Agent C | Task 6.4 + 6.5: E2E tests (both showcases) | regression-tester |
| Agent D | Task 6.6: E2E tests (theme editor) | regression-tester |

### Wave 6: Quality Gate (After all code changes)
| Agent | Task | Type |
|-------|------|------|
| Agent A | Lint + Build verification | quality-gate |
| Agent B | Code standards review | code-reviewer |
| Agent C | Full regression suite | regression-tester |

---

## Success Criteria (Overall)

- [ ] Both grids support ALL listed features with matching behavior
- [ ] Common `GridColumn` + `GridConfig` interface used by both
- [ ] Theme editor has ~30 CSS variables for DataGrid customization
- [ ] Theme changes apply in real-time to both grid implementations
- [ ] 2 dedicated showcase pages (Syncfusion + Native) demonstrating all features
- [ ] Unit test coverage for all hooks, utilities, and configuration logic
- [ ] E2E test coverage for all user-facing features on both pages
- [ ] ESLint: 0 errors (excluding pre-existing)
- [ ] TypeScript: 0 errors (excluding pre-existing)
- [ ] Build: successful
- [ ] All files under 300 lines, components under 200 lines, functions under 50 lines

## Estimated Scope

| Category | Files | Lines (approx) |
|----------|-------|----------------|
| Shared types | 3 | ~300 |
| Syncfusion DataGrid enhancements | 5-8 | ~800 |
| Native TableNative enhancements | 15-20 | ~2500 |
| Hooks & utilities | 10-12 | ~1500 |
| Theme system | 4 | ~400 |
| Showcase pages | 8-10 | ~1200 |
| Unit tests | 8-10 | ~1500 |
| E2E tests | 4-5 | ~800 |
| **Total** | **~60-70 files** | **~9000 lines** |
