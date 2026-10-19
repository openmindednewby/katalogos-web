import { resendVerificationEmail, verifyEmailToken } from './verifyEmailApi';
import { VerifyEmailErrorCode } from './verifyEmailErrorCode';
import { apiClient } from '../lib/api/apiClient';

import type { AxiosRequestConfig } from 'axios';

jest.mock('../lib/api/apiClient', () => ({ apiClient: { post: jest.fn() } }));

const postMock = apiClient.post as jest.Mock;

interface FakeResponse {
  status: number;
  data: unknown;
}

function fakeResponse(data: unknown, status = 200): FakeResponse {
  return { status, data };
}

function lastCall(): [string, Record<string, unknown>, AxiosRequestConfig] {
  return postMock.mock.calls[0] as [string, Record<string, unknown>, AxiosRequestConfig];
}

describe('verifyEmailApi', () => {
  afterEach(() => {
    postMock.mockReset();
  });

  describe('verifyEmailToken', () => {
    it('with a token, POSTs it to /bff/verify-email with credentials, CSRF header and no status rejection', async () => {
      postMock.mockResolvedValue(fakeResponse({ success: true }));

      await verifyEmailToken('abc123');

      const [url, body, config] = lastCall();
      const headers = config.headers as Record<string, string>;
      const acceptsEveryStatus = config.validateStatus?.(500) === true;
      expect(url).toBe('/bff/verify-email');
      expect(body).toEqual({ token: 'abc123' });
      expect(config.withCredentials).toBe(true);
      expect(headers['X-BFF-Csrf']).toBe('1');
      expect(headers['Content-Type']).toBe('application/json');
      expect(acceptsEveryStatus).toBe(true);
    });

    it('with a { success: true } body, resolves to success', async () => {
      postMock.mockResolvedValue(fakeResponse({ success: true }));

      const result = await verifyEmailToken('t');

      expect(result).toEqual({ success: true });
    });

    it('with known errorCode values, maps them onto VerifyEmailErrorCode entries', async () => {
      const codes: ReadonlyArray<[string, VerifyEmailErrorCode]> = [
        ['TOKEN_INVALID', VerifyEmailErrorCode.TokenInvalid],
        ['TOKEN_EXPIRED', VerifyEmailErrorCode.TokenExpired],
        ['TOKEN_USED', VerifyEmailErrorCode.TokenUsed],
        ['KEYCLOAK_UPDATE_FAILED', VerifyEmailErrorCode.KeycloakUpdateFailed],
      ];
      codes.forEach(([wire]) =>
        postMock.mockResolvedValueOnce(fakeResponse({ success: false, errorCode: wire }, 400)),
      );

      const results = await Promise.all(codes.map(async () => verifyEmailToken('t')));

      expect(results).toEqual(codes.map(([, errorCode]) => ({ success: false, errorCode })));
    });

    it('with an unknown errorCode string, collapses to Generic', async () => {
      postMock.mockResolvedValue(fakeResponse({ success: false, errorCode: 'WHO_KNOWS' }, 400));

      const result = await verifyEmailToken('t');

      expect(result).toEqual({ success: false, errorCode: VerifyEmailErrorCode.Generic });
    });

    it('with a non-object body, collapses to Generic', async () => {
      postMock.mockResolvedValue(fakeResponse(null));

      const result = await verifyEmailToken('t');

      expect(result).toEqual({ success: false, errorCode: VerifyEmailErrorCode.Generic });
    });

    it('with a network failure, collapses to Generic without throwing', async () => {
      postMock.mockRejectedValue(new Error('offline'));

      const result = await verifyEmailToken('t');

      expect(result).toEqual({ success: false, errorCode: VerifyEmailErrorCode.Generic });
    });
  });

  describe('resendVerificationEmail', () => {
    it('with an email, POSTs it to /bff/resend-verification with a verifyUrlTemplate', async () => {
      postMock.mockResolvedValue(fakeResponse({}));

      await resendVerificationEmail('user@example.com');

      const [url, body] = lastCall();
      expect(url).toBe('/bff/resend-verification');
      expect(body.email).toBe('user@example.com');
      expect(String(body.verifyUrlTemplate)).toContain('/verify-email?token={token}');
    });

    it('with a 2xx response, resolves true', async () => {
      postMock.mockResolvedValue(fakeResponse({}));

      const result = await resendVerificationEmail('a@b.c');

      expect(result).toBe(true);
    });

    it('with a non-2xx response, resolves false without throwing', async () => {
      postMock.mockResolvedValue(fakeResponse('', 500));

      const result = await resendVerificationEmail('a@b.c');

      expect(result).toBe(false);
    });

    it('with a network failure, resolves false without throwing', async () => {
      postMock.mockRejectedValue(new Error('offline'));

      const result = await resendVerificationEmail('a@b.c');

      expect(result).toBe(false);
    });
  });
});
