/**
 * Frontend `forgot-password` request shape for the BFF flow.
 *
 * `BffAuthClient.forgotPassword` posts to `/bff/forgot-password`, which the
 * BFF proxies to TenantService. The TenantService validator REQUIRES
 * `resetUrlTemplate` — the SPA-supplied URL the backend substitutes the token
 * into when building the email link
 * (e.g. `https://katalogos.dloizides.com/reset-password?token={token}`).
 *
 * `BffForgotPasswordRequest` already declares `resetUrlTemplate` as optional;
 * we narrow it to required here so callers get type-safety.
 */
import { isValueDefined } from '../utils/is';

import type { BffForgotPasswordRequest } from '@dloizides/auth-client';


export interface ForgotPasswordRequestWithUrl extends BffForgotPasswordRequest {
  /** Full URL with `{token}` placeholder. Backend substitutes the real token. */
  resetUrlTemplate: string;
}

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
