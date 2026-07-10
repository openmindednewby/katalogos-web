/**
 * Test IDs for menu editor features: bulk actions, featured items,
 * translation manager, and modifier groups.
 * Split from menuTestIds.ts to keep file sizes under 200 lines.
 */

export const MenuEditorTestIds = {
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

  // Featured / Staff Picks
  FEATURED_SECTION: 'featured-section',
  FEATURED_SECTION_TITLE: 'featured-section-title',
  FEATURED_ITEM_CARD: 'featured-item-card',
  FEATURED_ITEM_BADGE: 'featured-item-badge',
  FEATURED_ITEM_STAFF_NOTE: 'featured-item-staff-note',
  FEATURED_ITEM_CONTROLS: 'featured-item-controls',
  FEATURED_ITEM_CONTROLS_TOGGLE: 'featured-item-controls-toggle',
  FEATURED_ITEM_CONTROLS_NOTE_INPUT: 'featured-item-controls-note-input',
  FEATURED_ITEM_CONTROLS_ORDER_INPUT: 'featured-item-controls-order-input',
  FEATURED_SECTION_SETTINGS: 'featured-section-settings',
  FEATURED_SECTION_ENABLED_TOGGLE: 'featured-section-enabled-toggle',
  FEATURED_SECTION_TITLE_INPUT: 'featured-section-title-input',

  // Translation Manager
  TRANSLATION_MANAGER_TAB: 'translation-manager-tab',
  TRANSLATION_STATUS_ROW: 'translation-status-row',
  TRANSLATE_ALL_BUTTON: 'translate-all-button',
  TRANSLATION_EDIT_BUTTON: 'translation-edit-button',
  TRANSLATION_DELETE_BUTTON: 'translation-delete-button',
  TRANSLATION_EDIT_MODAL: 'translation-edit-modal',
  TRANSLATION_EDIT_SAVE: 'translation-edit-save',
  TRANSLATION_EDIT_CANCEL: 'translation-edit-cancel',
  LANGUAGE_SWITCHER: 'language-switcher',
  LANGUAGE_SWITCHER_OPTION: 'language-switcher-option',

  // Modifier Groups
  MODIFIER_GROUP_SECTION: 'modifier-group-section',
  MODIFIER_GROUP_ADD_BUTTON: 'modifier-group-add-button',
  MODIFIER_GROUP_NAME_INPUT: 'modifier-group-name-input',
  MODIFIER_GROUP_DELETE_BUTTON: 'modifier-group-delete-button',
  MODIFIER_GROUP_REQUIRED_TOGGLE: 'modifier-group-required-toggle',
  MODIFIER_ADD_BUTTON: 'modifier-add-button',
  MODIFIER_NAME_INPUT: 'modifier-name-input',
  MODIFIER_PRICE_INPUT: 'modifier-price-input',
  MODIFIER_DELETE_BUTTON: 'modifier-delete-button',
  MODIFIER_AVAILABLE_TOGGLE: 'modifier-available-toggle',

  // Undo/Redo
  MENU_EDITOR_UNDO_BUTTON: 'menu-editor-undo-button',
  MENU_EDITOR_REDO_BUTTON: 'menu-editor-redo-button',
  MENU_EDITOR_UNDO_REDO_BAR: 'menu-editor-undo-redo-bar',

  // PDF Export
  MENU_EXPORT_PDF_BUTTON: 'menu-export-pdf-button',

  // Auto-Save
  AUTO_SAVE_INDICATOR: 'auto-save-indicator',
  AUTO_SAVE_DOT: 'auto-save-dot',
  AUTO_SAVE_STATUS_TEXT: 'auto-save-status-text',
  AUTO_SAVE_CONTAINER: 'auto-save-container',

  // Collapsible Item Editor Sections
  ITEM_SECTION_BASIC: 'item-section-basic',
  ITEM_SECTION_NUTRITION: 'item-section-nutrition',
  ITEM_SECTION_VARIANTS_MODIFIERS: 'item-section-variants-modifiers',
  ITEM_SECTION_ADVANCED: 'item-section-advanced',

  // Desktop two-pane editor
  MENU_EDITOR_LIVE_PANE: 'menu-editor-live-pane',

  // Category Overflow Menu
  CATEGORY_OVERFLOW_BUTTON: 'category-overflow-button',
  CATEGORY_OVERFLOW_MENU: 'category-overflow-menu',
  CATEGORY_OVERFLOW_BACKDROP: 'category-overflow-backdrop',
} as const;
