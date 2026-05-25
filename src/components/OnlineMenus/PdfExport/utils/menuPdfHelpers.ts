/**
 * Pure formatting helpers for menu PDF export.
 * Transforms menu data into structured sections ready for PDF rendering.
 */

import { isValueDefined } from '../../../../utils/is';
import { CURRENCY_SYMBOL } from '../../Display/utils/menuItemDisplayStyles';

import type { Category, MenuItem, MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

const MAX_FILENAME_LENGTH = 50;
const PRICE_DECIMALS = 2;

// =============================================================================
// Types
// =============================================================================

/** A single item row ready for PDF rendering. */
export interface PdfItemRow {
  name: string;
  description: string;
  price: string;
  tags: string[];
  isFeatured: boolean;
  isUnavailable: boolean;
  variants: PdfVariantRow[];
}

/** A variant row for an item. */
export interface PdfVariantRow {
  groupName: string;
  options: string;
}

/** A category section for the PDF. */
export interface PdfCategorySection {
  title: string;
  description: string;
  items: PdfItemRow[];
}

/** Full PDF data structure. */
export interface PdfMenuData {
  menuName: string;
  restaurantName: string;
  categories: PdfCategorySection[];
}

// =============================================================================
// Helpers
// =============================================================================

/** Formats a price as "$X.XX". Returns empty string for zero/undefined. */
export function formatPdfPrice(price: number | undefined): string {
  if (!isValueDefined(price)) return '';
  return `${CURRENCY_SYMBOL}${price.toFixed(PRICE_DECIMALS)}`;
}

/** Sanitizes a string for use as a filename. */
export function sanitizePdfFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, MAX_FILENAME_LENGTH);
}

/** Extracts variant info from a menu item into display rows. */
export function extractVariantRows(item: MenuItem): PdfVariantRow[] {
  const groups = item.variantGroups;
  if (!groups || groups.length === 0) return [];

  return groups
    .filter((g) => (g.variants ?? []).length > 0)
    .map((g) => {
      const options = (g.variants ?? [])
        .filter((v) => v.isAvailable !== false)
        .map((v) => `${v.name} (${formatPdfPrice(v.price)})`)
        .join(', ');
      return { groupName: g.name, options };
    });
}

/** Converts a single MenuItem into a PdfItemRow. */
export function buildItemRow(item: MenuItem): PdfItemRow {
  return {
    name: item.name ?? '',
    description: item.description ?? '',
    price: formatPdfPrice(item.price),
    tags: item.tags ?? [],
    isFeatured: item.isFeatured === true,
    isUnavailable: item.isAvailable === false,
    variants: extractVariantRows(item),
  };
}

/** Converts a Category into a PdfCategorySection. */
export function buildCategorySection(category: Category): PdfCategorySection {
  const items = (category.items ?? [])
    .filter((item) => item.isAvailable !== false)
    .map(buildItemRow);

  return {
    title: category.name ?? '',
    description: category.description ?? '',
    items,
  };
}

/** Builds the full PDF data from menu contents. */
export function buildPdfMenuData(
  menuName: string,
  restaurantName: string,
  contents: MenuContents | null | undefined,
): PdfMenuData {
  const categories = (contents?.categories ?? [])
    .map(buildCategorySection)
    .filter((section) => section.items.length > 0);

  return { menuName, restaurantName, categories };
}
