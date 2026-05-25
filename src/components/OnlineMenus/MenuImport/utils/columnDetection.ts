/**
 * Column detection utilities for menu import.
 * Auto-detects which file columns map to menu fields (category, item name, etc.)
 */
import {
  CATEGORY_ALIASES,
  DESCRIPTION_ALIASES,
  ITEM_NAME_ALIASES,
  PRICE_ALIASES,
} from './menuImportConstants';
import MenuField from '../../../../shared/enums/MenuField';

/** A mapping from file column index to a menu field. */
export interface ColumnMapping {
  columnIndex: number;
  columnHeader: string;
  field: MenuField;
}

/**
 * Detect menu field mappings from column headers.
 * Returns a mapping for each column, defaulting to Unmapped.
 */
export function detectColumnMappings(headers: string[]): ColumnMapping[] {
  const usedFields = new Set<MenuField>();

  return headers.map((header, index) => {
    const field = matchHeaderToField(header, usedFields);
    if (field !== MenuField.Unmapped)
      usedFields.add(field);

    return { columnIndex: index, columnHeader: header, field };
  });
}

/**
 * Match a single header string to a menu field.
 * Uses normalized comparison against known aliases.
 */
function matchHeaderToField(
  header: string,
  usedFields: Set<MenuField>,
): MenuField {
  const normalized = header.trim().toLowerCase();
  if (normalized === '') return MenuField.Unmapped;

  if (!usedFields.has(MenuField.Category) && matchesAnyAlias(normalized, CATEGORY_ALIASES))
    return MenuField.Category;

  if (!usedFields.has(MenuField.ItemName) && matchesAnyAlias(normalized, ITEM_NAME_ALIASES))
    return MenuField.ItemName;

  if (!usedFields.has(MenuField.Description) && matchesAnyAlias(normalized, DESCRIPTION_ALIASES))
    return MenuField.Description;

  if (!usedFields.has(MenuField.Price) && matchesAnyAlias(normalized, PRICE_ALIASES))
    return MenuField.Price;

  return MenuField.Unmapped;
}

function matchesAnyAlias(normalized: string, aliases: string[]): boolean {
  return aliases.some((alias) => normalized === alias);
}

/**
 * Extract a value from a row by field, using the column mappings.
 * Returns undefined if no column is mapped to the field.
 */
export function getValueByField(
  row: string[],
  mappings: ColumnMapping[],
  field: MenuField,
): string | undefined {
  const mapping = mappings.find((m) => m.field === field);
  if (!mapping) return undefined;
  return row[mapping.columnIndex]?.trim();
}
