# Auth Shared Package — Extend `@dloizides/auth-client`

## Status: COMPLETED

## Problem Statement
We have four consumers of authentication that each need: persistent sessions, silent token refresh, inactivity enforcement, sessions list/revoke, password reset, and login/logout flows:
- `BaseClient/` (legacy RN/Expo, current mobile)
- `apps/erevna-web/` (web)
- `apps/katalogos-web/` (web)
- Future mobile app (post Phase 6 cutover)

Without a shared package, each consumer reinvents the same auth machinery — and worse, makes incompatible storage/security choices. The package `@dloizides/auth-client` already exists with PKCE + refresh + `BrowserStorageTokenStorage` + `InMemoryTokenStorage`. It needs to be extended into the **single source of truth** for all four consumers, with platform-specific adapters and the missing pieces (cookie-based web storage, mobile SecureStore, biometric gate, inactivity tracker, sessions hooks, password-reset hooks).

## Goal
After this task ships, every product in the portfolio uses one auth library, configured per-platform via adapters. Adding a fifth product or a new mobile app means picking the right adapter and going.

## Approach

### Phase 1: Audit current `@dloizides/auth-client` surface
- [x] Document existing public API: `AuthClient`, storage interface, hooks, types.
- [x] Identify gaps vs. what mobile + web tasks need.
- [x] Confirm package boundaries: this stays a **client-side** package (no Node-only deps) so it works in RN, web, and SSR.

#### v1 Audit Results
- **Public surface (v1.0.0):** `AuthClient` class (config + URL builders + token storage proxy), `TokenStorage` interface, `BrowserStorageTokenStorage` + `InMemoryTokenStorage` adapters, pure URL/body builders, `extractAuthCode`, `normalizeTokenResponse`, `tokenResponseToAuthTokens`, `isTokenExpired`, `computeExpiresAt`, `decodeJwt`, `normalizeKeycloakUser`, `parseRealmFromIssuer`, `parseBaseUrlFromIssuer`, all types + `KeycloakRoles` enum. No event emitter. No interceptor. No login/logout methods. No hooks. No mobile/secure adapters. No biometric. No inactivity tracker.
- **Gaps for v2:** `CookieTokenStorage`, `SecureStoreTokenStorage`, `BiometricGate`, `RefreshInterceptor`, `InactivityTracker`, React Query hooks (forgot/reset password, sessions, revoke, logout-everywhere), high-level `AuthClient` orchestration methods (`loginWithOtp`, `loginWithPassword`, `logout`, `requestPasswordReset`, `confirmPasswordReset`), session-expired event emitter.
- **Constraints to preserve:** Jest 100% coverage threshold, ESLint strict rules (return types required, no `any`, eqeqeq), peer-dep approach for `expo-*` and `react`/`@tanstack/react-query`, `noUncheckedIndexedAccess` strict TS.

### Phase 2: Add web cookie storage adapter
- [x] New `CookieTokenStorage` class implementing the same `TokenStorage` interface.
- [x] On the web, the access token lives in memory only; the refresh token lives in an `httpOnly` + `Secure` + `SameSite=Lax` cookie set by the backend (see backend task).
- [x] `CookieTokenStorage` is essentially a no-op for refresh-token reads/writes (the browser handles it) — keeps in-memory access token; consumer hits `/auth/refresh-cookie` to swap.
- [x] Refresh interceptor calls `/auth/refresh-cookie` with `credentials: 'include'` (via `AuthApiClient.refreshCookie()` and `RefreshInterceptor`); backend reads cookie, returns new access token, rotates refresh cookie.

### Phase 3: Add mobile SecureStore adapter
- [x] New `SecureStoreTokenStorage` class. Peer-dependency on `expo-secure-store`.
- [x] Stores access + refresh + id + expiresAt tokens (4 slots so OS-level ACL on the refresh slot can be tightened independently). Adapter uses an injected `SecureStoreLike` interface so the package itself never imports `expo-secure-store`.
- [x] Constructor option `requireAuthentication: boolean` — when true, OS biometric prompt is required to read access/refresh slots (id slot stays unprotected since it's non-sensitive).
- [x] Storage key namespace (`auth.access`, `auth.refresh`, `auth.id`, `auth.expiresAt`). `keyPrefix` configurable.

### Phase 4: Add biometric gate (mobile)
- [x] New `BiometricGate` utility wrapping `expo-local-authentication` via injected `LocalAuthLike` interface.
- [x] `isAvailable()`, `prompt()`, `setEnabled(boolean)`, `unlock()`, `hydrate()`, `resetFailures()` API.
- [x] When enabled (and wired into `SecureStoreTokenStorage`), `BiometricGate.unlock()` is called before reading from secure store.
- [x] On 3 consecutive prompt failures (configurable via `maxFailures`), throws "locked out" → consumer navigates to login. Failure counter resets on success.

### Phase 5: Add refresh interceptor + single-flight queue
- [x] Dedicated `RefreshInterceptor` decoupled from `AuthClient` — pluggable via `RefreshFn`.
- [x] Single-flight: parallel calls during an in-flight refresh share the same promise.
- [x] On refresh failure: clear storage, emit `sessionExpired` event for consumers to navigate to login. Emits exactly once per failure even when N waiters joined.
- [x] Pluggable: takes a `RefreshFn` callback so it works with native fetch, axios, ky, and supports both mobile (`/auth/refresh`) and web (`/auth/refresh-cookie`).

### Phase 6: Add inactivity tracker
- [x] New `InactivityTracker` utility with configurable `maxInactivityDays` (default 90).
- [x] `markActive(timestamp?)` writes lastRefreshedAt via pluggable `InactivityStore`. `RefreshInterceptor.onRefreshSuccess` callback wires it.
- [x] On `AuthClient.init()`, if `now - lastRefreshedAt > maxInactivityDays`, clear tokens + tracker and emit `sessionExpired`.

### Phase 7: Add password-reset hooks
- [x] `useForgotPassword()` and `useResetPassword()` React Query mutation hooks under `@dloizides/auth-client/react`.
- [x] Same hooks usable in RN and web (React Query is platform-agnostic).

### Phase 8: Add sessions hooks
- [x] `useSessions()` query hook wrapping `GET /me/sessions` with exported `SESSIONS_QUERY_KEY` for invalidation.
- [x] `useRevokeSession()` mutation; auto-invalidates sessions query.
- [x] `useLogoutEverywhere()` mutation calling `AuthClient.logout({ everywhere: true })`; auto-invalidates sessions query.

### Phase 9: Login/logout client API
- [x] Higher-level methods on `AuthClient`:
  - `loginWithOtp({ email, otp, tenantId?, offlineAccess? })`
  - `loginWithPassword({ email, password, tenantId?, offlineAccess? })`
  - `logout({ everywhere? })`
  - `requestPasswordReset({ email, tenantId? })`
  - `confirmPasswordReset({ token, newPassword })`
  - `init()`, `refresh()`, `on('sessionExpired', listener)`
- [x] `buildAuthorizationUrl({ offlineAccess: true })` adds `offline_access` to the scope idempotently.
- [x] Each login method orchestrates: HTTP call → normalize tokens → persist → mark inactivity-active. Logout clears both storage + tracker even on server error.

### Phase 10: Documentation
- [x] README rewrite covering all adapters, configuration, hooks, lifecycle events, and architecture decisions.
- [x] Migration notes from v1 → v2 (v1 surface fully preserved; collaborators are opt-in).

### Phase 11: Tests
- [x] Unit tests for every new class + hook. 290 tests total.
- [x] Adapter-level tests: `CookieTokenStorage`, `SecureStoreTokenStorage` (with biometric gate wiring), `BiometricGate` (3-strikes lockout, hydrate-once, resetFailures).
- [x] Refresh interceptor: success, single-flight (concurrent join), failure (null response) → cleared + emit, network error → cleared + emit, sessionExpired emitted exactly once for N waiters.
- [x] Inactivity tracker: under-threshold, exactly-at-threshold, over-threshold, no-record-no-expiry, custom days.
- [x] AuthClient: all new methods with mock HttpClient + AuthApiClient.
- [x] Hooks: `useForgotPassword`, `useResetPassword`, `useSessions`, `useRevokeSession`, `useLogoutEverywhere` via @testing-library/react + jsdom.
- [x] 100% coverage (statements / branches / functions / lines).

### Phase 12: Publish + version bump
- [x] Bumped to v2.0.0 via `publish-all.ps1 -Bump major -Packages auth-client`.
- [x] Published to npm registry. Tarball: 88.4 kB, 18 files (CJS + ESM + .d.ts for both `index` and `react` entries).
- [x] CHANGELOG.md updated with full v2.0.0 entry + migration guide.

### Phase 13: Migrate consumers
- [ ] BaseClient: replace local token logic with package adapters (work tracked in `auth-mobile-persistent-session.md`).
- [ ] apps/erevna-web: switch to `CookieTokenStorage` (work tracked in `auth-password-reset-web.md`).
- [ ] apps/katalogos-web: same.

### Phase 14: Quality checks (Tilt MCP)
- [ ] `npm-utils-unit-tests` style — package's own tests pass.
- [ ] After each consumer migrates: `frontend-*`, `erevna-web-*`, `katalogos-web-*` checks all pass.
- [ ] `playwright-e2e-identity-all` covers end-to-end.

## Acceptance Criteria
- `@dloizides/auth-client` v2.0.0 published with all adapters and hooks.
- All four consumers (BaseClient, erevna-web, katalogos-web, future mobile) use the package — no auth code lives outside it.
- Web sessions persist via httpOnly cookie. Mobile sessions persist via SecureStore.
- Biometric gate works on mobile (when enabled).
- Sessions screen + log-out-everywhere works on all clients.
- Inactivity timeout enforced uniformly.
- LIFECYCLE_PASSED on the package and on every consumer.

## Out of Scope
- Backend cookie-issuing endpoints (in `auth-password-reset-backend.md`).
- Specific UI for password reset (in `auth-password-reset-web.md`).
- Specific UI for biometric toggle / sessions screen (in `auth-mobile-persistent-session.md`).
- Multi-account switcher (deferred per decision 3 of mobile task).
- WebAuthn / passkeys (potential future task, not in scope here).

## Dependencies
- Existing `@dloizides/auth-client` v1.x as the starting point.
- `expo-secure-store` and `expo-local-authentication` as **peer dependencies** (not direct deps — only mobile consumers need them).
- Backend cookie endpoints from `auth-password-reset-backend.md` — needed for `CookieTokenStorage` to work end-to-end. The package can be built and unit-tested first; integration testing requires backend ready.

## Files Likely Touched
### NpmPackages/packages/auth-client/
- `src/storage/CookieTokenStorage.ts` (new)
- `src/storage/SecureStoreTokenStorage.ts` (new)
- `src/biometric/BiometricGate.ts` (new)
- `src/interceptor/RefreshInterceptor.ts` (new — may be extracted from AuthClient.ts)
- `src/inactivity/InactivityTracker.ts` (new)
- `src/hooks/useForgotPassword.ts`, `useResetPassword.ts` (new)
- `src/hooks/useSessions.ts`, `useRevokeSession.ts`, `useLogoutEverywhere.ts` (new)
- `src/AuthClient.ts` (extend with login/logout/reset methods)
- `src/index.ts` (export new surface)
- `package.json` (peerDeps, version bump to 2.0.0)
- `README.md` + `CHANGELOG.md`
- Test files for each new module

## Notes
- Peer-dep approach for `expo-*` packages keeps web bundle size unaffected — web consumers don't pull in mobile adapters they don't use. Tree-shaking handles the rest.
- The package must NOT import `react-native` directly anywhere in its core; only the SecureStore + BiometricGate modules touch RN-specific code, and they're isolated entry points.
- Cookie-based web auth requires the backend to set `Set-Cookie` and serve the API on the same domain (or a sibling domain with `SameSite=Lax`). Coordinate with backend task.
- This task is the architectural backbone — slow to start, but speeds up every subsequent auth-related change in the portfolio.

## Sequencing
1. **Backend cookie endpoints** (in `auth-password-reset-backend.md`) — can ship in parallel with package adapter work; integration test only after both ready.
2. **This package task** — Phases 1-12 produce a published v2.0.0.
3. **Migrate consumers** in parallel:
   - Mobile: `auth-mobile-persistent-session.md` Phases 1-7.
   - Web: `auth-password-reset-web.md` (re-scoped to consume the package).

---

## Changes Made (2026-05-07)

Phases 1-12 complete. Package v2.0.0 published to npm. Phase 13 (consumer migrations) and Phase 14 (E2E quality checks) intentionally NOT executed — they are tracked in dependent tasks (`auth-mobile-persistent-session.md`, `auth-password-reset-web.md`) and depend on backend cookie endpoints landing as well.

### New files (`NpmPackages/packages/auth-client/`)

- `src/events/AuthEventEmitter.ts` + test — zero-dep event emitter with `sessionExpired` event, snapshot dispatch, idempotent unsubscribe.
- `src/storage/CookieTokenStorage.ts` + test — web cookie-flow adapter; access token in memory, refresh token NEVER on JS heap.
- `src/storage/SecureStoreTokenStorage.ts` + test — mobile secure-store adapter; injected `SecureStoreLike` + optional `BiometricGateLike`.
- `src/biometric/BiometricGate.ts` + test — wraps `expo-local-authentication` via injected `LocalAuthLike`; opt-in flag with optional persistence; 3-strikes lockout default.
- `src/inactivity/InactivityTracker.ts` + test — pluggable `InactivityStore`, default 90 days, configurable.
- `src/interceptor/RefreshInterceptor.ts` + test — single-flight queue, transport-agnostic via `RefreshFn`, emits `sessionExpired` exactly once per failure.
- `src/http/HttpClient.ts` + test — `HttpClient` interface + `createFetchHttpClient(fetch)` factory; pluggable transport.
- `src/api/AuthApiClient.ts` + test — typed wrapper for `/auth/*` and `/me/sessions` endpoints; supports Bearer + cookie credentials.
- `src/hooks/useForgotPassword.ts` + `.test.tsx`
- `src/hooks/useResetPassword.ts` + `.test.tsx`
- `src/hooks/useSessions.ts` + `.test.tsx` (exports `SESSIONS_QUERY_KEY`)
- `src/hooks/useRevokeSession.ts` + `.test.tsx` (auto-invalidates sessions query)
- `src/hooks/useLogoutEverywhere.ts` + `.test.tsx` (auto-invalidates sessions query)
- `src/react.ts` — separate entry point so non-React consumers don't load `react`/`@tanstack/react-query`.

### Modified files

- `src/AuthClient.ts` — accepts optional `AuthClientCollaborators` (api, interceptor, inactivityTracker, events). New methods: `init()`, `refresh()`, `loginWithOtp()`, `loginWithPassword()`, `logout({ everywhere })`, `requestPasswordReset()`, `confirmPasswordReset()`, `on(event, listener)`. `buildAuthorizationUrl({ offlineAccess })` idempotently adds `offline_access` scope.
- `src/AuthClient.test.ts` — extended with login / logout / password-reset / init / refresh / events coverage.
- `src/index.ts` — exports the entire new surface area.
- `package.json` — peer deps added (`react`, `@tanstack/react-query`, `expo-secure-store`, `expo-local-authentication`, all optional). Dev deps for React + jsdom + @testing-library. Two-entry exports map (`.` and `./react`).
- `tsup.config.ts` — `entry: ['src/index.ts', 'src/react.ts']`, `external: ['react', '@tanstack/react-query']`.
- `tsconfig.json` / `tsconfig.test.json` — added `jsx: "react-jsx"`.
- `jest.config.js` — added `*.test.tsx`, excluded `react.ts` from coverage (entry point only).
- `.eslintrc.js` — added `.tsx` ignore for tests + `ecmaFeatures.jsx`.
- `README.md` — full rewrite for v2 surface (web cookie quick start, mobile secure-store quick start, hooks usage, lifecycle events, architecture decisions).
- `CHANGELOG.md` — v2.0.0 entry with feature list + migration guide.

### Test results

- 25 test suites, 290 tests, all passing.
- 100% coverage (statements / branches / functions / lines).
- Build succeeds: CJS + ESM + .d.ts emitted for both `index` and `react` entries. Tarball 88.4 kB.

### Design decisions deviating from / refining the task doc

1. **Adapter pattern for `expo-*` packages.** Instead of importing `expo-secure-store` and `expo-local-authentication` directly (which would force the package to declare them as deps and bloat web bundles), `SecureStoreTokenStorage` and `BiometricGate` accept injected `SecureStoreLike` / `LocalAuthLike` interfaces. Mobile consumers wire the real `expo-*` modules to these interfaces at the edge. Web bundles never resolve `expo-*` — even via tree-shaking, because the modules are never imported. This satisfies the "no `react-native` import in package core" hard requirement.
2. **Two entry points (`.` and `./react`).** Hooks live at `@dloizides/auth-client/react`. Non-React consumers (CLI tools, server-side, future Expo bare workflow without RN renderer) only load core. This keeps the React Query peer dep optional and tree-shakeable.
3. **`HttpClient` abstraction.** The task doc says "pluggable: takes a fetch-compatible function". Implemented as a typed `HttpClient` interface (returning `{ status, ok, data }` with auto-JSON parsing) plus `createFetchHttpClient(fetch)` factory. This decouples the auth API client from `fetch` so axios / ky / RN networking layers all work.
4. **Inactivity tracker uses its own `InactivityStore` rather than `TokenStorage`.** The task doc said "persist via the storage adapter", but on mobile that means every read of `lastRefreshedAt` would gate on biometric (because secure-store reads can be biometric-locked). Decoupling lets consumers store `lastRefreshedAt` in `AsyncStorage` (mobile) or `localStorage` (web) without going through the secure path.
5. **Refresh material is dropped on the floor by `CookieTokenStorage.write()`.** This is intentional — the backend `__Host-refresh` cookie is the source of truth on web, and any refresh token returned by `/auth/login` MUST not land on the JS heap. Documented in the adapter source.
6. **`useLogoutEverywhere` takes an `AuthClient`, not just an `AuthApiClient`.** Logout-everywhere needs to clear local storage + inactivity tracker AND call `/auth/logout?everywhere=true`. Routing through `AuthClient.logout()` ensures both happen. The lower-level `AuthApiClient.logout(true)` is also available for non-hook consumers.
7. **No `loginWithOtp/Password` send-otp endpoint.** The task doc says these methods take `email, otp` — implying the caller already received the OTP via `/auth/send-otp`. v2 keeps this division — the caller orchestrates the two-step OTP flow because it's UI-driven (resend logic, OTP input UX, etc.).

### Published artifact

- `@dloizides/auth-client@2.0.0` on npm (https://registry.npmjs.org/@dloizides/auth-client)
- 18 files in tarball: dist (CJS + ESM + .d.ts × 2 entries), README, CHANGELOG, LICENSE, package.json
- `package.json` version bumped automatically by `publish-all.ps1` (1.0.0 → 2.0.0)
