/**
 * Test IDs for custom domain settings screen,
 * domain verification, and DNS instructions.
 */

export const CustomDomainTestIds = {
  // Screen
  CUSTOM_DOMAIN_SCREEN: 'custom-domain-screen',
  CUSTOM_DOMAIN_LOADING: 'custom-domain-loading',
  CUSTOM_DOMAIN_ERROR: 'custom-domain-error',

  // Add Domain Form
  CUSTOM_DOMAIN_ADD_INPUT: 'custom-domain-add-input',
  CUSTOM_DOMAIN_ADD_BUTTON: 'custom-domain-add-button',
  CUSTOM_DOMAIN_VALIDATION_ERROR: 'custom-domain-validation-error',

  // Domain Status
  CUSTOM_DOMAIN_STATUS_BADGE: 'custom-domain-status-badge',

  // DNS Instructions
  CUSTOM_DOMAIN_CNAME_INSTRUCTION: 'custom-domain-cname-instruction',
  CUSTOM_DOMAIN_TXT_INSTRUCTION: 'custom-domain-txt-instruction',
  CUSTOM_DOMAIN_COPY_CNAME: 'custom-domain-copy-cname',
  CUSTOM_DOMAIN_COPY_TXT: 'custom-domain-copy-txt',

  // Actions
  CUSTOM_DOMAIN_REMOVE_BUTTON: 'custom-domain-remove-button',
  CUSTOM_DOMAIN_VERIFY_BUTTON: 'custom-domain-verify-button',
} as const;
