import axios, { type AxiosInstance } from 'axios';

import {
  handleLoginError,
  handleOtpError,
  handleVerifyError,
  handleRefreshError,
  handleLogoutError,
  handleRegisterError,
  createError,
} from './errorHandlers';
import { normalizeRegisterResponse } from './normalizeRegisterResponse';
import {
  AuthMethod,
  OtpType,
  type IdentityClientConfig,
  type LoginRequest,
  type LoginResponse,
  type SendOtpRequest,
  type SendOtpResponse,
  type VerifyOtpRequest,
  type VerifyOtpResponse,
  type RefreshRequest,
  type RefreshResponse,
  type LogoutRequest,
  type LogoutResponse,
  type GetAuthMethodsResponse,
  type RegisterRequest,
} from '../types';

/** Default HTTP timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * OnlineMenu Identity Client
 * Provides embedded authentication for React Native applications
 */
export class IdentityClient {
  private axios: AxiosInstance;
  private baseUrl: string;
  private realm: string | null;

  constructor(config: IdentityClientConfig) {
    this.baseUrl = config.baseUrl;
    const realmValue = typeof config.realm === 'string' && config.realm.length > 0 ? config.realm : null;
    this.realm = realmValue;
    const timeout = typeof config.timeout === 'number' ? config.timeout : DEFAULT_TIMEOUT_MS;
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    // Inject X-Realm at the axios-instance level so every outbound
    // call (including refresh + logout retries) carries it.
    if (typeof realmValue === 'string') baseHeaders['X-Realm'] = realmValue;
    this.axios = axios.create({
      baseURL: config.baseUrl,
      timeout,
      headers: baseHeaders,
    });
  }

  /**
   * Register a new user account and return an auto-issued token bundle.
   *
   * Posts to `/auth/register`. The X-Realm header is supplied by the
   * axios-instance default — it is set from the `realm` constructor arg.
   *
   * On non-2xx responses the method throws a `RegisterError` carrying the
   * server's `errorCode` + per-field validation errors so the UI can
   * highlight the offending input and show a localized message.
   *
   * The success response shape is identical to `loginWithPassword`. The
   * server contract uses `userInfo.id` instead of `userInfo.sub` — we
   * normalize that here so downstream consumers do not need to special-case
   * the register flow.
   */
  async register(body: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await this.axios.post<LoginResponse>('/auth/register', body);
      return normalizeRegisterResponse(response.data);
    } catch (error) {
      throw handleRegisterError(error);
    }
  }

  /**
   * Login with username and password
   */
  async loginWithPassword(
    username: string,
    password: string,
    tenantId?: string
  ): Promise<LoginResponse> {
    try {
      const request: LoginRequest = {
        method: AuthMethod.UsernamePassword,
        username,
        password,
        tenantId,
      };
      const response = await this.axios.post<LoginResponse>('/auth/login', request);
      return response.data;
    } catch (error) {
      return handleLoginError(error);
    }
  }

  /**
   * Login with phone OTP
   */
  async loginWithPhoneOtp(
    phoneNumber: string,
    otpCode: string,
    tenantId?: string
  ): Promise<LoginResponse> {
    try {
      const request: LoginRequest = {
        method: AuthMethod.PhoneOtp,
        phoneNumber,
        otpCode,
        tenantId,
      };
      const response = await this.axios.post<LoginResponse>('/auth/login', request);
      return response.data;
    } catch (error) {
      return handleLoginError(error);
    }
  }

  /**
   * Login with email OTP
   */
  async loginWithEmailOtp(
    email: string,
    otpCode: string,
    tenantId?: string
  ): Promise<LoginResponse> {
    try {
      const request: LoginRequest = {
        method: AuthMethod.EmailOtp,
        email,
        otpCode,
        tenantId,
      };
      const response = await this.axios.post<LoginResponse>('/auth/login', request);
      return response.data;
    } catch (error) {
      return handleLoginError(error);
    }
  }

  /**
   * Send OTP code to phone number via SMS
   */
  async sendPhoneOtp(phoneNumber: string, tenantId?: string): Promise<SendOtpResponse> {
    try {
      const request: SendOtpRequest = {
        type: OtpType.Sms,
        identifier: phoneNumber,
        tenantId,
      };
      const response = await this.axios.post<SendOtpResponse>('/auth/send-otp', request);
      return response.data;
    } catch (error) {
      return handleOtpError(error);
    }
  }

  /**
   * Send OTP code to email
   */
  async sendEmailOtp(email: string, tenantId?: string): Promise<SendOtpResponse> {
    try {
      const request: SendOtpRequest = {
        type: OtpType.Email,
        identifier: email,
        tenantId,
      };
      const response = await this.axios.post<SendOtpResponse>('/auth/send-otp', request);
      return response.data;
    } catch (error) {
      return handleOtpError(error);
    }
  }

  /**
   * Verify OTP code (alternative to loginWithPhoneOtp/loginWithEmailOtp)
   */
  async verifyOtp(
    identifier: string,
    code: string,
    tenantId?: string
  ): Promise<VerifyOtpResponse> {
    try {
      const request: VerifyOtpRequest = {
        identifier,
        code,
        tenantId,
      };
      const response = await this.axios.post<VerifyOtpResponse>('/auth/verify-otp', request);
      return response.data;
    } catch (error) {
      return handleVerifyError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const request: RefreshRequest = {
        refreshToken,
      };
      const response = await this.axios.post<RefreshResponse>('/auth/refresh', request);
      return response.data;
    } catch (error) {
      return handleRefreshError(error);
    }
  }

  /**
   * Logout and revoke access token
   */
  async logout(accessToken: string): Promise<LogoutResponse> {
    try {
      const request: LogoutRequest = {
        token: accessToken,
      };
      const response = await this.axios.post<LogoutResponse>('/auth/logout', request);
      return response.data;
    } catch (error) {
      return handleLogoutError(error);
    }
  }

  /**
   * Get available authentication methods for a tenant
   */
  async getAuthMethods(
    tenantId?: string,
    tenantSlug?: string
  ): Promise<GetAuthMethodsResponse> {
    try {
      const params: Record<string, string> = {};
      if (typeof tenantId === 'string' && tenantId !== '') params.tenantId = tenantId;
      if (typeof tenantSlug === 'string' && tenantSlug !== '') params.tenantSlug = tenantSlug;
      const response = await this.axios.get<GetAuthMethodsResponse>('/auth/methods', { params });
      return response.data;
    } catch (error) {
      throw createError(error);
    }
  }
}

