/** `errorCode` values surfaced by `POST /bff/verify-email` on a 400 response. */
export const enum VerifyEmailErrorCode {
  TokenInvalid = 'TOKEN_INVALID',
  TokenExpired = 'TOKEN_EXPIRED',
  TokenUsed = 'TOKEN_USED',
  KeycloakUpdateFailed = 'KEYCLOAK_UPDATE_FAILED',
  MissingToken = 'MISSING_TOKEN',
  Generic = 'GENERIC',
}
