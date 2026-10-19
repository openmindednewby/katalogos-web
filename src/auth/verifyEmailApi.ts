import { VerifyEmailErrorCode } from './verifyEmailErrorCode';
import { buildVerifyUrlTemplate } from './verifyEmailRequest';
import { apiClient } from '../lib/api/apiClient';
import { isValueDefined } from '../utils/is';

import type { AxiosRequestConfig } from 'axios';

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

const HTTP_OK_MIN = 200;
const HTTP_OK_MAX_EXCLUSIVE = 300;

function buildRequestConfig(): AxiosRequestConfig {
  return {
    withCredentials: true,
    headers: { 'Content-Type': JSON_CONTENT_TYPE, [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE },
    validateStatus: () => true,
  };
}

function isOkStatus(status: number): boolean {
  return status >= HTTP_OK_MIN && status < HTTP_OK_MAX_EXCLUSIVE;
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
    const res = await apiClient.post<unknown>(VERIFY_ENDPOINT, { token }, buildRequestConfig());
    return decodeVerifyResponse(res.data);
  } catch {
    return { success: false, errorCode: VerifyEmailErrorCode.Generic };
  }
}

/** POST `/bff/resend-verification` with the given email. The BFF is anti-enum */
export async function resendVerificationEmail(email: string): Promise<boolean> {
  try {
    const res = await apiClient.post<unknown>(
      RESEND_ENDPOINT,
      { email, verifyUrlTemplate: buildVerifyUrlTemplate() },
      buildRequestConfig(),
    );
    return isOkStatus(res.status);
  } catch {
    return false;
  }
}
