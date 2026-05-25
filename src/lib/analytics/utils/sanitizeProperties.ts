import { REDACTED_VALUE, SENSITIVE_PROPERTY_PATTERNS } from '../constants';

import type { EventProperties } from '../types';

/** Strips sensitive keys from event properties before sending to analytics providers. */
export function sanitizeProperties(properties?: EventProperties): EventProperties | undefined {
  if (!properties) return undefined;

  const sanitized: EventProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    const isSensitive = SENSITIVE_PROPERTY_PATTERNS.some((p) => key.toLowerCase().includes(p));
    sanitized[key] = isSensitive ? REDACTED_VALUE : value;
  }
  return sanitized;
}
