
const MAX_DOMAIN_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;

const LABEL_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

/** Validates whether a string is a syntactically valid domain name. */
export function isValidDomain(domain: string): boolean {
  if (domain.length === 0) return false;
  if (domain.length > MAX_DOMAIN_LENGTH) return false;
  if (domain.includes(' ')) return false;

  if (domain.startsWith('.') || domain.endsWith('.')) return false;

  const labels = domain.split('.');

  const MIN_LABELS = 2;
  if (labels.length < MIN_LABELS) return false;

  return labels.every((label) => {
    if (label.length === 0) return false;
    if (label.length > MAX_LABEL_LENGTH) return false;
    return LABEL_PATTERN.test(label);
  });
}
