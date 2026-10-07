import type { AuthMethod } from './utils/AuthMethod';
import type { OtpType } from './utils/OtpType';

export { AuthMethod } from './utils/AuthMethod';
export { OtpType } from './utils/OtpType';

/**
 * User information returned from authentication
 */
export interface UserInfo {
  sub: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  preferredUsername?: string;
  roles?: string[];
  tenantId?: string;
  customClaims?: Record<string, unknown>;
}

/**
 * Login request parameters
 */
export interface LoginRequest {
  method: AuthMethod;
  username?: string;
  password?: string;
  phoneNumber?: string;
  email?: string;
  otpCode?: string;
  tenantId?: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  userInfo: UserInfo | null;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Send OTP request parameters
 */
export interface SendOtpRequest {
  type: OtpType;
  identifier: string;
  tenantId?: string;
}

/**
 * Send OTP response
 */
export interface SendOtpResponse {
  success: boolean;
  expiresIn: number;
  code?: string | null;
  smsSent: boolean;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Verify OTP request parameters
 */
export interface VerifyOtpRequest {
  identifier: string;
  code: string;
  tenantId?: string;
}

/**
 * Verify OTP response
 */
export interface VerifyOtpResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  userInfo: UserInfo | null;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Refresh token request parameters
 */
export interface RefreshRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  expiresIn: number;
  errorMessage?: string;
  errorCode?: string;
}

/** Register request parameters. */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName: string;
}

/**
 * Per-field validation error returned by the register endpoint on a 400.
 */
export interface RegisterErrorField {
  field: string;
  message: string;
}

/** Structured register error. */
export interface RegisterErrorShape {
  errorCode: string;
  message: string;
  fieldErrors: RegisterErrorField[];
}

/**
 * Logout request parameters
 */
export interface LogoutRequest {
  token: string;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean;
  errorMessage?: string | null;
}

/**
 * Get authentication methods response
 */
export interface GetAuthMethodsResponse {
  primaryMethod: AuthMethod;
  allowedMethods: AuthMethod[];
  otpCodeLength: number;
  otpExpiryMinutes: number;
  requireSmsVerification: boolean;
}

/**
 * Identity client configuration
 */
export interface IdentityClientConfig {
  baseUrl: string;
  timeout?: number;
  /** Keycloak realm name (e.g. "questioner", "onlinemenu"). */
  realm?: string;
}
