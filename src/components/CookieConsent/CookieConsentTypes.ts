/**
 * Types for the GDPR cookie consent system.
 */

/** Current version of the consent schema. Bump when consent categories change. */
export const CONSENT_VERSION = '1.0';

/** Shape of the consent record persisted in localStorage. */
export interface CookieConsent {
  /** Always true -- essential cookies cannot be disabled. */
  necessary: true;
  /** Whether the user opted in to analytics cookies. */
  analytics: boolean;
  /** Whether the user opted in to marketing cookies. */
  marketing: boolean;
  /** ISO-8601 timestamp of when consent was given. */
  consentedAt: string;
  /** Schema version that was active when consent was captured. */
  version: string;
}
