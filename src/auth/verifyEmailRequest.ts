/**
 * Frontend `verify-email` URL helper for the BFF flow.
 *
 * The BFF's `POST /bff/register` and `POST /bff/resend-verification` endpoints
 * (TenantService + `Bff.AspNetCore` 1.2.5) require a `verifyUrlTemplate` — the
 * SPA-supplied URL the backend substitutes the verification token into when
 * building the outbound email link, e.g.
 *   `https://katalogos.dloizides.com/verify-email?token={token}`
 *
 * Mirrors {@link import('./forgotPasswordRequest').buildResetUrlTemplate} so
 * the two SPA-supplied templates share the same shape and fallback behaviour.
 */
import { isValueDefined } from '../utils/is';

const TOKEN_PLACEHOLDER = '{token}';

/**
 * Fallback origin used in SSR / test environments where `window.location` is
 * unavailable. Mirrors {@link forgotPasswordRequest}'s `FALLBACK_ORIGIN` so the
 * two helpers stay in lockstep.
 */
const FALLBACK_ORIGIN = 'http://localhost:8083';

function readWindowOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.location !== 'object') return null;
  if (typeof window.location.origin !== 'string') return null;
  return window.location.origin;
}

/**
 * Build the absolute verify-email URL for the current SPA host. Falls back to a
 * safe default in non-browser environments (SSR, tests) — the consumer should
 * never actually call into the BFF server-side, but the helper stays defensive
 * to match {@link forgotPasswordRequest.buildResetUrlTemplate}.
 */
export function buildVerifyUrlTemplate(origin?: string): string {
  const fromArg = isValueDefined(origin) && origin !== '' ? origin : null;
  const fromWindow = fromArg ?? readWindowOrigin();
  const safeOrigin = fromWindow ?? FALLBACK_ORIGIN;
  return `${safeOrigin}/verify-email?token=${TOKEN_PLACEHOLDER}`;
}
