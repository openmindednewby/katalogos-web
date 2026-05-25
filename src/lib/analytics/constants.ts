/** Keys whose values must be stripped before sending to analytics providers. */
export const SENSITIVE_PROPERTY_PATTERNS = [
  'password',
  'token',
  'secret',
  'apikey',
  'creditcard',
  'email',
  'phone',
] as const;

/** Replacement value for redacted properties. */
export const REDACTED_VALUE = '[REDACTED]';

/** Analytics context label used in LoggingService entries. */
export const ANALYTICS_LOG_CONTEXT = 'analytics';
