/**
 * Test IDs for billing settings, subscription management,
 * upgrade prompts, and watermark components.
 */

export const BillingTestIds = {
  // Billing Settings Screen
  BILLING_SETTINGS_SCREEN: 'billing-settings-screen',
  BILLING_SETTINGS_LOADING: 'billing-settings-loading',
  BILLING_SETTINGS_ERROR: 'billing-settings-error',

  // Current Plan Section
  BILLING_CURRENT_PLAN: 'billing-current-plan',
  BILLING_STATUS_BADGE: 'billing-status-badge',
  BILLING_TRIAL_COUNTDOWN: 'billing-trial-countdown',

  // Plan Comparison
  BILLING_PLAN_CARD: 'billing-plan-card',
  BILLING_PLAN_SELECT_BUTTON: 'billing-plan-select-button',
  BILLING_CYCLE_TOGGLE: 'billing-cycle-toggle',
  BILLING_CYCLE_MONTHLY: 'billing-cycle-monthly',
  BILLING_CYCLE_ANNUAL: 'billing-cycle-annual',

  // Actions
  BILLING_CANCEL_BUTTON: 'billing-cancel-button',
  BILLING_CANCEL_CONFIRM: 'billing-cancel-confirm',
  BILLING_CANCEL_DISMISS: 'billing-cancel-dismiss',
  BILLING_PORTAL_BUTTON: 'billing-portal-button',

  // Billing History
  BILLING_HISTORY_TABLE: 'billing-history-table',
  BILLING_HISTORY_ROW: 'billing-history-row',
  BILLING_HISTORY_EMPTY: 'billing-history-empty',
  BILLING_HISTORY_PREV_PAGE: 'billing-history-prev-page',
  BILLING_HISTORY_NEXT_PAGE: 'billing-history-next-page',

  // Upgrade Prompt
  UPGRADE_PROMPT: 'upgrade-prompt',
  UPGRADE_PROMPT_CTA: 'upgrade-prompt-cta',
  UPGRADE_PROMPT_DISMISS: 'upgrade-prompt-dismiss',

  // Watermark
  FREE_TIER_WATERMARK: 'free-tier-watermark',
} as const;
