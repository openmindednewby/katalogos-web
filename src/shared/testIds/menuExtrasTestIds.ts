/**
 * Test IDs for menu import and bulk action controls.
 * Split from menuTestIds.ts to keep file sizes under 200 lines.
 */

export const MenuExtrasTestIds = {
  // Menu Import
  MENU_IMPORT_BUTTON: 'menu-import-button',
  MENU_IMPORT_MODAL: 'menu-import-modal',
  MENU_IMPORT_FILE_INPUT: 'menu-import-file-input',
  MENU_IMPORT_UPLOAD_AREA: 'menu-import-upload-area',
  MENU_IMPORT_COLUMN_SELECT: 'menu-import-column-select',
  MENU_IMPORT_NEXT_BUTTON: 'menu-import-next-button',
  MENU_IMPORT_BACK_BUTTON: 'menu-import-back-button',
  MENU_IMPORT_CONFIRM_BUTTON: 'menu-import-confirm-button',
  MENU_IMPORT_CANCEL_BUTTON: 'menu-import-cancel-button',
  MENU_IMPORT_PREVIEW_TABLE: 'menu-import-preview-table',
  MENU_IMPORT_ERROR: 'menu-import-error',
  MENU_IMPORT_SUMMARY: 'menu-import-summary',

  // Bulk Actions
  BULK_SELECT_BUTTON: 'bulk-select-button',
  BULK_ACTION_BAR: 'bulk-action-bar',
  BULK_SELECTION_COUNT: 'bulk-selection-count',
  BULK_DELETE_BUTTON: 'bulk-delete-button',
  BULK_MOVE_BUTTON: 'bulk-move-button',
  BULK_MOVE_CATEGORY_PICKER: 'bulk-move-category-picker',
  BULK_AVAILABILITY_AVAILABLE_BUTTON: 'bulk-availability-available-button',
  BULK_AVAILABILITY_UNAVAILABLE_BUTTON: 'bulk-availability-unavailable-button',
  BULK_PRICE_BUTTON: 'bulk-price-button',
  BULK_PRICE_AMOUNT_INPUT: 'bulk-price-amount-input',
  BULK_PRICE_APPLY_BUTTON: 'bulk-price-apply-button',
  BULK_CANCEL_BUTTON: 'bulk-cancel-button',
  BULK_SELECT_ALL_IN_CATEGORY: 'bulk-select-all-in-category',
  ITEM_SELECTION_CHECKBOX: 'item-selection-checkbox',
} as const;
