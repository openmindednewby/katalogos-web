/**
 * Unit tests for the verify-email + resend-verification BFF helpers.
 *
 * Focus is on logic: request shape (URL, method, headers, body), response
 * decoding (success / known errorCode / unknown errorCode / non-JSON / network
 * failure). Nothing UI-related lives here — the screen has its own narrow
 * presentational components.
 *
 * We hand-roll a `Response`-shaped mock instead of using the global `Response`
 * constructor because the Jest jsdom env in this app does not ship fetch
 * primitives; only the bits `verifyEmailApi` touches (`ok`, `json()`) need to
 * exist for the helpers to work.
 */
import { resendVerificationEmail, verifyEmailToken } from './verifyEmailApi';
import { VerifyEmailErrorCode } from './verifyEmailErrorCode';

const ORIGINAL_FETCH = globalThis.fetch;

type FetchMock = jest.Mock<Promise<unknown>, [RequestInfo | URL, RequestInit?]>;

function installFetchMock(mock: FetchMock): void {
  (globalThis as { fetch: typeof fetch }).fetch = mock as unknown as typeof fetch;
}

function restoreFetch(): void {
  (globalThis as { fetch: typeof fetch }).fetch = ORIGINAL_FETCH;
}

interface FakeResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

function fakeResponse(body: unknown, status = 200): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async (): Promise<unknown> => body,
  };
}

describe('verifyEmailApi', () => {
  afterEach(() => {
    restoreFetch();
  });

  describe('verifyEmailToken', () => {
    it('POSTs to /bff/verify-email with the CSRF header and token body', async () => {
      const mock: FetchMock = jest.fn().mockResolvedValue(fakeResponse({ success: true }));
      installFetchMock(mock);

      await verifyEmailToken('abc123');

      expect(mock).toHaveBeenCalledTimes(1);
      const [url, init] = mock.mock.calls[0];
      expect(url).toBe('/bff/verify-email');
      expect(init?.method).toBe('POST');
      expect(init?.credentials).toBe('include');
      const headers = init?.headers as Record<string, string>;
      expect(headers['X-BFF-Csrf']).toBe('1');
      expect(headers['Content-Type']).toBe('application/json');
      expect(init?.body).toBe(JSON.stringify({ token: 'abc123' }));
    });

    it('resolves to success on { success: true } body', async () => {
      installFetchMock(jest.fn().mockResolvedValue(fakeResponse({ success: true })));
      await expect(verifyEmailToken('t')).resolves.toEqual({ success: true });
    });

    it('maps known errorCode values onto VerifyEmailErrorCode entries', async () => {
      const codes: ReadonlyArray<[string, VerifyEmailErrorCode]> = [
        ['TOKEN_INVALID', VerifyEmailErrorCode.TokenInvalid],
        ['TOKEN_EXPIRED', VerifyEmailErrorCode.TokenExpired],
        ['TOKEN_USED', VerifyEmailErrorCode.TokenUsed],
        ['KEYCLOAK_UPDATE_FAILED', VerifyEmailErrorCode.KeycloakUpdateFailed],
      ];
      for (const [wire, expected] of codes) {
        installFetchMock(
          jest.fn().mockResolvedValue(fakeResponse({ success: false, errorCode: wire }, 400)),
        );
        await expect(verifyEmailToken('t')).resolves.toEqual({
          success: false,
          errorCode: expected,
        });
      }
    });

    it('collapses unknown errorCode strings to Generic', async () => {
      installFetchMock(
        jest.fn().mockResolvedValue(fakeResponse({ success: false, errorCode: 'WHO_KNOWS' }, 400)),
      );
      await expect(verifyEmailToken('t')).resolves.toEqual({
        success: false,
        errorCode: VerifyEmailErrorCode.Generic,
      });
    });

    it('collapses a non-object JSON body to Generic', async () => {
      installFetchMock(jest.fn().mockResolvedValue(fakeResponse(null)));
      await expect(verifyEmailToken('t')).resolves.toEqual({
        success: false,
        errorCode: VerifyEmailErrorCode.Generic,
      });
    });

    it('collapses a fetch rejection (network failure) to Generic without throwing', async () => {
      installFetchMock(jest.fn().mockRejectedValue(new Error('offline')));
      await expect(verifyEmailToken('t')).resolves.toEqual({
        success: false,
        errorCode: VerifyEmailErrorCode.Generic,
      });
    });
  });

  describe('resendVerificationEmail', () => {
    it('POSTs to /bff/resend-verification with the email + a verifyUrlTemplate', async () => {
      const mock: FetchMock = jest.fn().mockResolvedValue(fakeResponse({}));
      installFetchMock(mock);

      await resendVerificationEmail('user@example.com');

      expect(mock).toHaveBeenCalledTimes(1);
      const [url, init] = mock.mock.calls[0];
      expect(url).toBe('/bff/resend-verification');
      expect(init?.method).toBe('POST');
      const body = JSON.parse(String(init?.body ?? '{}')) as Record<string, string>;
      expect(body.email).toBe('user@example.com');
      expect(body.verifyUrlTemplate).toContain('/verify-email?token={token}');
    });

    it('resolves true on a 2xx response (anti-enum semantics)', async () => {
      installFetchMock(jest.fn().mockResolvedValue(fakeResponse({})));
      await expect(resendVerificationEmail('a@b.c')).resolves.toBe(true);
    });

    it('resolves false on a non-2xx response without throwing', async () => {
      installFetchMock(jest.fn().mockResolvedValue(fakeResponse('', 500)));
      await expect(resendVerificationEmail('a@b.c')).resolves.toBe(false);
    });

    it('resolves false on a network failure without throwing', async () => {
      installFetchMock(jest.fn().mockRejectedValue(new Error('offline')));
      await expect(resendVerificationEmail('a@b.c')).resolves.toBe(false);
    });
  });
});
