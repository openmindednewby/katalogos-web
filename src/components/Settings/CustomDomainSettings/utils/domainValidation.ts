/**
 * Client-side domain name validation.
 * Validates format only; DNS resolution is done server-side.
 */

const MAX_DOMAIN_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;

/** Allowed characters per label: alphanumeric and hyphens. */
const LABEL_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

/**
 * Validates whether a string is a syntactically valid domain name.
 *
 * Rules:
 * - At least one dot separating labels
 * - No empty labels (no ".." or leading/trailing dots)
 * - Each label: starts and ends with alphanumeric, may contain hyphens
 * - Each label max 63 characters, total max 253
 * - No whitespace
 */
export function isValidDomain(domain: string): boolean {
  if (domain.length === 0) return false;
  if (domain.length > MAX_DOMAIN_LENGTH) return false;
  if (domain.includes(' ')) return false;

  // Must not start or end with a dot
  if (domain.startsWith('.') || domain.endsWith('.')) return false;

  const labels = domain.split('.');

  // Must have at least two labels (e.g., "example.com")
  const MIN_LABELS = 2;
  if (labels.length < MIN_LABELS) return false;

  return labels.every((label) => {
    if (label.length === 0) return false;
    if (label.length > MAX_LABEL_LENGTH) return false;
    return LABEL_PATTERN.test(label);
  });
}
