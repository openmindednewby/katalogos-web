/**
 * Test IDs for GDPR privacy settings page.
 */

export const PrivacyTestIds = {
  // Privacy Settings Screen
  PRIVACY_SETTINGS_SCREEN: 'privacy-settings-screen',
  PRIVACY_SETTINGS_LOADING: 'privacy-settings-loading',
  PRIVACY_SETTINGS_ERROR: 'privacy-settings-error',

  // Consent Management
  CONSENT_SECTION: 'consent-section',
  CONSENT_ESSENTIAL_SWITCH: 'consent-essential-switch',
  CONSENT_ANALYTICS_SWITCH: 'consent-analytics-switch',
  CONSENT_MARKETING_SWITCH: 'consent-marketing-switch',

  // Data Export
  DATA_EXPORT_SECTION: 'data-export-section',
  DATA_EXPORT_REQUEST_BUTTON: 'data-export-request-button',
  DATA_EXPORT_STATUS: 'data-export-status',
  DATA_EXPORT_DOWNLOAD_BUTTON: 'data-export-download-button',

  // Account Deletion
  ACCOUNT_DELETION_SECTION: 'account-deletion-section',
  ACCOUNT_DELETION_REQUEST_BUTTON: 'account-deletion-request-button',
  ACCOUNT_DELETION_REASON_INPUT: 'account-deletion-reason-input',
  ACCOUNT_DELETION_CANCEL_BUTTON: 'account-deletion-cancel-button',
  ACCOUNT_DELETION_STATUS: 'account-deletion-status',
} as const;
