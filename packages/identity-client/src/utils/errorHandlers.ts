import axios from 'axios';

import type {
  LoginResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  RefreshResponse,
  LogoutResponse,
  RegisterErrorField,
  RegisterErrorShape,
} from '../types';

const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';

/**
 * Server-side register error envelope.
 *
 * 400: { errorCode, errors: [{ field, message }] }
 * 409: { errorCode: "USERNAME_TAKEN" | "EMAIL_TAKEN", message }
 * 422: { errorCode: "REALM_REQUIRED" | "REALM_INVALID", message }
 */
interface RegisterErrorEnvelope {
  errorCode?: string;
  message?: string;
  errors?: RegisterErrorField[];
}

/**
 * Structured Error subclass thrown by `IdentityClient.register`.
 *
 * Carries the parsed envelope so the UI can map `errorCode` → a localized
 * message and decorate inputs from `fieldErrors`.
 */
export class RegisterError extends Error implements RegisterErrorShape {
  public readonly errorCode: string;
  public readonly fieldErrors: RegisterErrorField[];

  constructor(shape: RegisterErrorShape) {
    super(shape.message);
    this.name = 'RegisterError';
    this.errorCode = shape.errorCode;
    this.fieldErrors = shape.fieldErrors;
    // Restore prototype chain after super() — required for `instanceof` to
    // work across the compiled CJS boundary in some bundlers.
    Object.setPrototypeOf(this, RegisterError.prototype);
  }
}

/**
 * Handle login errors
 */
export function handleLoginError(error: unknown): LoginResponse {
  if (axios.isAxiosError<LoginResponse>(error)) 
    if (error.response?.data) 
      return error.response.data;
    
  

  return {
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresIn: 0,
    userInfo: null,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    errorCode: 'NETWORK_ERROR',
  };
}

/**
 * Handle send OTP errors
 */
export function handleOtpError(error: unknown): SendOtpResponse {
  if (axios.isAxiosError<SendOtpResponse>(error)) 
    if (error.response?.data) 
      return error.response.data;
    
  

  return {
    success: false,
    expiresIn: 0,
    smsSent: false,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    errorCode: 'NETWORK_ERROR',
  };
}

/**
 * Handle verify OTP errors
 */
export function handleVerifyError(error: unknown): VerifyOtpResponse {
  if (axios.isAxiosError<VerifyOtpResponse>(error)) 
    if (error.response?.data) 
      return error.response.data;
    
  

  return {
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresIn: 0,
    userInfo: null,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    errorCode: 'NETWORK_ERROR',
  };
}

/**
 * Handle refresh token errors
 */
export function handleRefreshError(error: unknown): RefreshResponse {
  if (axios.isAxiosError<RefreshResponse>(error)) 
    if (error.response?.data) 
      return error.response.data;
    
  

  return {
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresIn: 0,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
    errorCode: 'NETWORK_ERROR',
  };
}

/**
 * Handle logout errors
 */
export function handleLogoutError(error: unknown): LogoutResponse {
  if (axios.isAxiosError<LogoutResponse>(error)) 
    if (error.response?.data) 
      return error.response.data;
    
  

  return {
    success: false,
    errorMessage: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * Build a `RegisterError` from an axios error response or a network failure.
 */
export function handleRegisterError(error: unknown): RegisterError {
  if (axios.isAxiosError<RegisterErrorEnvelope>(error)) {
    const data = error.response?.data;
    if (data) {
      const errorCode = typeof data.errorCode === 'string' && data.errorCode !== '' ? data.errorCode : UNKNOWN_ERROR_CODE;
      const message = typeof data.message === 'string' && data.message !== '' ? data.message : error.message;
      const fieldErrors = Array.isArray(data.errors) ? data.errors : [];
      return new RegisterError({ errorCode, message, fieldErrors });
    }
  }

  const fallbackMessage = error instanceof Error ? error.message : 'Network error';
  return new RegisterError({
    errorCode: NETWORK_ERROR_CODE,
    message: fallbackMessage,
    fieldErrors: [],
  });
}

/**
 * Create error from axios error
 */
export function createError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const hasResponseData = typeof error.response?.data !== 'undefined';
    const message = hasResponseData ? JSON.stringify(error.response?.data) : error.message;
    return new Error(message);
  }
  return error instanceof Error ? error : new Error('Unknown error');
}
