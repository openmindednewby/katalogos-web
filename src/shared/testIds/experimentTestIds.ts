/** Test IDs for A/B test experiment management. */
export const ExperimentTestIds = {
  // List Screen
  EXPERIMENT_LIST_SCREEN: 'experiment-list-screen',
  EXPERIMENT_LIST_LOADING: 'experiment-list-loading',
  EXPERIMENT_LIST_ERROR: 'experiment-list-error',
  EXPERIMENT_LIST_EMPTY: 'experiment-list-empty',
  EXPERIMENT_LIST_CREATE_BUTTON: 'experiment-list-create-button',

  // Experiment Card
  EXPERIMENT_CARD: 'experiment-card',
  EXPERIMENT_CARD_NAME: 'experiment-card-name',
  EXPERIMENT_CARD_STATUS: 'experiment-card-status',
  EXPERIMENT_CARD_MENU_NAME: 'experiment-card-menu-name',
  EXPERIMENT_CARD_VIEW_BUTTON: 'experiment-card-view-button',

  // Create Modal
  EXPERIMENT_CREATE_MODAL: 'experiment-create-modal',
  EXPERIMENT_CREATE_NAME_INPUT: 'experiment-create-name-input',
  EXPERIMENT_CREATE_MENU_SELECT: 'experiment-create-menu-select',
  EXPERIMENT_CREATE_SUBMIT_BUTTON: 'experiment-create-submit-button',
  EXPERIMENT_CREATE_CANCEL_BUTTON: 'experiment-create-cancel-button',

  // Detail View
  EXPERIMENT_DETAIL: 'experiment-detail',
  EXPERIMENT_DETAIL_LOADING: 'experiment-detail-loading',
  EXPERIMENT_DETAIL_START_BUTTON: 'experiment-detail-start-button',
  EXPERIMENT_DETAIL_STOP_BUTTON: 'experiment-detail-stop-button',
  EXPERIMENT_DETAIL_BACK_BUTTON: 'experiment-detail-back-button',
  EXPERIMENT_DETAIL_WINNER: 'experiment-detail-winner',

  // Metrics
  EXPERIMENT_METRICS: 'experiment-metrics',
  EXPERIMENT_METRICS_VARIANT_A: 'experiment-metrics-variant-a',
  EXPERIMENT_METRICS_VARIANT_B: 'experiment-metrics-variant-b',
  EXPERIMENT_METRICS_VIEWS_A: 'experiment-metrics-views-a',
  EXPERIMENT_METRICS_VIEWS_B: 'experiment-metrics-views-b',
  EXPERIMENT_METRICS_BAR_A: 'experiment-metrics-bar-a',
  EXPERIMENT_METRICS_BAR_B: 'experiment-metrics-bar-b',

  // Significance
  EXPERIMENT_SIGNIFICANCE: 'experiment-significance',

  // Status Badge
  EXPERIMENT_STATUS_BADGE: 'experiment-status-badge',
} as const;
