/**
 * Tests for useBulkSelection hook — selection mode management and item toggling.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useBulkSelection } from './useBulkSelection';

import type { MenuContents } from '../../../types/menuTypes';

const MENU_CONTENTS: MenuContents = {
  categories: [
    {
      name: 'Drinks',
      items: [
        { id: 'item-1', name: 'Coffee', price: 3 },
        { id: 'item-2', name: 'Tea', price: 2 },
      ],
    },
    {
      name: 'Food',
      items: [
        { id: 'item-3', name: 'Sandwich', price: 5 },
      ],
    },
  ],
};

describe('useBulkSelection', () => {
  it('starts in non-selection mode with empty selection', () => {
    const { result } = renderHook(() => useBulkSelection());

    expect(result.current.isSelectionMode).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('enters and exits selection mode', () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => { result.current.enterSelectionMode(); });
    expect(result.current.isSelectionMode).toBe(true);

    act(() => { result.current.exitSelectionMode(); });
    expect(result.current.isSelectionMode).toBe(false);
  });

  it('clears selection when exiting selection mode', () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => { result.current.enterSelectionMode(); });
    act(() => { result.current.toggleItem('item-1'); });
    expect(result.current.selectedCount).toBe(1);

    act(() => { result.current.exitSelectionMode(); });
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('item-1')).toBe(false);
  });

  it('toggles individual items on and off', () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => { result.current.toggleItem('item-1'); });
    expect(result.current.isSelected('item-1')).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => { result.current.toggleItem('item-1'); });
    expect(result.current.isSelected('item-1')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('selects multiple items independently', () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => { result.current.toggleItem('item-1'); });
    act(() => { result.current.toggleItem('item-2'); });
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.isSelected('item-1')).toBe(true);
    expect(result.current.isSelected('item-2')).toBe(true);
    expect(result.current.isSelected('item-3')).toBe(false);
  });

  it('selects all items in a category', () => {
    const { result } = renderHook(() => useBulkSelection());
    const FIRST_CATEGORY = 0;

    act(() => { result.current.selectAllInCategory(FIRST_CATEGORY, MENU_CONTENTS); });
    expect(result.current.isSelected('item-1')).toBe(true);
    expect(result.current.isSelected('item-2')).toBe(true);
    expect(result.current.isSelected('item-3')).toBe(false);
    expect(result.current.selectedCount).toBe(2);
  });

  it('merges selectAllInCategory with existing selection', () => {
    const { result } = renderHook(() => useBulkSelection());
    const FIRST_CATEGORY = 0;
    const SECOND_CATEGORY = 1;

    act(() => { result.current.toggleItem('item-3'); });
    act(() => { result.current.selectAllInCategory(FIRST_CATEGORY, MENU_CONTENTS); });
    expect(result.current.selectedCount).toBe(3);

    act(() => { result.current.selectAllInCategory(SECOND_CATEGORY, MENU_CONTENTS); });
    expect(result.current.selectedCount).toBe(3);
  });

  it('handles selectAllInCategory for invalid index gracefully', () => {
    const { result } = renderHook(() => useBulkSelection());
    const INVALID_INDEX = 99;

    act(() => { result.current.selectAllInCategory(INVALID_INDEX, MENU_CONTENTS); });
    expect(result.current.selectedCount).toBe(0);
  });

  it('clearSelection removes all selected items', () => {
    const { result } = renderHook(() => useBulkSelection());

    act(() => { result.current.toggleItem('item-1'); });
    act(() => { result.current.toggleItem('item-2'); });
    expect(result.current.selectedCount).toBe(2);

    act(() => { result.current.clearSelection(); });
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('item-1')).toBe(false);
  });

  it('isSelected returns false for unknown IDs', () => {
    const { result } = renderHook(() => useBulkSelection());

    expect(result.current.isSelected('nonexistent')).toBe(false);
  });
});
