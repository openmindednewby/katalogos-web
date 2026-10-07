import { sortCategoriesByDisplayOrder, sortMenuItemsByDisplayOrder } from '../../../../types/menuTypes';
import { isValueDefined } from '../../../../utils/is';

import type { MenuContents } from '../../../../types/menuTypes';

const CSV_HEADERS = ['Category', 'Item Name', 'Description', 'Price'];

const DECIMAL_PLACES = 2;

/** Escape a field value for CSV. */
export function escapeCsvField(value: string): string {
  const needsQuoting = value.includes('"') || value.includes(',') ||
    value.includes('\n') || value.includes('\r');
  if (needsQuoting)
    return `"${value.replace(/"/g, '""')}"`;

  return value;
}

/** Format menu contents as a CSV string. */
export function formatMenuCsv(contents: MenuContents | null | undefined): string {
  if (!isValueDefined(contents) || (contents.categories?.length ?? 0) === 0) return '';

  const sortedCategories = sortCategoriesByDisplayOrder(contents.categories);
  const rows: string[] = [CSV_HEADERS.join(',')];

  for (const category of sortedCategories) {
    const categoryName = category.name ?? '';
    const sortedItems = sortMenuItemsByDisplayOrder(category.items);

    for (const item of sortedItems) {
      const fields = [
        escapeCsvField(categoryName),
        escapeCsvField(item.name ?? ''),
        escapeCsvField(item.description ?? ''),
        String(item.price?.toFixed(DECIMAL_PLACES) ?? '0.00'),
      ];
      rows.push(fields.join(','));
    }
  }

  if (rows.length === 1) return '';

  return rows.join('\n');
}
