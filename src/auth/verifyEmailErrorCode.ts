/**
 * `errorCode` values surfaced by `POST /bff/verify-email` on a 400 response.
 *
 * The BFF returns four codes; `MissingToken` and `Generic` are client-only
 * additions for the SPA's three landing-page failure modes that don't have a
 * server round-trip (no `token` query param, and any unexpected wire shape).
 *
 * Lives in its own file because exported enums each get a dedicated module —
 * see CLAUDE.md "ESLint & Code Quality Rules".
 */
export const enum VerifyEmailErrorCode {
  TokenInvalid = 'TOKEN_INVALID',
  TokenExpired = 'TOKEN_EXPIRED',
  TokenUsed = 'TOKEN_USED',
  KeycloakUpdateFailed = 'KEYCLOAK_UPDATE_FAILED',
  MissingToken = 'MISSING_TOKEN',
  Generic = 'GENERIC',
}
