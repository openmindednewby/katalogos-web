import { act, renderHook } from '@testing-library/react-native';

import { useContextMenu, MENU_WIDTH_ESTIMATE, VIEWPORT_PADDING } from './useContextMenu';

import type { ContextMenuItem } from '../types';

// =============================================================================
// Test Data
// =============================================================================

const MOCK_ROW: Record<string, unknown> = { id: 1, name: 'Test Row' };

// =============================================================================
// Helpers
// =============================================================================

function createMouseEvent(clientX: number, clientY: number): React.MouseEvent {
  return {
    clientX,
    clientY,
    preventDefault: jest.fn(),
  } as unknown as React.MouseEvent;
}

// =============================================================================
// Tests
// =============================================================================

describe('useContextMenu', () => {
  let mockOnItemClick: jest.Mock;

  beforeEach(() => {
    mockOnItemClick = jest.fn();
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('starts closed', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      expect(result.current.isOpen).toBe(false);
    });

    it('has no context row initially', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      expect(result.current.contextRow).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------

  describe('open and close', () => {
    it('opens menu at mouse position', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200), MOCK_ROW);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.position.x).toBe(100);
      expect(result.current.position.y).toBe(200);
    });

    it('stores context row on open', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200), MOCK_ROW);
      });

      expect(result.current.contextRow).toEqual(MOCK_ROW);
    });

    it('handles open without row data', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200));
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.contextRow).toBeNull();
    });

    it('closes menu via closeMenu', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200));
      });

      act(() => {
        result.current.closeMenu();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.contextRow).toBeNull();
    });

    it('prevents default event on right click', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      const event = createMouseEvent(100, 200);

      act(() => {
        result.current.openMenu(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Position Calculation
  // ---------------------------------------------------------------------------

  describe('position calculation', () => {
    it('flips horizontally when near right edge', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      const nearRightEdge = 1024 - 50;

      act(() => {
        result.current.openMenu(createMouseEvent(nearRightEdge, 200));
      });

      expect(result.current.position.x).toBe(nearRightEdge - MENU_WIDTH_ESTIMATE);
    });

    it('does not go below minimum padding', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(-100, -100));
      });

      expect(result.current.position.x).toBe(VIEWPORT_PADDING);
      expect(result.current.position.y).toBe(VIEWPORT_PADDING);
    });
  });

  // ---------------------------------------------------------------------------
  // Item Click
  // ---------------------------------------------------------------------------

  describe('item click', () => {
    it('calls onItemClick with item and row data', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      const item: ContextMenuItem = { id: 'copy', text: 'Copy' };

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200), MOCK_ROW);
      });

      act(() => {
        result.current.handleItemClick(item);
      });

      expect(mockOnItemClick).toHaveBeenCalledWith(item, MOCK_ROW);
    });

    it('closes menu after item click', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      const item: ContextMenuItem = { id: 'edit', text: 'Edit' };

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200));
      });

      act(() => {
        result.current.handleItemClick(item);
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('does not fire callback for disabled items', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));
      const disabledItem: ContextMenuItem = { id: 'disabled', text: 'Disabled', disabled: true };

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200));
      });

      act(() => {
        result.current.handleItemClick(disabledItem);
      });

      expect(mockOnItemClick).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Close on External Events
  // ---------------------------------------------------------------------------

  describe('external close triggers', () => {
    it('closes on click outside', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200));
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('closes on Escape key', () => {
      const { result } = renderHook(() => useContextMenu(mockOnItemClick));

      act(() => {
        result.current.openMenu(createMouseEvent(100, 200));
      });

      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('does not add listeners when menu is closed', () => {
      const addSpy = jest.spyOn(document, 'addEventListener');
      renderHook(() => useContextMenu(mockOnItemClick));

      const mousedownCalls = addSpy.mock.calls.filter((call) => call[0] === 'mousedown');
      expect(mousedownCalls).toHaveLength(0);

      addSpy.mockRestore();
    });
  });
});
