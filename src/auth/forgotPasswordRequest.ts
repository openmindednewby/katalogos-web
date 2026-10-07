import { isValueDefined } from '../utils/is';

const TOKEN_PLACEHOLDER = '{token}';

const FALLBACK_ORIGIN = 'http://localhost:8083';

function readWindowOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.location !== 'object') return null;
  if (typeof window.location.origin !== 'string') return null;
  return window.location.origin;
}

export function buildResetUrlTemplate(origin?: string): string {
  const fromArg = isValueDefined(origin) && origin !== '' ? origin : null;
  const fromWindow = fromArg ?? readWindowOrigin();
  const safeOrigin = fromWindow ?? FALLBACK_ORIGIN;
  return `${safeOrigin}/reset-password?token=${TOKEN_PLACEHOLDER}`;
}
