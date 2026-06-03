/**
 * Constants for the menu import feature.
 */
import { StyleSheet } from 'react-native';

// =============================================================================
// File Parsing
// =============================================================================

/** Maximum number of rows allowed in a single import file */
export const MAX_IMPORT_ROWS = 500;

/** Accepted file extensions for import */
export const ACCEPTED_FILE_TYPES = '.csv,.xlsx';

/** Number of sample rows to show for column mapping */
export const SAMPLE_ROW_COUNT = 3;

// =============================================================================
// Column Detection - Known Aliases
// =============================================================================

/** Aliases for the Category column (all lowercase for matching) */
export const CATEGORY_ALIASES = [
  'category', 'categories', 'cat', 'group', 'section',
  'menu category', 'menu section', 'type', 'food type',
];

/** Aliases for the Item Name column (all lowercase for matching) */
export const ITEM_NAME_ALIASES = [
  'item', 'item name', 'name', 'dish', 'dish name', 'food',
  'food name', 'product', 'product name', 'menu item',
];

/** Aliases for the Description column (all lowercase for matching) */
export const DESCRIPTION_ALIASES = [
  'description', 'desc', 'details', 'info', 'notes',
  'item description', 'food description',
];

/** Aliases for the Price column (all lowercase for matching) */
export const PRICE_ALIASES = [
  'price', 'cost', 'amount', 'rate', 'item price',
  'menu price', 'unit price', 'sell price',
];

// =============================================================================
// UI Constants
// =============================================================================

export { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';
export const ERROR_ROW_COLOR = '#FFEBEE';
export const ERROR_TEXT_COLOR = '#C62828';
export const WARNING_ROW_COLOR = '#FFF3E0';
export const WARNING_TEXT_COLOR = '#E65100';
export const VALID_ROW_COLOR = '#E8F5E9';

// =============================================================================
// Shared Styles
// =============================================================================

export const sharedImportStyles = StyleSheet.create({
  stepTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  stepDescription: { fontSize: 14, marginBottom: 16, opacity: 0.7 },
  tableHeader: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1 },
  tableHeaderCell: { flex: 1, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  tableCell: { flex: 1, fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
