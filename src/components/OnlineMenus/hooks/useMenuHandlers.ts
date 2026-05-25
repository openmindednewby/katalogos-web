/**
 * Hook for menu content editing handlers (category + item CRUD, reorder, expansion).
 * Extracted from MenuContentEditor to keep the component under the line limit.
 */
import { useCallback, useMemo, useState } from 'react';

import { FM } from '@/localization/helpers';

import { useReorder } from './useReorder';
import { notify } from '../../../lib/notifications';
import { useSubscription } from '../../../lib/subscription/hooks/useSubscription';
import { generateUniqueId, updateCategoryDisplayOrder, updateMenuItemDisplayOrder } from '../../../types/menuTypes';
import { isValueDefined } from '../../../utils/is';

import type { Category, MenuItem, MenuContents } from '../../../types/menuTypes';

interface UseMenuHandlersParams {
  currentContents: MenuContents;
  onChange: (contents: MenuContents) => void;
  onCategoryFocus?: (id: string | null) => void;
}

interface UseMenuHandlersReturn {
  expandedCategories: Set<string>;
  handleAddCategory: () => void;
  handleUpdateCategory: (index: number, updates: Partial<Category>) => void;
  handleDeleteCategory: (index: number) => void;
  handleMoveCategoryUp: (index: number) => void;
  handleMoveCategoryDown: (index: number) => void;
  handleAddItem: (categoryIndex: number) => void;
  handleUpdateItem: (catIdx: number, itemIdx: number, updates: Partial<MenuItem>) => void;
  handleDeleteItem: (catIdx: number, itemIdx: number) => void;
  handleMoveItemUp: (catIdx: number, itemIdx: number) => void;
  handleMoveItemDown: (catIdx: number, itemIdx: number) => void;
  toggleCategory: (categoryId: string) => void;
  collapseAll: () => void;
}

interface ReorderFns {
  catUp: (items: Category[], index: number) => Category[];
  catDown: (items: Category[], index: number) => Category[];
  itemUp: (items: MenuItem[], index: number) => MenuItem[];
  itemDown: (items: MenuItem[], index: number) => MenuItem[];
}

type CatPick = Pick<UseMenuHandlersReturn, 'handleAddCategory' | 'handleUpdateCategory' | 'handleDeleteCategory' | 'handleMoveCategoryUp' | 'handleMoveCategoryDown'>;
type ItemPick = Pick<UseMenuHandlersReturn, 'handleAddItem' | 'handleUpdateItem' | 'handleDeleteItem' | 'handleMoveItemUp' | 'handleMoveItemDown'>;

export function useMenuHandlers({ currentContents, onChange, onCategoryFocus }: UseMenuHandlersParams): UseMenuHandlersReturn {
  const { limits } = useSubscription();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { moveUp: catUp, moveDown: catDown } = useReorder<Category>(updateCategoryDisplayOrder);
  const { moveUp: itemUp, moveDown: itemDown } = useReorder<MenuItem>(updateMenuItemDisplayOrder);
  const reorder: ReorderFns = useMemo(() => ({ catUp, catDown, itemUp, itemDown }), [catUp, catDown, itemUp, itemDown]);

  const categoryHandlers = useCategoryHandlers(currentContents, onChange, reorder);
  const itemHandlers = useItemHandlers(currentContents, onChange, limits.maxItemsPerMenu, reorder);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); onCategoryFocus?.(null); }
      else { next.add(id); onCategoryFocus?.(id); }
      return next;
    });
  }, [onCategoryFocus]);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
    onCategoryFocus?.(null);
  }, [onCategoryFocus]);

  return { expandedCategories, ...categoryHandlers, ...itemHandlers, toggleCategory, collapseAll };
}

function cloneCategories(contents: MenuContents): Category[] {
  return [...(contents.categories ?? [])];
}

function useCategoryHandlers(c: MenuContents, onChange: (v: MenuContents) => void, r: ReorderFns): CatPick {
  const handleAddCategory = useCallback(() => {
    const existing = c.categories ?? [];
    const cat: Category = { id: generateUniqueId('cat'), name: FM('onlineMenus.category'), items: [], displayOrder: existing.length, imageContentId: null, videoContentId: null };
    onChange({ ...c, categories: [...existing, cat] });
  }, [c, onChange]);

  const handleUpdateCategory = useCallback((i: number, updates: Partial<Category>) => {
    const cats = cloneCategories(c); cats[i] = { ...cats[i], ...updates };
    onChange({ ...c, categories: cats });
  }, [c, onChange]);

  const handleDeleteCategory = useCallback((i: number) => {
    const cats = cloneCategories(c); cats.splice(i, 1);
    onChange({ ...c, categories: cats });
  }, [c, onChange]);

  const handleMoveCategoryUp = useCallback((i: number) => {
    onChange({ ...c, categories: r.catUp(c.categories ?? [], i) });
  }, [c, onChange, r]);

  const handleMoveCategoryDown = useCallback((i: number) => {
    onChange({ ...c, categories: r.catDown(c.categories ?? [], i) });
  }, [c, onChange, r]);

  return { handleAddCategory, handleUpdateCategory, handleDeleteCategory, handleMoveCategoryUp, handleMoveCategoryDown };
}

type ItemCrudPick = Pick<UseMenuHandlersReturn, 'handleAddItem' | 'handleUpdateItem' | 'handleDeleteItem'>;
type ItemMovePick = Pick<UseMenuHandlersReturn, 'handleMoveItemUp' | 'handleMoveItemDown'>;

function useItemHandlers(c: MenuContents, onChange: (v: MenuContents) => void, maxItems: number, r: ReorderFns): ItemPick {
  const crud = useItemCrudHandlers(c, onChange, maxItems);
  const move = useItemMoveHandlers(c, onChange, r);
  return { ...crud, ...move };
}

function useItemCrudHandlers(c: MenuContents, onChange: (v: MenuContents) => void, maxItems: number): ItemCrudPick {
  const handleAddItem = useCallback((ci: number) => {
    const cats = cloneCategories(c);
    const cat = cats[ci];
    if (!isValueDefined(cat)) return;
    const existing = cat.items ?? [];
    if (existing.length >= maxItems) { notify('info', FM('settings.billing.featureGating.itemLimitReached')); return; }
    const item: MenuItem = { id: generateUniqueId('item'), name: FM('onlineMenus.item'), price: 0, isAvailable: true, displayOrder: existing.length, imageContentId: null, videoContentId: null, documentContentIds: [] };
    cats[ci] = { ...cat, items: [...existing, item] };
    onChange({ ...c, categories: cats });
  }, [c, onChange, maxItems]);

  const handleUpdateItem = useCallback((ci: number, ii: number, updates: Partial<MenuItem>) => {
    const cats = cloneCategories(c); const cat = cats[ci];
    if (!isValueDefined(cat)) return;
    const items = [...(cat.items ?? [])]; items[ii] = { ...items[ii], ...updates };
    cats[ci] = { ...cat, items }; onChange({ ...c, categories: cats });
  }, [c, onChange]);

  const handleDeleteItem = useCallback((ci: number, ii: number) => {
    const cats = cloneCategories(c); const cat = cats[ci];
    if (!isValueDefined(cat)) return;
    const items = [...(cat.items ?? [])]; items.splice(ii, 1);
    cats[ci] = { ...cat, items }; onChange({ ...c, categories: cats });
  }, [c, onChange]);

  return { handleAddItem, handleUpdateItem, handleDeleteItem };
}

function useItemMoveHandlers(c: MenuContents, onChange: (v: MenuContents) => void, r: ReorderFns): ItemMovePick {
  const handleMoveItemUp = useCallback((ci: number, ii: number) => {
    const cats = cloneCategories(c); const cat = cats[ci];
    if (!isValueDefined(cat)) return;
    cats[ci] = { ...cat, items: r.itemUp(cat.items ?? [], ii) };
    onChange({ ...c, categories: cats });
  }, [c, onChange, r]);

  const handleMoveItemDown = useCallback((ci: number, ii: number) => {
    const cats = cloneCategories(c); const cat = cats[ci];
    if (!isValueDefined(cat)) return;
    cats[ci] = { ...cat, items: r.itemDown(cat.items ?? [], ii) };
    onChange({ ...c, categories: cats });
  }, [c, onChange, r]);

  return { handleMoveItemUp, handleMoveItemDown };
}
