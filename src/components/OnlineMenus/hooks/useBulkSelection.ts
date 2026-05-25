/**
 * Hook for managing bulk item selection state in the menu editor.
 * Provides selection mode toggling, individual/all item selection, and O(1) lookups.
 */
import { useCallback, useMemo, useState } from 'react';

import type { MenuContents } from '../../../types/menuTypes';

interface UseBulkSelectionReturn {
  isSelectionMode: boolean;
  selectedItemIds: Set<string>;
  selectedCount: number;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleItem: (itemId: string) => void;
  selectAllInCategory: (categoryIndex: number, contents: MenuContents) => void;
  clearSelection: () => void;
  isSelected: (itemId: string) => boolean;
}

/** Toggle a single item in the selection set, returning a new Set. */
function toggleItemInSet(prev: Set<string>, itemId: string): Set<string> {
  const next = new Set(prev);
  if (next.has(itemId)) next.delete(itemId);
  else next.add(itemId);
  return next;
}

/** Extract valid item IDs from a category and add them all to the set. */
function addCategoryItemsToSet(prev: Set<string>, categoryIndex: number, contents: MenuContents): Set<string> {
  const category = contents.categories?.[categoryIndex];
  if (!category) return prev;
  const itemIds = (category.items ?? [])
    .map((item) => item.id)
    .filter((id): id is string => typeof id === 'string' && id !== '');
  const next = new Set(prev);
  for (const id of itemIds) next.add(id);
  return next;
}

function useSelectionModeState(): {
  isSelectionMode: boolean;
  selectedItemIds: Set<string>;
  setIsSelectionMode: (v: boolean) => void;
  setSelectedItemIds: React.Dispatch<React.SetStateAction<Set<string>>>;
} {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set<string>());
  return { isSelectionMode, selectedItemIds, setIsSelectionMode, setSelectedItemIds };
}

export function useBulkSelection(): UseBulkSelectionReturn {
  const { isSelectionMode, selectedItemIds, setIsSelectionMode, setSelectedItemIds } = useSelectionModeState();

  const enterSelectionMode = useCallback(() => setIsSelectionMode(true), [setIsSelectionMode]);
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItemIds(new Set<string>());
  }, [setIsSelectionMode, setSelectedItemIds]);

  const toggleItem = useCallback(
    (itemId: string) => setSelectedItemIds((prev) => toggleItemInSet(prev, itemId)),
    [setSelectedItemIds],
  );
  const selectAllInCategory = useCallback(
    (categoryIndex: number, contents: MenuContents) =>
      setSelectedItemIds((prev) => addCategoryItemsToSet(prev, categoryIndex, contents)),
    [setSelectedItemIds],
  );
  const clearSelection = useCallback(() => setSelectedItemIds(new Set<string>()), [setSelectedItemIds]);
  const isSelected = useCallback((itemId: string): boolean => selectedItemIds.has(itemId), [selectedItemIds]);
  const selectedCount = useMemo(() => selectedItemIds.size, [selectedItemIds]);

  return {
    isSelectionMode, selectedItemIds, selectedCount,
    enterSelectionMode, exitSelectionMode, toggleItem,
    selectAllInCategory, clearSelection, isSelected,
  };
}
