import { act, renderHook } from '@testing-library/react-native';

import { useColumnManagement, MIN_COLUMN_WIDTH } from './useColumnManagement';

import type { TableColumn } from '../types';

// =============================================================================
// Test Data
// =============================================================================

const MOCK_COLUMNS: TableColumn[] = [
  { field: 'id', headerText: 'ID', width: 80 },
  { field: 'name', headerText: 'Name', width: 200 },
  { field: 'email', headerText: 'Email', width: 250 },
  { field: 'status', headerText: 'Status', width: 100 },
];

// =============================================================================
// Tests
// =============================================================================

describe('useColumnManagement', () => {
  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('initializes column order from provided columns', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      expect(result.current.columnOrder).toEqual(['id', 'name', 'email', 'status']);
    });

    it('initializes column widths from provided columns', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      expect(result.current.columnWidths.id).toBe(80);
      expect(result.current.columnWidths.name).toBe(200);
    });

    it('uses MIN_COLUMN_WIDTH when column has no width', () => {
      const columns: TableColumn[] = [{ field: 'test', headerText: 'Test' }];
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: columns }),
      );

      expect(result.current.columnWidths.test).toBe(MIN_COLUMN_WIDTH);
    });

    it('starts with no hidden columns', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      expect(result.current.hiddenColumns.size).toBe(0);
    });

    it('is not resizing initially', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      expect(result.current.isResizing).toBe(false);
      expect(result.current.resizingField).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Column Resize
  // ---------------------------------------------------------------------------

  describe('resize', () => {
    it('tracks resizing state when resize starts', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.startResize('name', 100);
      });

      expect(result.current.isResizing).toBe(true);
      expect(result.current.resizingField).toBe('name');
    });

    it('updates column width on resize move', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.startResize('name', 100);
      });

      act(() => {
        result.current.onResizeMove(150);
      });

      expect(result.current.columnWidths.name).toBe(250);
    });

    it('enforces minimum column width', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.startResize('name', 100);
      });

      act(() => {
        result.current.onResizeMove(-200);
      });

      expect(result.current.columnWidths.name).toBe(MIN_COLUMN_WIDTH);
    });

    it('clears resizing state on end resize', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.startResize('name', 100);
      });

      act(() => {
        result.current.endResize();
      });

      expect(result.current.isResizing).toBe(false);
      expect(result.current.resizingField).toBeNull();
    });

    it('does not resize when allowResizing is false', () => {
      const { result } = renderHook(() =>
        useColumnManagement({
          initialColumns: MOCK_COLUMNS,
          allowResizing: false,
        }),
      );

      act(() => {
        result.current.startResize('name', 100);
      });

      expect(result.current.isResizing).toBe(false);
    });

    it('does nothing on move when not resizing', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      const initialWidth = result.current.columnWidths.name;

      act(() => {
        result.current.onResizeMove(200);
      });

      expect(result.current.columnWidths.name).toBe(initialWidth);
    });
  });

  // ---------------------------------------------------------------------------
  // Column Reorder
  // ---------------------------------------------------------------------------

  describe('reorder', () => {
    it('reorders columns from one position to another', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.reorderColumn('email', 'name');
      });

      expect(result.current.columnOrder).toEqual(['id', 'email', 'name', 'status']);
    });

    it('does nothing when reordering to same position', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.reorderColumn('name', 'name');
      });

      expect(result.current.columnOrder).toEqual(['id', 'name', 'email', 'status']);
    });

    it('does nothing when allowReordering is false', () => {
      const { result } = renderHook(() =>
        useColumnManagement({
          initialColumns: MOCK_COLUMNS,
          allowReordering: false,
        }),
      );

      act(() => {
        result.current.reorderColumn('email', 'name');
      });

      expect(result.current.columnOrder).toEqual(['id', 'name', 'email', 'status']);
    });

    it('handles reordering with invalid field gracefully', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.reorderColumn('nonexistent', 'name');
      });

      expect(result.current.columnOrder).toEqual(['id', 'name', 'email', 'status']);
    });
  });

  // ---------------------------------------------------------------------------
  // Column Visibility
  // ---------------------------------------------------------------------------

  describe('visibility', () => {
    it('hides a column when toggled', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      expect(result.current.hiddenColumns.has('email')).toBe(true);
      expect(result.current.columns).toHaveLength(MOCK_COLUMNS.length - 1);
    });

    it('shows a hidden column when toggled again', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      act(() => {
        result.current.toggleColumnVisibility('email');
      });

      expect(result.current.hiddenColumns.has('email')).toBe(false);
      expect(result.current.columns).toHaveLength(MOCK_COLUMNS.length);
    });

    it('shows all columns after hiding some', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.toggleColumnVisibility('email');
        result.current.toggleColumnVisibility('status');
      });

      act(() => {
        result.current.showAllColumns();
      });

      expect(result.current.hiddenColumns.size).toBe(0);
      expect(result.current.columns).toHaveLength(MOCK_COLUMNS.length);
    });

    it('excludes hidden columns from resolved column list', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.toggleColumnVisibility('name');
      });

      const fields = result.current.columns.map((c) => c.field);
      expect(fields).not.toContain('name');
      expect(fields).toEqual(['id', 'email', 'status']);
    });
  });

  // ---------------------------------------------------------------------------
  // Resolved Columns
  // ---------------------------------------------------------------------------

  describe('resolved columns', () => {
    it('respects column order in resolved columns', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.reorderColumn('status', 'id');
      });

      const fields = result.current.columns.map((c) => c.field);
      expect(fields[0]).toBe('status');
    });

    it('respects both order and visibility together', () => {
      const { result } = renderHook(() =>
        useColumnManagement({ initialColumns: MOCK_COLUMNS }),
      );

      act(() => {
        result.current.reorderColumn('status', 'id');
      });

      act(() => {
        result.current.toggleColumnVisibility('name');
      });

      const fields = result.current.columns.map((c) => c.field);
      expect(fields).toEqual(['status', 'id', 'email']);
    });
  });
});
