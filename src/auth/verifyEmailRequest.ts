import { isValueDefined } from '../utils/is';

const TOKEN_PLACEHOLDER = '{token}';

const FALLBACK_ORIGIN = 'http://localhost:8083';

function readWindowOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.location !== 'object') return null;
  if (typeof window.location.origin !== 'string') return null;
  return window.location.origin;
}

/** Build the absolute verify-email URL for the current SPA host. Falls back to a */
export function buildVerifyUrlTemplate(origin?: string): string {
  const fromArg = isValueDefined(origin) && origin !== '' ? origin : null;
  const fromWindow = fromArg ?? readWindowOrigin();
  const safeOrigin = fromWindow ?? FALLBACK_ORIGIN;
  return `${safeOrigin}/verify-email?token=${TOKEN_PLACEHOLDER}`;
}
