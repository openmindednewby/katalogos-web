/**
 * Test IDs for GDPR-related components: cookie consent banner, privacy policy, terms of service.
 */

export const LegalTestIds = {
  // Cookie Consent Banner
  COOKIE_CONSENT_BANNER: 'cookie-consent-banner',
  COOKIE_CONSENT_ACCEPT_ALL: 'cookie-consent-accept-all',
  COOKIE_CONSENT_REJECT_ALL: 'cookie-consent-reject-all',
  COOKIE_CONSENT_CUSTOMIZE: 'cookie-consent-customize',
  COOKIE_CONSENT_SAVE_PREFERENCES: 'cookie-consent-save-preferences',
  COOKIE_CONSENT_ESSENTIAL_TOGGLE: 'cookie-consent-essential-toggle',
  COOKIE_CONSENT_ANALYTICS_TOGGLE: 'cookie-consent-analytics-toggle',
  COOKIE_CONSENT_MARKETING_TOGGLE: 'cookie-consent-marketing-toggle',
  COOKIE_CONSENT_PRIVACY_LINK: 'cookie-consent-privacy-link',

  // Privacy Policy Modal
  PRIVACY_POLICY_SCREEN: 'privacy-policy-screen',
  PRIVACY_POLICY_CLOSE: 'privacy-policy-close',

  // Terms of Service Modal
  TERMS_OF_SERVICE_SCREEN: 'terms-of-service-screen',
  TERMS_OF_SERVICE_CLOSE: 'terms-of-service-close',

  // Login Page Footer Links
  LOGIN_PRIVACY_LINK: 'login-privacy-link',
  LOGIN_TERMS_LINK: 'login-terms-link',
} as const;
