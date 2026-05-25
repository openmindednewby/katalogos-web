/**
 * Hook and pure helpers for bulk operations on menu items.
 * All helpers are pure functions for easy unit testing.
 */
import { useCallback } from 'react';

import { BulkPriceMode } from '../../../shared/enums/BulkPriceMode';
import { isValueDefined } from '../../../utils/is';

import type { MenuContents, Category, MenuItem } from '../../../types/menuTypes';

const PRICE_ROUNDING_FACTOR = 100;
const PERCENTAGE_DIVISOR = 100;

interface UseBulkActionsParams {
  currentContents: MenuContents;
  onChange: (contents: MenuContents) => void;
  selectedItemIds: Set<string>;
  exitSelectionMode: () => void;
}

interface UseBulkActionsReturn {
  bulkDelete: () => void;
  bulkMove: (targetCategoryIndex: number) => void;
  bulkSetAvailability: (isAvailable: boolean) => void;
  bulkPriceAdjust: (mode: BulkPriceMode, amount: number) => void;
}

function getItemId(item: MenuItem): string {
  return String(item.id ?? '');
}

function filterItemsFromCategory(category: Category, ids: Set<string>): Category {
  const filtered = (category.items ?? []).filter((item) => !ids.has(getItemId(item)));
  return { ...category, items: filtered };
}

/** Remove selected items from all categories. */
export function applyBulkDelete(contents: MenuContents, ids: Set<string>): MenuContents {
  const categories = (contents.categories ?? []).map((cat) => filterItemsFromCategory(cat, ids));
  return { ...contents, categories };
}

/** Move selected items from their source categories to the target category. */
export function applyBulkMove(contents: MenuContents, ids: Set<string>, targetCategoryIndex: number): MenuContents {
  const movedItems: MenuItem[] = [];
  const stripped = (contents.categories ?? []).map((cat) => {
    const kept = (cat.items ?? []).filter((item) => {
      if (ids.has(getItemId(item))) {
        movedItems.push(item);
        return false;
      }
      return true;
    });
    return { ...cat, items: kept };
  });

  const target = stripped[targetCategoryIndex];
  if (!isValueDefined(target)) return contents;

  stripped[targetCategoryIndex] = { ...target, items: [...target.items, ...movedItems] };
  return { ...contents, categories: stripped };
}

/** Set availability flag on all selected items. */
export function applyBulkSetAvailability(
  contents: MenuContents,
  ids: Set<string>,
  isAvailable: boolean,
): MenuContents {
  const categories = (contents.categories ?? []).map((cat) => {
    const items = (cat.items ?? []).map((item) => {
      if (ids.has(getItemId(item))) return { ...item, isAvailable };
      return item;
    });
    return { ...cat, items };
  });
  return { ...contents, categories };
}

function adjustItemPrice(item: MenuItem, mode: BulkPriceMode, amount: number): MenuItem {
  const currentPrice = Number(item.price);
  const safePrice = Number.isNaN(currentPrice) ? 0 : currentPrice;
  const newPrice = mode === BulkPriceMode.Fixed
    ? safePrice + amount
    : safePrice * (1 + amount / PERCENTAGE_DIVISOR);
  const clampedPrice = Math.max(0, newPrice);
  const roundedPrice = Math.round(clampedPrice * PRICE_ROUNDING_FACTOR) / PRICE_ROUNDING_FACTOR;
  return { ...item, price: roundedPrice };
}

/** Adjust price of selected items by fixed amount or percentage. */
export function applyBulkPriceAdjust(
  contents: MenuContents,
  ids: Set<string>,
  mode: BulkPriceMode,
  amount: number,
): MenuContents {
  const categories = (contents.categories ?? []).map((cat) => {
    const items = (cat.items ?? []).map((item) => {
      if (!ids.has(getItemId(item))) return item;
      return adjustItemPrice(item, mode, amount);
    });
    return { ...cat, items };
  });
  return { ...contents, categories };
}

export function useBulkActions({
  currentContents, onChange, selectedItemIds, exitSelectionMode,
}: UseBulkActionsParams): UseBulkActionsReturn {
  const bulkDelete = useCallback(() => {
    onChange(applyBulkDelete(currentContents, selectedItemIds));
    exitSelectionMode();
  }, [currentContents, onChange, selectedItemIds, exitSelectionMode]);

  const bulkMove = useCallback((targetCategoryIndex: number) => {
    onChange(applyBulkMove(currentContents, selectedItemIds, targetCategoryIndex));
    exitSelectionMode();
  }, [currentContents, onChange, selectedItemIds, exitSelectionMode]);

  const bulkSetAvailability = useCallback((isAvailable: boolean) => {
    onChange(applyBulkSetAvailability(currentContents, selectedItemIds, isAvailable));
    exitSelectionMode();
  }, [currentContents, onChange, selectedItemIds, exitSelectionMode]);

  const bulkPriceAdjust = useCallback((mode: BulkPriceMode, amount: number) => {
    onChange(applyBulkPriceAdjust(currentContents, selectedItemIds, mode, amount));
    exitSelectionMode();
  }, [currentContents, onChange, selectedItemIds, exitSelectionMode]);

  return { bulkDelete, bulkMove, bulkSetAvailability, bulkPriceAdjust };
}
