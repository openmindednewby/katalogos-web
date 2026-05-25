/**
 * JSON formatting for menu data export.
 * Produces a structured JSON string with categories and items hierarchy.
 */
import { sortCategoriesByDisplayOrder, sortMenuItemsByDisplayOrder } from '../../../../types/menuTypes';

import type { Category, MenuContents } from '../../../../types/menuTypes';

/** Exported item shape for JSON output. */
export interface ExportedItem {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  dietaryTags: string[];
}

/** Exported category shape for JSON output. */
export interface ExportedCategory {
  name: string;
  description: string;
  displayOrder: number;
  items: ExportedItem[];
}

/** Top-level JSON export shape. */
export interface MenuJsonExport {
  exportDate: string;
  categoryCount: number;
  itemCount: number;
  categories: ExportedCategory[];
}

const DEFAULT_ORDER = 0;
const JSON_INDENT = 2;

/** Convert a single category and its items to the export shape. */
function mapCategory(category: Category): ExportedCategory {
  const sortedItems = sortMenuItemsByDisplayOrder(category.items);
  const items: ExportedItem[] = sortedItems.map((item) => ({
    name: item.name ?? '',
    description: item.description ?? '',
    price: item.price ?? 0,
    isAvailable: item.isAvailable ?? true,
    dietaryTags: item.tags ?? [],
  }));

  return {
    name: category.name ?? '',
    description: category.description ?? '',
    displayOrder: category.displayOrder ?? DEFAULT_ORDER,
    items,
  };
}

/**
 * Format menu contents as a structured JSON string.
 * Returns empty string if there are no categories or items.
 */
export function formatMenuJson(contents: MenuContents | null | undefined): string {
  if ((contents?.categories?.length ?? 0) === 0) return '';

  const sortedCategories = sortCategoriesByDisplayOrder(contents?.categories);
  const categories = sortedCategories.map(mapCategory);
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  if (totalItems === 0) return '';

  const exportData: MenuJsonExport = {
    exportDate: new Date().toISOString(),
    categoryCount: categories.length,
    itemCount: totalItems,
    categories,
  };

  return JSON.stringify(exportData, null, JSON_INDENT);
}
