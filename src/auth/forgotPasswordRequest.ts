/**
 * Builds the SPA-supplied `resetUrlTemplate` for the BFF forgot-password flow.
 *
 * `bffAuthClient.forgotPassword` posts `{ email, resetUrlTemplate }` to
 * `/bff/forgot-password`, which the BFF proxies to TenantService. The validator
 * REQUIRES `resetUrlTemplate` — the URL the backend substitutes the token into
 * when building the email link
 * (e.g. `https://katalogos.dloizides.com/reset-password?token={token}`). The
 * request shape itself now comes from the shared `<ForgotPasswordFields>` /
 * `useForgotPasswordSubmit` in `@dloizides/auth-web`; this module only owns the
 * host-specific template string.
 */
import { isValueDefined } from '../utils/is';

const TOKEN_PLACEHOLDER = '{token}';

/**
 * Build the absolute reset URL for the current SPA host. Falls back to a safe
 * default in non-browser environments (SSR, tests) — the consumer should never
 * actually call `forgotPassword` server-side, but the helper stays defensive.
 */
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
