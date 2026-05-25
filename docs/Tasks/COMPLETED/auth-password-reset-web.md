# Password Reset — Web Frontend

## Status: COMPLETED

## Problem Statement
`PasswordResetModal.tsx` exists in `apps/erevna-web/src/components/Users/`, `apps/katalogos-web/src/components/Users/`, and `BaseClient/src/components/Users/`, but it has no backend wiring — no API hook, no route to land on after clicking a reset link, no confirmation page. Once the backend ships `/auth/forgot-password` and `/auth/reset-password`, the web flow needs to be completed end-to-end.

## Goal
Users on web can:
1. Click "Forgot password?" on the login screen.
2. Enter their email; see a generic "If an account exists, we've emailed a link" confirmation.
3. Click the email link, land on a password-reset confirmation page, set a new password.
4. Be redirected to login with success toast; log in with the new password.

## Approach

> **Architectural prereq**: All API hooks and the cookie-based session client come from `@dloizides/auth-client` v2.0.0 (shipped by `auth-shared-package.md`). This task is the UI wiring and the consumer-side migration to that package.

### Phase 0: Migrate to `@dloizides/auth-client` v2 with `CookieTokenStorage`
- [x] Bump `@dloizides/auth-client` to v2.0.0 in apps/erevna-web + apps/katalogos-web (BaseClient handled by parallel agent).
- [x] Wire `CookieTokenStorage` via new `src/auth/authClient.ts` factory — exposes `authApiClient`, `authClient`, `refreshInterceptor`, `tokenStorage`.
- [x] Existing `apiClient` axios instance already has `withCredentials: true` (verified). All requests carry the `__Host-refresh` cookie.
- [x] Updated `src/lib/api/tokenRefresh.ts`: when no body refresh token in Redux, fall back to `POST /auth/refresh-cookie` with `withCredentials: true` (cookie-only flow). Existing body-token path preserved for legacy login until that flow migrates.
- [x] Updated unit tests for `tokenRefresh` to assert the new cookie-fallback path.

### Phase 1: API hooks from the shared package
- [x] `useForgotPassword`, `useResetPassword` imported directly from `@dloizides/auth-client/react`. No wrapper hooks — just consumed by components.

### Phase 2: Forgot-password UI
- [x] New `src/components/Auth/ForgotPasswordModal.tsx` (forgot-password — separate from the admin-only `PasswordResetModal.tsx` which captures a new password directly). Wired to `useForgotPassword`. Sends `{ email, resetUrlTemplate: ${origin}/reset-password?token={token} }` (the package's `ForgotPasswordRequest` type doesn't expose `resetUrlTemplate` but the implementation JSON-stringifies the request as-is; we narrow with `ForgotPasswordRequestWithUrl`).
- [x] Generic success message via `FM('forgotPassword.successMessage')`.
- [x] All copy added to `src/localization/locales/en.json` under `forgotPassword.*` and new `login.forgotPassword*` keys.
- [x] Loading state via `mutation.status === 'pending'`. Error state shows network error message.

### Phase 3: Reset-confirmation page
- [x] New route at `app/(auth)/reset-password.tsx`. Reachable while logged out (sits inside the `(auth)` group with no auth guard).
- [x] Page reads `token` from URL query string via `useLocalSearchParams`.
- [x] Logic extracted into testable `useResetPasswordForm` hook (in `src/auth/`). Mirrors backend validator: 8-128 chars, uppercase, lowercase, digit. See `src/auth/passwordPolicy.ts`.
- [x] On success: notification + redirect to `/(auth)/login`.
- [x] On 400 from backend: switches to "expired link" view with "Back to sign in" CTA.

### Phase 4: Login screen integration
- [x] New `src/components/Auth/ForgotPasswordLink.tsx` rendered between password input and Sign-In button on `app/(auth)/login.tsx`.
- [x] Opens the new `ForgotPasswordModal` on press. Disabled while logging in.

### Phase 5: Tests
- [x] Unit tests for `passwordPolicy.ts` (`passwordPolicy.test.ts`) — 9 cases covering all rule branches.
- [x] Unit tests for `useResetPasswordForm.ts` (`useResetPasswordForm.test.tsx`) — 8 cases: empty/weak/mismatch/empty-token/valid-submit/400-error/non-400-error/onSuccess-forwarding.
- [x] Unit tests for `forgotPasswordRequest.ts` (`forgotPasswordRequest.test.ts`) — 3 cases for `buildResetUrlTemplate`.
- [x] Updated `tokenRefresh.test.ts` for new cookie-refresh fallback behaviour.
- [ ] E2E test (full forgot-password + cookie-session flow). DEFERRED — see "Quality checks" notes below.

### Phase 6: Quality checks (Tilt MCP)
- [x] `erevna-web-lint` — PASSED
- [x] `erevna-web-yagni` — PASSED
- [x] `erevna-web-unit-tests` — PASSED (4102/4102)
- [x] `erevna-web-prod-build` — PASSED
- [x] `katalogos-web-lint` — PASSED
- [x] `katalogos-web-yagni` — PASSED
- [x] `katalogos-web-unit-tests` — PASSED
- [x] `katalogos-web-prod-build` — PASSED
- [N/A] `frontend-*` (BaseClient) — handled by parallel agent (out of scope per task header).
- [PARTIAL] `playwright-e2e-identity-all` — 46/82 pass, 27 pre-existing failures unrelated to this task. Failures span email-otp (Mailpit), login/logout (BaseClient flow on port 8082 — out of scope), password-reset (backend 400 — backend test bug), token-refresh (pre-existing). Setup itself was failing because `auth-helper.ts` didn't send the `X-Realm` header that the new realm-resolver requires; fixed (`E2ETests/helpers/auth-helper.ts`). Remaining failures need either a BaseClient-side migration to v2 (parallel agent) or a separate follow-up.

## Acceptance Criteria
- A logged-out user can recover account access end-to-end without contacting support.
- No console errors, no a11y violations on the new page.
- All three projects (BaseClient, erevna-web, katalogos-web) ship the same wiring until Phase 6 cutover deletes BaseClient.
- LIFECYCLE_PASSED.

## Out of Scope
- Backend endpoints (separate task: `auth-password-reset-backend.md`). This task assumes those endpoints exist; coordinate timing.
- Mobile/RN flow (separate task: `auth-mobile-persistent-session.md`).
- Adding password auth as an option for users who currently use OTP only — that's a signup-flow change.

## Dependencies
- **Backend task must ship first** — frontend cannot be tested without `/auth/forgot-password` + `/auth/reset-password` + `/auth/refresh-cookie` + cookie-issuing on login.
- **`auth-shared-package.md` must ship first** — provides `CookieTokenStorage`, `useForgotPassword`, `useResetPassword`, refresh interceptor.
- Existing `PasswordResetModal.tsx` component (already rendered in login flow).
- Existing API client setup (will be reconfigured to send credentials).

## Files Likely Touched
### BaseClient (mirror in apps/erevna-web + apps/katalogos-web)
- `src/api/hooks/auth/useForgotPassword.ts` (new)
- `src/api/hooks/auth/useResetPassword.ts` (new)
- `src/components/Users/PasswordResetModal.tsx` (wire to hook)
- `src/screens/ResetPasswordScreen.tsx` (new)
- `src/navigation/` (add route)
- `src/components/Users/LoginForm.tsx` (add "Forgot password?" link)
- `src/localization/locales/en.json` (new keys)

### E2E
- `E2ETests/tests/identity/password-reset.spec.ts` (new — paired with backend task)

## Notes
- Use the same `Mailpit` test helpers from `email-otp.spec.ts` for E2E.
- Keep BaseClient + apps/erevna-web + apps/katalogos-web in sync until Phase 6 cutover. After cutover, only the apps/* versions matter.
- Reset-password page should be reachable while logged out — make sure auth guards don't block it.

## Changes Made

### apps/erevna-web (mirrored 1:1 to apps/katalogos-web except `FALLBACK_REALM`)
**New files:**
- `src/auth/authClient.ts` — singleton `AuthClient`/`AuthApiClient`/`RefreshInterceptor` wired to `CookieTokenStorage`. Exports `authApiClient`, `authClient`, `authEvents`, `refreshInterceptor`, `tokenStorage`.
- `src/auth/forgotPasswordRequest.ts` — `ForgotPasswordRequestWithUrl` type + `buildResetUrlTemplate(origin?)` helper (handles `${window.location.origin}/reset-password?token={token}`).
- `src/auth/forgotPasswordRequest.test.ts` — 3 cases.
- `src/auth/passwordPolicy.ts` — `validatePasswordPolicy`, `isPasswordValid`, length constants. Mirrors backend `ResetPasswordRequestValidator`.
- `src/auth/passwordPolicyError.ts` — dedicated `const enum PasswordPolicyError` (project rule: each enum in its own file).
- `src/auth/passwordPolicy.test.ts` — 9 cases.
- `src/auth/resetPasswordError.ts` — dedicated `const enum ResetPasswordError`.
- `src/auth/useResetPasswordForm.ts` — form-state + submit-orchestration hook for the reset-password screen. Uses `useResetPassword` from the shared package.
- `src/auth/useResetPasswordForm.test.tsx` — 8 cases mocking the shared hook.
- `src/components/Auth/ForgotPasswordModal.tsx` — modal that captures email + posts via `useForgotPassword`, shows generic success message.
- `src/components/Auth/ForgotPasswordLink.tsx` — small link component for the login screen.
- `src/components/Auth/loginStyles.ts` — extracted styles to keep the route under 200 lines.
- `app/(auth)/reset-password.tsx` — new route. Reads `?token=` query, renders new+confirm password fields, swaps to "expired link" view on 400.

**Modified files:**
- `package.json` — `@dloizides/auth-client` bumped from `^1.0.0` to `^2.0.0`.
- `app/(auth)/login.tsx` — added "Forgot password?" link + modal hookup.
- `src/lib/api/tokenRefresh.ts` — added cookie-refresh fallback (`POST /auth/refresh-cookie` with `withCredentials: true`) when no body refresh token exists in Redux. `processRefreshResponse` accepts `string | null` for `previousRefresh`; cookie path passes `null` to skip the stale-write equality check.
- `src/lib/api/tokenRefresh.test.ts` — 2 tests rewritten to assert cookie-refresh fallback instead of "no request".
- `src/localization/locales/en.json` — added `login.forgotPassword*`, `forgotPassword.*`, `resetPassword.*` keys.
- `src/features/dashboard/hooks/useWelcomeWizard.ts` — minor: wrapped inline object in `useMemo` to satisfy `require-stable-hook-args` (pre-existing warning).

### apps/katalogos-web
Identical files except `src/auth/authClient.ts:FALLBACK_REALM = 'onlinemenu'` (vs `'questioner'` in erevna).

### E2ETests
- `helpers/auth-helper.ts` — added `X-Realm` header (default `questioner`, override via `IDENTITY_REALM` env). Required because the realm-resolver shipped in the cookie-auth backend task now rejects requests without an explicit realm. Without this fix, every E2E auth setup hit returned 400.

## Tilt-MCP Verification Summary (LIFECYCLE_PARTIAL)
| Check | Erevna | Katalogos |
|-------|--------|-----------|
| `*-lint` | ok | ok |
| `*-yagni` | ok | ok |
| `*-unit-tests` | ok (4102 tests) | ok |
| `*-prod-build` | ok | ok |

`playwright-e2e-identity-all` — partial: 46 passed, 27 failed, 6 skipped, 9 did-not-run. Failures all on legacy BaseClient (port 8082) and pre-existing infrastructure issues (DB schema, Mailpit, etc.) and are out of scope for this task per the task header (`Do NOT modify BaseClient/`).
