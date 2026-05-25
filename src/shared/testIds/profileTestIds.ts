/**
 * Test IDs for profile, security, and preferences settings screens.
 */

export const ProfileTestIds = {
  // Profile Settings
  PROFILE_SETTINGS_SCREEN: 'profile-settings-screen',
  PROFILE_SETTINGS_LOADING: 'profile-settings-loading',
  PROFILE_SETTINGS_ERROR: 'profile-settings-error',
  PROFILE_FIRST_NAME_INPUT: 'profile-first-name-input',
  PROFILE_LAST_NAME_INPUT: 'profile-last-name-input',
  PROFILE_EMAIL_INPUT: 'profile-email-input',
  PROFILE_PHONE_INPUT: 'profile-phone-input',
  PROFILE_ROLE_BADGE: 'profile-role-badge',
  PROFILE_TENANT_BADGE: 'profile-tenant-badge',
  PROFILE_SAVE_BUTTON: 'profile-save-button',

  // Security Settings
  SECURITY_SETTINGS_SCREEN: 'security-settings-screen',
  SECURITY_CURRENT_PASSWORD_INPUT: 'security-current-password-input',
  SECURITY_NEW_PASSWORD_INPUT: 'security-new-password-input',
  SECURITY_CONFIRM_PASSWORD_INPUT: 'security-confirm-password-input',
  SECURITY_CHANGE_PASSWORD_BUTTON: 'security-change-password-button',
  SECURITY_SETTINGS_LOADING: 'security-settings-loading',
  SECURITY_SETTINGS_ERROR: 'security-settings-error',
  SECURITY_SESSIONS_LIST: 'security-sessions-list',
  SECURITY_SESSION_ITEM: 'security-session-item',
  SECURITY_REVOKE_SESSION_BUTTON: 'security-revoke-session-button',

  // Settings Dropdown
  SETTINGS_DROPDOWN_BACKDROP: 'settings-dropdown-backdrop',

  // Preferences Settings
  PREFERENCES_SETTINGS_SCREEN: 'preferences-settings-screen',
  PREFERENCES_SETTINGS_LOADING: 'preferences-settings-loading',
  PREFERENCES_SETTINGS_ERROR: 'preferences-settings-error',
  PREFERENCES_LANGUAGE_DROPDOWN: 'preferences-language-dropdown',
  PREFERENCES_TIMEZONE_DROPDOWN: 'preferences-timezone-dropdown',
  PREFERENCES_DATE_FORMAT_DROPDOWN: 'preferences-date-format-dropdown',
  PREFERENCES_SAVE_BUTTON: 'preferences-save-button',
  PREFERENCES_RESET_TOOLTIPS_BUTTON: 'preferences-reset-tooltips-button',
} as const;
