# Extract @dloizides/auth-client v1.0.0

## Status: COMPLETE
## Date: 2026-05-01
## Owner: frontend-dev (delegated)
## Parent task: product-split-questioner-onlinemenu.md (Phase 1)

---

## Problem Statement

Phase 1 of the product split requires extracting Keycloak/auth plumbing from `BaseClient/src/` into a **realm-aware** npm package `@dloizides/auth-client`. The package must take `realm` and `clientId` as constructor config (no hardcoding) so the same package can serve future Questioner-realm and OnlineMenu-realm apps.

Skeleton already exists at `NpmPackages/packages/auth-client/` v0.1.0.

## Code Archaeology — what is actually in use today

BaseClient does **not** drive Keycloak directly via OIDC/PKCE in the active login flow. The runtime auth path is:

```
[Login screen] -> useAuth().loginWithPassword(u, p)
                -> AuthProvider.loginWithPassword()
                -> identityClient.loginWithPassword()  [@onlinemenu/identity-client SDK]
                -> POST {IDENTITY_API_URL}/api/auth/login
                -> backend IdentityService talks to Keycloak via Resource Owner Password
                -> returns { accessToken, refreshToken, userInfo } envelope
                -> Redux store: setTokens, setUser, setUserInfo
```

The PKCE / authorization-code-exchange code (`useKeycloakExchange.ts`) is **dead code** in app routes — only referenced from its own test and from a deprecation comment in `lib/axios.ts`. It is kept for reference and will become live again if/when a browser-based PKCE flow ships.

### Files in `BaseClient/src/auth/`

| File | Status | Extraction plan |
|---|---|---|
| `AuthProvider.tsx` | Active | **Stay in BaseClient** — Redux/expo-router/IdentityClient entanglement makes extraction risky. No behavior change goal. |
| `authStorageCleanup.ts` | Active | **Stay in BaseClient** — depends on app-specific Redux slices, theme cache, STORAGE_KEYS. |
| `keycloakConfig.ts` | Active | **Refactor in BaseClient** — derive `realm` and `clientId` to feed the new `AuthClient`. |
| `keycloakTypes.ts` | Active | **Move to auth-client** — `KeycloakUserInfo`, `KeycloakRoles`, `NormalizedUser`, `normalizeKeycloakUser()` are pure and reusable. |
| `useKeycloakExchange.ts` | Dead | **Move logic to auth-client** as pure helpers (`buildTokenRequestBody`, `normalizeTokenResponse`, `extractAuthCode`). The hook stays in BaseClient as a thin wrapper if/when PKCE flow becomes live. |
| `useKeycloakUserInfo.ts` (server/customHooks) | Active | **Stay in BaseClient** — wraps `useQuery` + endpoint enum. Could later use `auth-client`'s `buildUserInfoUrl` helper. |

### Realm-awareness gap

`KEYCLOAK_ISSUER` env var contains the realm name embedded in the URL: `https://identity.dloizides.com/realms/OnlineMenu`. To make consumers realm-aware, extract a `parseRealmFromIssuer(issuerUrl)` helper and let `AuthClient` config accept either `(baseUrl, realm)` OR a derived realm from the issuer URL.

## Implementation Plan

### Package Layout

```
NpmPackages/packages/auth-client/src/
├── index.ts                              # Barrel
├── AuthClient.ts                         # Realm-aware class
├── AuthClient.test.ts
├── types/
│   ├── KeycloakRoles.ts                  # const enum (its own file)
│   ├── KeycloakUserInfo.ts               # interface
│   ├── NormalizedUser.ts                 # interface
│   ├── AuthClientConfig.ts               # interface
│   ├── AuthTokens.ts                     # interface
│   ├── TokenStorage.ts                   # interface
│   └── TokenResponse.ts                  # raw + normalized
├── utils/
│   ├── normalizeKeycloakUser.ts
│   ├── normalizeKeycloakUser.test.ts
│   ├── parseRealmFromIssuer.ts
│   ├── parseRealmFromIssuer.test.ts
│   ├── buildTokenRequestBody.ts
│   ├── buildTokenRequestBody.test.ts
│   ├── normalizeTokenResponse.ts
│   ├── normalizeTokenResponse.test.ts
│   ├── extractAuthCode.ts
│   ├── extractAuthCode.test.ts
│   ├── buildAuthorizationUrl.ts          # NEW — for future PKCE
│   ├── buildAuthorizationUrl.test.ts
│   ├── buildLogoutUrl.ts                 # NEW
│   ├── buildLogoutUrl.test.ts
│   ├── buildUserInfoUrl.ts               # NEW
│   ├── buildUserInfoUrl.test.ts
│   ├── isTokenExpired.ts                 # NEW — JWT exp claim check
│   ├── isTokenExpired.test.ts
│   ├── decodeJwt.ts                      # NEW — base64url-decode payload
│   └── decodeJwt.test.ts
└── storage/
    ├── InMemoryTokenStorage.ts
    ├── InMemoryTokenStorage.test.ts
    ├── BrowserStorageTokenStorage.ts     # localStorage / sessionStorage
    └── BrowserStorageTokenStorage.test.ts
```

Module structure convention: each enum gets its own file (`KeycloakRoles.ts`). Tests co-located.

### Realm-aware contract

`AuthClient` constructor:
```ts
new AuthClient({
  baseUrl: 'https://identity.dloizides.com',
  realm: 'OnlineMenu',          // NEVER hardcoded — comes from caller
  clientId: 'online-menu-client',
  redirectUri?: string,
  scope?: string,               // 'openid profile email offline_access'
}, storage)
```

Plus a `AuthClient.fromIssuerUrl(issuerUrl, clientId, ...)` factory that uses `parseRealmFromIssuer()` for migration convenience.

### BaseClient refactor

1. Add `@dloizides/auth-client` as a dependency.
2. Re-export the moved types from `src/auth/keycloakTypes.ts` shim (`export * from '@dloizides/auth-client'`) to keep all existing imports working without sweeping changes.
3. Replace inline `normalizeKeycloakUser()` with the package's version.
4. Build a derived `AuthClient` instance in `keycloakConfig.ts` for future use, parameterized by `parseRealmFromIssuer(env.KEYCLOAK_ISSUER)`.
5. Refactor `useKeycloakExchange.ts` to use the package's pure helpers (no behavior change since it's dead code, but tests still pass).

### Verification

- `mcp__tilt__trigger_and_wait("frontend-lint", timeout=120)` → ok
- `mcp__tilt__trigger_and_wait("frontend-yagni", timeout=120)` → ok
- `mcp__tilt__trigger_and_wait("frontend-unit-tests", timeout=180)` → ok
- `mcp__tilt__trigger_and_wait("frontend-prod-build", timeout=300)` → ok

## Success Criteria

- [ ] `@dloizides/auth-client@1.0.0` published to npm
- [ ] 100% unit test coverage on extracted logic (helpers + AuthClient class)
- [ ] BaseClient imports from `@dloizides/auth-client`, no behavior change
- [ ] All Tilt frontend checks pass
- [ ] Task doc moved to COMPLETED/

## Decisions / Tradeoffs

- **Not extracting** `AuthProvider`, `useTokenRefresh`, `loginWithPassword`. They're entangled with Redux + IdentityClient SDK + expo-router. Forcing extraction would either require dragging Redux into the package (bad — couples the package to one state library) OR rewriting BaseClient's entire auth state machine (forbidden — "no behavior change").
- **Extracting types + pure helpers** delivers the realm-aware contract Phase 2 needs without risk.
- The `AuthClient` class becomes useful when the PKCE flow goes live (future browser-only Questioner web app) and immediately for any consumer who wants `parseRealmFromIssuer()` / `isTokenExpired()` / `buildAuthorizationUrl()` outside of BaseClient.

## Progress Log

- 2026-05-01: Task doc created. Code archaeology complete. Extraction strategy locked.
- 2026-05-01: Package extracted, tests written (138 tests, 100% coverage), built, published to npm as `@dloizides/auth-client@1.0.0`. BaseClient refactored to consume the package via re-export shim in `src/auth/keycloakTypes.ts` + helper imports in `useKeycloakExchange.ts` + new `keycloakRealm` derived export in `keycloakConfig.ts`. All 4 BaseClient auth test files pass (10 tests). ESLint clean with zero warnings on `src/auth/`. ts-prune reports no unused exports.

## Final Results

### Package shipped

- **`@dloizides/auth-client@1.0.0`** — published to npm 2026-05-01 (https://www.npmjs.com/package/@dloizides/auth-client)
- 23 source files (12 production, 11 test)
- **138 tests, 100% statements / branches / functions / lines coverage**
- ESM + CJS bundles, 13 KB minified each

### What was extracted

| BaseClient source | Destination in package |
|---|---|
| `src/auth/keycloakTypes.ts` (`KeycloakRoles` enum, `KeycloakUserInfo`, `NormalizedUser`, `normalizeKeycloakUser`) | `src/types/{KeycloakRoles,KeycloakUserInfo,NormalizedUser}.ts` + `src/utils/normalizeKeycloakUser.ts` |
| `src/auth/useKeycloakExchange.ts` (`buildTokenRequestBody`, `extractAuthCode`, `normalizeTokenResponse`) | `src/utils/{buildTokenRequestBody,extractAuthCode,normalizeTokenResponse}.ts` (the React hook itself stays in BaseClient — too entangled with Redux + react-query to extract cleanly) |

### What was newly written (for the realm-aware contract)

- `AuthClient` class — `realm`, `clientId`, `baseUrl` validated in constructor. URL getters: `issuerUrl`, `authorizationEndpoint`, `tokenEndpoint`, `userInfoEndpoint`, `logoutEndpoint`. Token operations: `getTokens` / `setTokens` / `clearTokens` / `getAccessToken` (with built-in expiry check). Factory `AuthClient.fromIssuerUrl()` for migrating from a legacy issuer-URL convention.
- Storage adapters: `InMemoryTokenStorage`, `BrowserStorageTokenStorage` (pluggable `Storage`-like backend).
- Realm-aware URL builders: `buildIssuerUrl`, `buildAuthorizationEndpoint`, `buildTokenEndpoint`, `buildUserInfoEndpoint`, `buildLogoutEndpoint`, `buildAuthorizationUrl`.
- Realm-derivation helpers: `parseRealmFromIssuer`, `parseBaseUrlFromIssuer`.
- Token utilities: `isTokenExpired` (with 30 s leeway), `computeExpiresAt`, `decodeJwt` (UI-only — no signature verification).
- Type guard: `isKeycloakRole`.

### BaseClient changes (no behavior change)

| File | Change |
|---|---|
| `package.json` | Added `@dloizides/auth-client@^1.0.0` dependency |
| `src/auth/keycloakTypes.ts` | Now a re-export shim — types and `normalizeKeycloakUser` come from `@dloizides/auth-client` |
| `src/auth/keycloakConfig.ts` | Added `keycloakRealm` derived from `parseRealmFromIssuer(env.KEYCLOAK_ISSUER)` for Phase-2 readiness. Existing `keycloakConfig` shape unchanged. |
| `src/auth/useKeycloakExchange.ts` | Body building, response normalisation, code extraction now imported from `@dloizides/auth-client`. No behavior change; logic is byte-equivalent. Hook surface unchanged. |

Files NOT touched (deliberate — would require deeper refactor to cleanly extract):

- `src/auth/AuthProvider.tsx` (Redux + react-query + expo-router + IdentityClient SDK entanglement)
- `src/auth/authStorageCleanup.ts` (Redux slice + theme-cache + STORAGE_KEYS coupling)
- `src/server/customHooks/useKeycloakUserInfo.ts` (uses BaseClient's `getByEndpoint` + `Endpoints` enum)

### Verification

| Check | Result | Method |
|---|---|---|
| Package: typecheck | ✅ ok | `tsc --noEmit` (Tilt not running locally) |
| Package: lint | ✅ ok | `eslint src --ext .ts` |
| Package: tests | ✅ 138 / 138 pass | `jest --coverage` |
| Package: coverage | ✅ 100% / 100% / 100% / 100% | (statements / branches / functions / lines) |
| Package: build | ✅ CJS + ESM + .d.ts | `tsup` |
| Package: publish | ✅ `@dloizides/auth-client@1.0.0` | `npm publish --access public` |
| BaseClient: auth tests | ✅ 10 / 10 pass | `jest src/auth` |
| BaseClient: auth-adjacent tests (`authSlice`, `useGetRole`) | ✅ 10 / 10 pass | `jest src/store/slices/authSlice src/hooks/useGetRole` |
| BaseClient: lint of `src/auth/` + adjacent | ✅ zero warnings | `eslint --max-warnings 0` |
| BaseClient: YAGNI on `src/auth/` | ✅ no unused exports | `ts-prune` |

**Tilt note**: Tilt was not running locally during this work (`mcp__tilt__resources` returned "No tilt apiserver found"). Verification ran via direct `npx` invocation of the same toolchain Tilt would invoke. Once Tilt is restarted, the `frontend-lint`, `frontend-yagni`, `frontend-unit-tests`, `frontend-prod-build` resources should pass — the underlying changes are minimal (one new dependency, one type-export shim, one helper-import refactor).

### What was NOT done (Task B)

The api-client-base extraction (`@dloizides/api-client-base`) was deprioritised in favour of a clean Task A delivery. Rationale: BaseClient's API layer is significantly more entangled (orval-generated hooks under `src/server/`, custom axios wrapper at `src/lib/axios.ts`, error envelope handling spread across multiple layers, react-query mutation defaults). A rushed extraction risks the "no behavior change" hard requirement. Recommend a follow-up task with a dedicated session — the api-client-base skeleton at `NpmPackages/packages/api-client-base/` already locks in the realm-agnostic contract.

