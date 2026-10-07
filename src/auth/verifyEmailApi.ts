import { VerifyEmailErrorCode } from './verifyEmailErrorCode';
import { buildVerifyUrlTemplate } from './verifyEmailRequest';
import { isValueDefined } from '../utils/is';

type VerifyEmailResult =
  | { success: true }
  | { success: false; errorCode: VerifyEmailErrorCode };

const CSRF_HEADER_NAME = 'X-BFF-Csrf';
const CSRF_HEADER_VALUE = '1';
const JSON_CONTENT_TYPE = 'application/json';
const VERIFY_ENDPOINT = '/bff/verify-email';
const RESEND_ENDPOINT = '/bff/resend-verification';

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

function decodeVerifyResponse(body: unknown): VerifyEmailResult {
  if (!isRecord(body)) return { success: false, errorCode: VerifyEmailErrorCode.Generic };
  if (body.success === true) return { success: true };
  const code = body.errorCode;
  if (isServerErrorCode(code)) return { success: false, errorCode: code };
  return { success: false, errorCode: VerifyEmailErrorCode.Generic };
}

/** POST `/bff/verify-email` with the given token. Resolves to a typed result; */
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

/** POST `/bff/resend-verification` with the given email. The BFF is anti-enum */
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
