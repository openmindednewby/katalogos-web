/**
 * Test IDs for menu versioning features: version history panel,
 * version detail view, and version diff view.
 */

export const VersioningTestIds = {
  // Version History Panel
  VERSION_HISTORY_TAB: 'version-history-tab',
  VERSION_HISTORY_PANEL: 'version-history-panel',
  VERSION_LIST_ITEM: 'version-list-item',
  VERSION_CURRENT_BADGE: 'version-current-badge',
  VERSION_LOAD_MORE_BUTTON: 'version-load-more-button',
  VERSION_HISTORY_EMPTY: 'version-history-empty',
  VERSION_HISTORY_LOADING: 'version-history-loading',

  // Version Detail View
  VERSION_DETAIL_VIEW: 'version-detail-view',
  VERSION_DETAIL_BACK_BUTTON: 'version-detail-back-button',
  VERSION_RESTORE_BUTTON: 'version-restore-button',
  VERSION_COMPARE_BUTTON: 'version-compare-button',
  VERSION_SNAPSHOT_PREVIEW: 'version-snapshot-preview',

  // Restore Confirmation
  VERSION_RESTORE_CONFIRM_MODAL: 'version-restore-confirm-modal',
  VERSION_RESTORE_CONFIRM_BUTTON: 'version-restore-confirm-button',
  VERSION_RESTORE_CANCEL_BUTTON: 'version-restore-cancel-button',

  // Version Diff View
  VERSION_DIFF_VIEW: 'version-diff-view',
  VERSION_DIFF_BACK_BUTTON: 'version-diff-back-button',
  VERSION_DIFF_SUMMARY: 'version-diff-summary',
  VERSION_DIFF_ENTRY: 'version-diff-entry',
  VERSION_DIFF_EMPTY: 'version-diff-empty',

  // Version Summary
  VERSION_SUMMARY_SECTION: 'version-summary-section',
  VERSION_RAW_DATA_TOGGLE: 'version-raw-data-toggle',
} as const;
