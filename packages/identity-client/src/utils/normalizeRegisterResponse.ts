import type { LoginResponse, UserInfo } from '../types';

/**
 * Normalize register response: server uses `userInfo.id`, downstream uses `sub`.
 *
 * The register endpoint returns `userInfo.id` while the rest of the auth
 * surface (login, refresh, verifyOtp) returns `userInfo.sub`. Downstream
 * consumers (AuthProvider, KeycloakUserInfo) all read `sub`, so we alias
 * `id → sub` when `sub` is absent. No-op when `sub` is already set.
 *
 * Implemented without type assertions: we treat the server payload as a
 * loose record-of-strings and rebuild a typed `UserInfo` from it.
 */

type RawUserInfo = Record<string, unknown>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

function readStringField(record: RawUserInfo, key: string): string | undefined {
  const value = record[key];
  return isNonEmptyString(value) ? value : undefined;
}

function reconstructUserInfo(record: RawUserInfo, sub: string): UserInfo {
  const reconstructed: UserInfo = { sub };
  const username = readStringField(record, 'username');
  if (typeof username === 'string') reconstructed.username = username;
  const email = readStringField(record, 'email');
  if (typeof email === 'string') reconstructed.email = email;
  const name = readStringField(record, 'name');
  if (typeof name === 'string') reconstructed.name = name;
  const givenName = readStringField(record, 'givenName');
  if (typeof givenName === 'string') reconstructed.givenName = givenName;
  const familyName = readStringField(record, 'familyName');
  if (typeof familyName === 'string') reconstructed.familyName = familyName;
  const tenantId = readStringField(record, 'tenantId');
  if (typeof tenantId === 'string') reconstructed.tenantId = tenantId;
  const roles = record['roles'];
  if (Array.isArray(roles)) reconstructed.roles = roles.filter(isNonEmptyString);
  return reconstructed;
}

export function normalizeRegisterResponse(raw: LoginResponse): LoginResponse {
  const info: UserInfo | null = raw.userInfo;
  if (!info) return raw;
  const record: RawUserInfo = { ...info };
  const existingSub = readStringField(record, 'sub');
  if (typeof existingSub === 'string') return raw;
  const aliasedSub = readStringField(record, 'id');
  if (typeof aliasedSub !== 'string') return raw;
  return {
    ...raw,
    userInfo: reconstructUserInfo(record, aliasedSub),
  };
}
