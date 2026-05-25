/**
 * Direct same-origin BFF wiring for the verify-email + resend-verification
 * endpoints.
 *
 * Why not `@dloizides/auth-client`? These two endpoints are app-owned UX (the
 * SPA renders a verify landing page + a resend form); they are one-shot and
 * have no shared-component story across other consumers, so adding typed
 * methods to the SDK would inflate its surface for a single same-origin POST
 * per endpoint. Direct `fetch` with the CSRF header keeps the surface in the
 * app where it lives.
 *
 * Both endpoints are guarded by `Bff.AspNetCore`'s same-origin + CSRF check —
 * the `X-BFF-Csrf` header is required for every state-changing `/bff/*` call.
 */
import { VerifyEmailErrorCode } from './verifyEmailErrorCode';
import { buildVerifyUrlTemplate } from './verifyEmailRequest';
import { isValueDefined } from '../utils/is';

/** Result of a verify-email POST — `success: true` or a localized errorCode. */
export type VerifyEmailResult =
  | { success: true }
  | { success: false; errorCode: VerifyEmailErrorCode };

const CSRF_HEADER_NAME = 'X-BFF-Csrf';
const CSRF_HEADER_VALUE = '1';
const JSON_CONTENT_TYPE = 'application/json';
const VERIFY_ENDPOINT = '/bff/verify-email';
const RESEND_ENDPOINT = '/bff/resend-verification';

/** Codes the BFF actually returns (subset of {@link VerifyEmailErrorCode}). */
const SERVER_ERROR_CODES: readonly string[] = [
  VerifyEmailErrorCode.TokenInvalid,
  VerifyEmailErrorCode.TokenExpired,
  VerifyEmailErrorCode.TokenUsed,
  VerifyEmailErrorCode.KeycloakUpdateFailed,
];

function isServerErrorCode(value: unknown): value is VerifyEmailErrorCode {
  if (typeof value !== 'string') return false;
  return SERVER_ERROR_CODES.includes(value);
}

function buildHeaders(): HeadersInit {
  return { 'Content-Type': JSON_CONTENT_TYPE, [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object') return false;
  return isValueDefined(value);
}

/**
 * Decode a parsed JSON body onto a {@link VerifyEmailResult}. The body's
 * runtime shape is `unknown` (whatever the BFF returned); we narrow defensively
 * and collapse everything we don't recognise to `Generic` so the caller never
 * has to interpret arbitrary wire bags.
 */
function decodeVerifyResponse(body: unknown): VerifyEmailResult {
  if (!isRecord(body)) return { success: false, errorCode: VerifyEmailErrorCode.Generic };
  if (body.success === true) return { success: true };
  const code = body.errorCode;
  if (isServerErrorCode(code)) return { success: false, errorCode: code };
  return { success: false, errorCode: VerifyEmailErrorCode.Generic };
}

/**
 * POST `/bff/verify-email` with the given token. Resolves to a typed result;
 * never throws — network / unexpected-shape failures collapse to `Generic` so
 * the UI can show the catch-all copy without a try/catch at every call site.
 */
export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  try {
    const res = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ token }),
    });
    const body: unknown = await res.json();
    return decodeVerifyResponse(body);
  } catch {
    return { success: false, errorCode: VerifyEmailErrorCode.Generic };
  }
}

/**
 * POST `/bff/resend-verification` with the given email. The BFF is anti-enum
 * so it returns 200 unconditionally; we resolve to `true` on any 2xx and
 * `false` only on network failure (which the UI surfaces as a generic error).
 * `verifyUrlTemplate` is supplied here so the helper is self-contained.
 */
export async function resendVerificationEmail(email: string): Promise<boolean> {
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ email, verifyUrlTemplate: buildVerifyUrlTemplate() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
