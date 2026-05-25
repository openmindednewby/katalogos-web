import { act, renderHook } from '@testing-library/react-native';

import { useTableDragDrop, reorderArray } from './useTableDragDrop';

// =============================================================================
// Test Data
// =============================================================================

const MOCK_DATA: Array<Record<string, unknown>> = [
  { id: 1, name: 'Row A' },
  { id: 2, name: 'Row B' },
  { id: 3, name: 'Row C' },
  { id: 4, name: 'Row D' },
];

// =============================================================================
// Helpers
// =============================================================================

function createDragEvent(overrides?: Partial<React.DragEvent>): React.DragEvent {
  return {
    preventDefault: jest.fn(),
    currentTarget: document.createElement('tr'),
    dataTransfer: {
      effectAllowed: '',
      dropEffect: '',
      setData: jest.fn(),
    },
    ...overrides,
  } as unknown as React.DragEvent;
}

// =============================================================================
// Tests
// =============================================================================

describe('useTableDragDrop', () => {
  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('starts with no drag or drop index', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: true }),
      );

      expect(result.current.dragIndex).toBeNull();
      expect(result.current.dropIndex).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Drag Start
  // ---------------------------------------------------------------------------

  describe('drag start', () => {
    it('sets drag index on drag start', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: true }),
      );

      act(() => {
        result.current.handleDragStart(1)(createDragEvent());
      });

      expect(result.current.dragIndex).toBe(1);
      expect(result.current.isDragging).toBe(true);
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: false }),
      );

      act(() => {
        result.current.handleDragStart(1)(createDragEvent());
      });

      expect(result.current.dragIndex).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Drag Over
  // ---------------------------------------------------------------------------

  describe('drag over', () => {
    it('sets drop index on drag over', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: true }),
      );

      act(() => {
        result.current.handleDragStart(0)(createDragEvent());
      });

      act(() => {
        result.current.handleDragOver(2)(createDragEvent());
      });

      expect(result.current.dropIndex).toBe(2);
    });

    it('prevents default to allow drop', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: true }),
      );

      const event = createDragEvent();

      act(() => {
        result.current.handleDragOver(2)(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: false }),
      );

      act(() => {
        result.current.handleDragOver(2)(createDragEvent());
      });

      expect(result.current.dropIndex).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Drop
  // ---------------------------------------------------------------------------

  describe('drop', () => {
    it('calls onReorder with correct indices', () => {
      const mockOnReorder = jest.fn();
      const { result } = renderHook(() =>
        useTableDragDrop({
          data: MOCK_DATA,
          enabled: true,
          onReorder: mockOnReorder,
        }),
      );

      act(() => {
        result.current.handleDragStart(0)(createDragEvent());
      });

      act(() => {
        result.current.handleDrop(2)(createDragEvent());
      });

      expect(mockOnReorder).toHaveBeenCalledWith(0, 2);
    });

    it('calls onRowDrop with dropped row and target index', () => {
      const mockOnRowDrop = jest.fn();
      const { result } = renderHook(() =>
        useTableDragDrop({
          data: MOCK_DATA,
          enabled: true,
          onRowDrop: mockOnRowDrop,
        }),
      );

      act(() => {
        result.current.handleDragStart(1)(createDragEvent());
      });

      act(() => {
        result.current.handleDrop(3)(createDragEvent());
      });

      expect(mockOnRowDrop).toHaveBeenCalledWith(MOCK_DATA[1], 3);
    });

    it('does not call onReorder when dropping on same index', () => {
      const mockOnReorder = jest.fn();
      const { result } = renderHook(() =>
        useTableDragDrop({
          data: MOCK_DATA,
          enabled: true,
          onReorder: mockOnReorder,
        }),
      );

      act(() => {
        result.current.handleDragStart(1)(createDragEvent());
      });

      act(() => {
        result.current.handleDrop(1)(createDragEvent());
      });

      expect(mockOnReorder).not.toHaveBeenCalled();
    });

    it('resets drag and drop state after drop', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({
          data: MOCK_DATA,
          enabled: true,
          onReorder: jest.fn(),
        }),
      );

      act(() => {
        result.current.handleDragStart(0)(createDragEvent());
      });

      act(() => {
        result.current.handleDrop(2)(createDragEvent());
      });

      expect(result.current.dragIndex).toBeNull();
      expect(result.current.dropIndex).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Drag End
  // ---------------------------------------------------------------------------

  describe('drag end', () => {
    it('clears all drag state', () => {
      const { result } = renderHook(() =>
        useTableDragDrop({ data: MOCK_DATA, enabled: true }),
      );

      act(() => {
        result.current.handleDragStart(1)(createDragEvent());
      });

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.dragIndex).toBeNull();
      expect(result.current.dropIndex).toBeNull();
      expect(result.current.isDragging).toBe(false);
    });
  });
});

// =============================================================================
// reorderArray Utility
// =============================================================================

describe('reorderArray', () => {
  it('moves element from one position to another', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const result = reorderArray(arr, 0, 2);

    expect(result).toEqual(['b', 'c', 'a', 'd']);
  });

  it('does not mutate original array', () => {
    const arr = ['a', 'b', 'c'];
    const result = reorderArray(arr, 0, 2);

    expect(arr).toEqual(['a', 'b', 'c']);
    expect(result).not.toBe(arr);
  });

  it('handles moving to same position', () => {
    const arr = ['a', 'b', 'c'];
    const result = reorderArray(arr, 1, 1);

    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('handles moving to end', () => {
    const arr = ['a', 'b', 'c'];
    const result = reorderArray(arr, 0, 2);

    expect(result).toEqual(['b', 'c', 'a']);
  });

  it('handles moving from end to start', () => {
    const arr = ['a', 'b', 'c'];
    const result = reorderArray(arr, 2, 0);

    expect(result).toEqual(['c', 'a', 'b']);
  });
});
