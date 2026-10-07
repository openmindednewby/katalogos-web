import { useCallback } from 'react';

/** Swap two adjacent elements in an array. */
export function swapItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const isFromOutOfBounds = fromIndex < 0 || fromIndex >= items.length;
  const isToOutOfBounds = toIndex < 0 || toIndex >= items.length;
  if (isFromOutOfBounds || isToOutOfBounds)
    return items;

  const result = [...items];
  const temp = result[fromIndex];
  result[fromIndex] = result[toIndex];
  result[toIndex] = temp;
  return result;
}

interface UseReorderResult<T> {
  moveUp: (items: T[], index: number) => T[];
  moveDown: (items: T[], index: number) => T[];
}

/**
 * Hook that returns stable reorder callbacks.
 * @param assignDisplayOrder - function that reassigns displayOrder after swap
 */
export function useReorder<T>(assignDisplayOrder: (items: T[]) => T[]): UseReorderResult<T> {
  const moveUp = useCallback(
    (items: T[], index: number): T[] => {
      const PREVIOUS_INDEX_OFFSET = 1;
      const swapped = swapItems(items, index, index - PREVIOUS_INDEX_OFFSET);
      return assignDisplayOrder(swapped);
    },
    [assignDisplayOrder],
  );

  const moveDown = useCallback(
    (items: T[], index: number): T[] => {
      const NEXT_INDEX_OFFSET = 1;
      const swapped = swapItems(items, index, index + NEXT_INDEX_OFFSET);
      return assignDisplayOrder(swapped);
    },
    [assignDisplayOrder],
  );

  return { moveUp, moveDown };
}
