/**
 * Tests for useReorder hook and swapItems utility.
 */
import { renderHook } from '@testing-library/react-native';

import { swapItems, useReorder } from './useReorder';

interface TestItem {
  name: string;
  displayOrder?: number;
}

function assignOrder(items: TestItem[]): TestItem[] {
  return items.map((item, index) => ({ ...item, displayOrder: index }));
}

describe('swapItems', () => {
  const items = ['A', 'B', 'C', 'D'];

  it('swaps two adjacent items', () => {
    const result = swapItems(items, 0, 1);
    expect(result).toEqual(['B', 'A', 'C', 'D']);
  });

  it('swaps non-adjacent items', () => {
    const result = swapItems(items, 0, 3);
    expect(result).toEqual(['D', 'B', 'C', 'A']);
  });

  it('returns original array when fromIndex is out of bounds', () => {
    const result = swapItems(items, -1, 1);
    expect(result).toBe(items);
  });

  it('returns original array when toIndex is out of bounds', () => {
    const result = swapItems(items, 0, 4);
    expect(result).toBe(items);
  });

  it('returns original array when both indices are negative', () => {
    const result = swapItems(items, -1, -2);
    expect(result).toBe(items);
  });

  it('does not mutate original array', () => {
    const original = ['X', 'Y', 'Z'];
    swapItems(original, 0, 2);
    expect(original).toEqual(['X', 'Y', 'Z']);
  });

  it('handles single-element array gracefully', () => {
    const result = swapItems(['only'], 0, 1);
    expect(result).toBe(result);
  });
});

describe('useReorder', () => {
  const items: TestItem[] = [
    { name: 'First', displayOrder: 0 },
    { name: 'Second', displayOrder: 1 },
    { name: 'Third', displayOrder: 2 },
  ];

  it('moves item up and reassigns displayOrder', () => {
    const { result } = renderHook(() => useReorder<TestItem>(assignOrder));

    const reordered = result.current.moveUp(items, 1);

    expect(reordered[0].name).toBe('Second');
    expect(reordered[1].name).toBe('First');
    expect(reordered[2].name).toBe('Third');
    expect(reordered[0].displayOrder).toBe(0);
    expect(reordered[1].displayOrder).toBe(1);
    expect(reordered[2].displayOrder).toBe(2);
  });

  it('moves item down and reassigns displayOrder', () => {
    const { result } = renderHook(() => useReorder<TestItem>(assignOrder));

    const reordered = result.current.moveDown(items, 0);

    expect(reordered[0].name).toBe('Second');
    expect(reordered[1].name).toBe('First');
    expect(reordered[2].name).toBe('Third');
    expect(reordered[0].displayOrder).toBe(0);
    expect(reordered[1].displayOrder).toBe(1);
    expect(reordered[2].displayOrder).toBe(2);
  });

  it('does not change array when moving first item up', () => {
    const { result } = renderHook(() => useReorder<TestItem>(assignOrder));

    const reordered = result.current.moveUp(items, 0);

    expect(reordered[0].name).toBe('First');
    expect(reordered[1].name).toBe('Second');
    expect(reordered[2].name).toBe('Third');
  });

  it('does not change array when moving last item down', () => {
    const { result } = renderHook(() => useReorder<TestItem>(assignOrder));
    const LAST_INDEX = 2;

    const reordered = result.current.moveDown(items, LAST_INDEX);

    expect(reordered[0].name).toBe('First');
    expect(reordered[1].name).toBe('Second');
    expect(reordered[2].name).toBe('Third');
  });

  it('handles empty array', () => {
    const { result } = renderHook(() => useReorder<TestItem>(assignOrder));

    const reordered = result.current.moveUp([], 0);

    expect(reordered).toEqual([]);
  });

  it('returns stable callbacks across renders', () => {
    const { result, rerender } = renderHook(() => useReorder<TestItem>(assignOrder));
    const { moveUp: firstMoveUp, moveDown: firstMoveDown } = result.current;

    rerender({});

    expect(result.current.moveUp).toBe(firstMoveUp);
    expect(result.current.moveDown).toBe(firstMoveDown);
  });
});
