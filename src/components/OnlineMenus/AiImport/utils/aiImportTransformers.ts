/**
 * Transformers for converting AI-imported data to MenuContents format.
 */
import { DEFAULT_ITEM_PRICE } from './aiImportConstants';

import type { ImportedCategory, ImportedItem, ImportedMenuData } from '../../../../types/aiImportTypes';
import type { Category, MenuContents, MenuItem } from '../../../../types/menuTypes';

let nextItemId = 1;

function resetIdCounter(): void {
  nextItemId = 1;
}

function generateItemId(): string {
  const id = `ai-item-${nextItemId}`;
  nextItemId += 1;
  return id;
}

function generateCategoryId(index: number): string {
  return `ai-cat-${index}`;
}

/** Convert a single AI-extracted item to a MenuItem. */
export function transformImportedItem(item: ImportedItem, displayOrder: number): MenuItem {
  return {
    name: item.name,
    description: item.description ?? '',
    price: item.price ?? DEFAULT_ITEM_PRICE,
    id: generateItemId(),
    displayOrder,
    isAvailable: true,
  };
}

/** Convert a single AI-extracted category to a Category. */
export function transformImportedCategory(
  imported: ImportedCategory,
  categoryIndex: number,
): Category {
  const items = imported.items.map((item, itemIndex) =>
    transformImportedItem(item, itemIndex),
  );

  return {
    name: imported.name,
    id: generateCategoryId(categoryIndex),
    displayOrder: categoryIndex,
    items,
  };
}

/** Convert full AI import response to MenuContents. */
export function transformImportedDataToContents(
  data: ImportedMenuData,
): MenuContents {
  resetIdCounter();
  const categories = data.categories.map((cat, index) =>
    transformImportedCategory(cat, index),
  );

  return { categories };
}

/** Merge imported MenuContents with existing MenuContents. */
export function mergeMenuContents(
  existing: MenuContents,
  imported: MenuContents,
): MenuContents {
  const existingCategories = existing.categories ?? [];
  const importedCategories = imported.categories ?? [];

  const startOrder = existingCategories.length;
  const reorderedImported = importedCategories.map((cat, index) => ({
    ...cat,
    displayOrder: startOrder + index,
  }));

  return {
    ...existing,
    categories: [...existingCategories, ...reorderedImported],
  };
}

/** Count total items across all categories. */
export function countTotalItems(data: ImportedMenuData): number {
  return data.categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0,
  );
}
