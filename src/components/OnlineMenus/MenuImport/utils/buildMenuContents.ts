/**
 * Build MenuContents from validated import rows.
 * Groups items by category and assigns display orders.
 */
import { generateUniqueId } from '../../../../types/menuTypes';

import type { ValidatedRow } from './validateMenuRows';
import type { Category, MenuContents, MenuItem } from '../../../../types/menuTypes';

export interface ImportSummary {
  itemCount: number;
  categoryCount: number;
  skippedCount: number;
}

/**
 * Build a MenuContents object from validated rows.
 * Only includes rows that passed validation (isValid === true).
 * Merges into existing contents if provided.
 */
export function buildMenuContents(
  validatedRows: ValidatedRow[],
  existingContents?: MenuContents | null,
): { contents: MenuContents; summary: ImportSummary } {
  const validRows = validatedRows.filter((r) => r.isValid);
  const skippedCount = validatedRows.length - validRows.length;
  const categoryMap = groupRowsByCategory(validRows);

  const existingCategories = existingContents?.categories ?? [];
  const existingCategoryMap = buildExistingCategoryMap(existingCategories);
  const newCategories = mergeCategories(categoryMap, existingCategoryMap, existingCategories.length);

  const allCategories = [...existingCategories, ...newCategories];
  let newItemCount = 0;

  for (const cat of newCategories)
    newItemCount += cat.items?.length ?? 0;

  return {
    contents: { ...existingContents, categories: allCategories },
    summary: {
      itemCount: newItemCount,
      categoryCount: newCategories.length,
      skippedCount,
    },
  };
}

function groupRowsByCategory(rows: ValidatedRow[]): Map<string, ValidatedRow[]> {
  const map = new Map<string, ValidatedRow[]>();

  for (const row of rows) {
    const key = row.category;
    const existing = map.get(key);
    if (existing)
      existing.push(row);
    else
      map.set(key, [row]);
  }

  return map;
}

function buildExistingCategoryMap(categories: Category[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const cat of categories)
    map.set(cat.name.toLowerCase(), true);

  return map;
}

function createMenuItem(row: ValidatedRow, itemIndex: number): MenuItem {
  return {
    id: generateUniqueId('item'),
    name: row.itemName,
    description: row.description !== '' ? row.description : undefined,
    price: row.price,
    isAvailable: true,
    displayOrder: itemIndex,
    imageContentId: null,
    videoContentId: null,
    documentContentIds: [],
  };
}

function createCategory(name: string, rows: ValidatedRow[], order: number): Category {
  return {
    id: generateUniqueId('cat'),
    name,
    items: rows.map((row, idx) => createMenuItem(row, idx)),
    displayOrder: order,
    imageContentId: null,
    videoContentId: null,
  };
}

function mergeCategories(
  categoryMap: Map<string, ValidatedRow[]>,
  existingNames: Map<string, boolean>,
  startOrder: number,
): Category[] {
  const newCategories: Category[] = [];
  let orderIndex = startOrder;

  for (const [categoryName, rows] of categoryMap) {
    if (existingNames.has(categoryName.toLowerCase())) continue;
    newCategories.push(createCategory(categoryName, rows, orderIndex));
    orderIndex += 1;
  }

  return newCategories;
}
