/**
 * The login-method identifiers advertised by `GET /bff/config` (lower-cased),
 * unified-login Increment 3 Batch 3.
 *
 * `bff-katalogos` returns the enabled methods as a `string[]` (e.g.
 * `["password","otp","pin","passkey"]`). This enum gives the surface code a
 * typed, single source of truth for the values it tests
 * `config.methods.includes(...)` against, instead of bare string literals.
 */
export const enum BffLoginMethod {
  Password = 'password',
  Otp = 'otp',
  Pin = 'pin',
  Passkey = 'passkey',
}
