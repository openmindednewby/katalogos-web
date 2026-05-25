import { act, renderHook } from '@testing-library/react-native';

import { useDetailRows } from './useDetailRows';

// =============================================================================
// Tests
// =============================================================================

describe('useDetailRows', () => {
  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('starts with no expanded rows', () => {
      const { result } = renderHook(() => useDetailRows(true));

      expect(result.current.expandedRows.size).toBe(0);
    });

    it('reports no rows as expanded initially', () => {
      const { result } = renderHook(() => useDetailRows(true));

      expect(result.current.isExpanded('row-1')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Toggle Expand
  // ---------------------------------------------------------------------------

  describe('toggleExpand', () => {
    it('expands a row when toggled', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.toggleExpand('row-1');
      });

      expect(result.current.isExpanded('row-1')).toBe(true);
    });

    it('collapses an expanded row when toggled again', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.toggleExpand('row-1');
      });

      act(() => {
        result.current.toggleExpand('row-1');
      });

      expect(result.current.isExpanded('row-1')).toBe(false);
    });

    it('supports multiple expanded rows simultaneously', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.toggleExpand('row-1');
        result.current.toggleExpand('row-2');
        result.current.toggleExpand('row-3');
      });

      expect(result.current.isExpanded('row-1')).toBe(true);
      expect(result.current.isExpanded('row-2')).toBe(true);
      expect(result.current.isExpanded('row-3')).toBe(true);
      expect(result.current.expandedRows.size).toBe(3);
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() => useDetailRows(false));

      act(() => {
        result.current.toggleExpand('row-1');
      });

      expect(result.current.isExpanded('row-1')).toBe(false);
      expect(result.current.expandedRows.size).toBe(0);
    });

    it('handles numeric row ids', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.toggleExpand(42);
      });

      expect(result.current.isExpanded(42)).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Expand All / Collapse All
  // ---------------------------------------------------------------------------

  describe('expandAll', () => {
    it('expands all provided row ids', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.expandAll(['row-1', 'row-2', 'row-3']);
      });

      expect(result.current.expandedRows.size).toBe(3);
      expect(result.current.isExpanded('row-1')).toBe(true);
      expect(result.current.isExpanded('row-2')).toBe(true);
      expect(result.current.isExpanded('row-3')).toBe(true);
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() => useDetailRows(false));

      act(() => {
        result.current.expandAll(['row-1', 'row-2']);
      });

      expect(result.current.expandedRows.size).toBe(0);
    });

    it('replaces previously expanded rows', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.toggleExpand('row-old');
      });

      act(() => {
        result.current.expandAll(['row-new-1', 'row-new-2']);
      });

      expect(result.current.isExpanded('row-old')).toBe(false);
      expect(result.current.isExpanded('row-new-1')).toBe(true);
      expect(result.current.isExpanded('row-new-2')).toBe(true);
    });
  });

  describe('collapseAll', () => {
    it('collapses all expanded rows', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.expandAll(['row-1', 'row-2', 'row-3']);
      });

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedRows.size).toBe(0);
    });

    it('is safe to call when nothing is expanded', () => {
      const { result } = renderHook(() => useDetailRows(true));

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedRows.size).toBe(0);
    });
  });
});
