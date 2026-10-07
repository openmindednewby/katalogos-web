/** The login-method identifiers advertised by `GET /bff/config` (lower-cased), */
export const enum BffLoginMethod {
  Password = 'password',
  Otp = 'otp',
  Pin = 'pin',
  Passkey = 'passkey',
}
