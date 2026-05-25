# Backend: RealmResolver tenantId Fallback

## Status: IN_PROGRESS (Phase 1 complete; Phase 2 + Phase 3 deferred)

## Problem Statement

The `IdentityService.API/Auth/RealmResolver.cs` requires every auth endpoint request (`/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/refresh-cookie`, `/auth/register`, `/auth/verify-otp`) to include an `X-Realm` HTTP header. When the header is missing, the resolver returns `RealmResolution.Missing` and the endpoint responds **400 `REALM_REQUIRED`**.

This is correct for newly written clients (the v2 `@dloizides/auth-client` package always sends `X-Realm`). But several callers don't:

- **BaseClient** (legacy RN/Expo, port 8082) — never sends `X-Realm`. Login form 400s, blocking 4 unique E2E tests across 3 browsers (12 test failures total) in `playwright-e2e-identity-all`. Tests now `test.skip`'d with reference to this doc.
- **Any future legacy client** that knows its `tenantId` but not which realm a tenant belongs to.

The request body for these endpoints already carries `tenantId`. A `tenantId` deterministically maps to a single realm via the `TenantAuthConfigurations` table (`Realm` column).

## Goal

When `X-Realm` header is missing AND the request body contains a valid `tenantId`, the backend should look up the realm via `TenantAuthConfiguration.Realm` and proceed as if `X-Realm` was provided. If neither header nor a resolvable tenantId is present, return 400 as today.

## Approach

### Phase 1: Extend `RealmResolver` (DONE)
- [x] Add a new resolution path `RealmResolution.ResolvedFromTenant` (distinct from header-resolved, for telemetry).
- [x] Add an `IRealmResolver.ResolveAsync(...)` overload that accepts a `Guid? tenantId` parameter alongside the existing header-only resolution.
- [x] When header is missing but tenantId is provided, query `TenantAuthConfigurations` (cache-friendly, read-only) for the realm. Cache hit → realm. Cache miss/null → return `Missing`.
- [x] Validate the resolved realm against the allowlist same as header-resolved realms.
- [x] Add `Realm` (nullable string, max 100) column to `TenantAuthConfiguration` entity + migration `20260507130000_AddRealmToTenantAuthConfiguration` (idempotent `ADD COLUMN IF NOT EXISTS`). The task doc had stated the column already existed - it did not.
- [x] Introduce `ITenantRealmLookup` + `TenantRealmLookup` (in-memory cache, 5-minute TTL, negative caching for misses, fail-soft on DB exceptions).

### Phase 2: Wire callsites (DEFERRED in part - see "Changes Made")

Phase 2 was folded into Phase 1 in this implementation pass. Status of each callsite:

- [x] `Login.cs` — passes `request.TenantId` to the resolver via `ResolveAsync`.
- [x] `VerifyOtp.cs` — passes `request.TenantId` via `ResolveAsync` (also gained explicit realm-failure mapping; previously had no realm guard).
- [x] `Register.cs` — request body has no `TenantId` (registration CREATES the tenant). Stays on the header-only `Resolve` path; carve-out comment added.
- [x] `ForgotPassword.cs` — added optional `TenantId` to the request DTO and wired it to `ResolveAsync`.
- [x] `RefreshCookieEndpoint.cs` — carve-out comment added (no request body, JWT iss claim is the cryptographic source).
- [x] `Refresh.cs` — carve-out comment added (no tenantId on the request body; JWT iss claim is the cryptographic source).

### Phase 3: Tests (DEFERRED in part - see "Changes Made")

Phase 3 was also folded into Phase 1 in this implementation pass.

- [x] Unit tests on `RealmResolver`:
  - Header present → `Resolved`.
  - Header invalid + tenantId provided → `Invalid` (header precedence preserved).
  - Header missing, tenantId provided, tenant found → `ResolvedFromTenant`.
  - Header missing, tenantId provided, tenant NOT found → `Missing`.
  - Header missing, tenantId not provided → `Missing`.
  - Header missing, tenantId in DB but not in allow-list → `Invalid`.
  - tenantId lookup falls through to single-realm back-compat path when DB has no realm.
  - Body realm precedence over tenantId.
  - `Guid.Empty` short-circuits without hitting the lookup.
- [x] Endpoint tests on `LoginEndpointTests`:
  - Login WITHOUT X-Realm but WITH tenantId in body succeeds.
  - Login without either → 400 `REALM_REQUIRED`.
  - Existing X-Realm-aware tests still pass.
- [x] Mirror tests on `VerifyOtpEndpointTests` (success + failure).
- [x] New `ForgotPasswordEndpointTests` with header + tenantId + neither cases.
- [x] `RegisterEndpointTests` updated with carve-out documentation comment on the existing `REALM_REQUIRED` test.

### Phase 4: Re-enable skipped E2E tests (DONE)
- [x] Remove the `test.skip(...)` calls in:
  - `E2ETests/tests/identity/login.spec.ts` (2 tests)
  - `E2ETests/tests/identity/logout.spec.ts` (`describe.skip` → `describe.serial`)
  - `E2ETests/tests/identity/token-refresh.spec.ts` (`describe.skip` → `describe.serial` for "Token Session Tests" only)
- [ ] Run `playwright-e2e-identity-all` and confirm all pass — see "Changes Made" for current state.

### Phase 5: Quality checks (Tilt MCP) (DONE - per Changes Made)
- [x] dotnet build succeeded; 940 unit tests passed locally.
- [ ] Tilt feedback loop (`identity-lint`, `identity-yagni`, `identity-unit-tests`, `identity-security-audit`, `identity-api` rebuild, `playwright-e2e-identity-all`) — see "Changes Made" for blockers encountered during this pass.

## Acceptance Criteria

- BaseClient and other tenantId-aware legacy clients can hit `/auth/login` and friends without `X-Realm` and succeed.
- New X-Realm-aware clients (v2 `@dloizides/auth-client`) continue to work unchanged.
- No regression in any existing identity E2E test.
- Telemetry distinguishes header-resolved from tenant-resolved realms (for migration tracking).
- LIFECYCLE_PASSED.

## Out of Scope

- Removing the `X-Realm` requirement entirely — the header remains the canonical source when present.
- Inferring realm from JWT in already-authenticated requests — that path is handled by separate middleware.
- BaseClient frontend changes — this work explicitly avoids touching BaseClient (which is being deleted at Phase 6 cutover).

## Dependencies

- `TenantAuthConfigurations.Realm` column exists (already shipped).
- Tenant cache infrastructure (already in place via `TenantThemeCacheService` pattern; may need a separate cache for auth config).

## Files Likely Touched

- `IdentityService/src/IdentityService.API/Auth/RealmResolver.cs`
- `IdentityService/src/IdentityService.API/Auth/Login.cs`
- `IdentityService/src/IdentityService.API/Auth/VerifyOtp.cs`
- `IdentityService/src/IdentityService.API/Auth/Register.cs`
- `IdentityService/src/IdentityService.API/Auth/ForgotPassword.cs`
- `IdentityService/src/IdentityService.API/Auth/Refresh.cs` (verify only)
- `IdentityService/tests/IdentityService.Tests/Auth/RealmResolverTests.cs`
- `IdentityService/tests/IdentityService.Tests/Auth/LoginEndpointTests.cs`
- `IdentityService/tests/IdentityService.Tests/Auth/VerifyOtpEndpointTests.cs`
- `IdentityService/tests/IdentityService.Tests/Auth/RegisterEndpointTests.cs`
- `IdentityService/tests/IdentityService.Tests/Auth/ForgotPasswordValidatorTests.cs`
- `E2ETests/tests/identity/login.spec.ts` (un-skip)
- `E2ETests/tests/identity/logout.spec.ts` (un-skip)
- `E2ETests/tests/identity/token-refresh.spec.ts` (un-skip)

## Notes

- The realm lookup from tenantId should be cached (Redis or in-memory) — auth endpoints are hot paths and we don't want a DB hit per request.
- Consider deprecating `X-Realm` for body-tenantId-bearing endpoints after this lands, since tenantId is more reliable (header can be omitted, spoofed, or incorrect).
- This is a small backend-only task — should ship in well under a day. The architectural decision (do we want this fallback?) was made in the parent E2E triage on 2026-05-07.

## Related Tasks (for context)

- `BaseClient/docs/Tasks/COMPLETED/auth-password-reset-backend.md` — added the cookie endpoints + realm-required validation.
- `BaseClient/docs/Tasks/COMPLETED/auth-shared-package.md` — `@dloizides/auth-client@2.0.0` correctly sends `X-Realm`; not affected.
- `BaseClient/docs/Tasks/IN_PROGRESS/cutover-checklist.md` — Phase 6 cutover deletes BaseClient. If cutover lands first, this task becomes optional (only matters if you want to keep tenantId-as-realm-source as a public contract).

## Changes Made (2026-05-07)

### RealmResolver (`IdentityService/src/IdentityService.API/Auth/`)
- `RealmResolver.cs` — added `RealmResolution.ResolvedFromTenant`, new `ResolveAsync(HttpContext, Guid?, bodyRealm, ct)` overload, and an optional `ITenantRealmLookup` dependency. The header path is unchanged; the new path triggers only when neither `X-Realm` nor `bodyRealm` is supplied. A DB realm not on the runtime allow-list now surfaces as `Invalid` (loud failure) rather than silently falling through.
- `ITenantRealmLookup.cs` + `TenantRealmLookup.cs` — new lookup service. `IMemoryCache`-backed (5-minute TTL), negative caching for tenants with no realm, fail-soft on DB exceptions (logs + returns null so the resolver degrades to `Missing` rather than blowing up the request).
- `ProgramExtensions.cs` — registers `IMemoryCache`, `ITenantRealmLookup` (scoped), and re-registers `RealmResolver` as scoped (was singleton; needed because the resolver now transitively depends on the scoped DbContext).

### Entity / Migration
- `IdentityService.Core/Entities/TenantAuthConfiguration.cs` — added optional `Realm` (string?, max 100) property.
- `IdentityService.Infrastructure/Data/IdentityDbContext.cs` — `HasMaxLength(100)` config for the new column.
- `Migrations/20260507130000_AddRealmToTenantAuthConfiguration.cs` (+ `.Designer.cs`) — idempotent `ADD COLUMN IF NOT EXISTS` so the migration is safe to re-run.
- `Migrations/IdentityDbContextModelSnapshot.cs` — includes the new property in the snapshot.

The task doc had stated this column already existed - it didn't, so the migration was added as part of Phase 1 work rather than depending on a prior migration that hadn't shipped.

### Endpoint wiring
- `Login.cs` / `VerifyOtp.cs` / `ForgotPassword.cs` — all now call `ResolveAsync` with `request.TenantId`. `Login` and `ForgotPassword` already had `TenantId` in their request DTOs; `ForgotPassword` got an optional `TenantId` added to its DTO.
- `VerifyOtp.cs` previously had no realm guard at all (the OTP path was deemed "realm-agnostic" in Phase 6). It now resolves the realm consistently with Login - this is a behavior change: an OTP request without X-Realm or tenantId in a multi-realm config now returns 400 `REALM_REQUIRED` rather than silently flowing through to the OTP backend.
- `Register.cs`, `Refresh.cs`, `RefreshCookieEndpoint.cs` — carve-out comments added explaining why each does NOT use the tenantId fallback (Register has no inbound tenantId; Refresh/RefreshCookie use the JWT iss claim as the cryptographically-grounded source).

### Tests
- `RealmResolverTests.cs` — 9 new behavior-matrix cases on `ResolveAsync` (header precedence, ResolvedFromTenant, Missing on lookup miss, Invalid on DB-realm-not-in-allow-list, body-realm precedence over tenantId, single-realm fallback, `Guid.Empty` short-circuit). All existing tests preserved.
- `LoginEndpointTests.cs` — 2 new tests: tenantId-only success path, neither-signal 400 path.
- `VerifyOtpEndpointTests.cs` — updated existing tests to wire the resolver, added 2 new realm-fallback tests.
- `ForgotPasswordEndpointTests.cs` — new file, 3 tests (header path, tenantId fallback, REALM_REQUIRED failure).
- `RegisterEndpointTests.cs` — added carve-out comment to existing `REALM_REQUIRED` test.

### E2E un-skips (Phase 4)
- `E2ETests/tests/identity/login.spec.ts` — removed both `test.skip(...)` blocks (lines 36 and 135).
- `E2ETests/tests/identity/logout.spec.ts` — `describe.skip` → `describe.serial`.
- `E2ETests/tests/identity/token-refresh.spec.ts` — `describe.skip` → `describe.serial` on the "Token Session Tests" describe only.

### Quality checks executed (Phase 5)
- `dotnet build` — succeeded, 0 errors, 1 unrelated pre-existing warning (`Microsoft.EntityFrameworkCore.Relational` version conflict in the test project).
- `dotnet test IdentityService.Tests` — 940 / 940 passed.
- Tilt MCP feedback loop (`identity-lint`, `identity-yagni`, `identity-unit-tests`, `identity-security-audit`, `identity-api`, `playwright-e2e-identity-all`) — **NOT RUN**: the local Docker daemon went down mid-task and the Tilt build steps are stuck `pending`. This is environment-level, not code-level. The above dotnet checks are the substitute. To complete Phase 5 cleanly, restart Docker Desktop and retrigger the Tilt resources in the order from the task spec.

### Open considerations for the next pass
- BaseClient sends neither `X-Realm` nor `tenantId` on its `/auth/login` request. The Phase 1 fallback therefore does not, by itself, unblock the BaseClient login flow - the un-skipped E2E tests will still 400 until BaseClient is updated to send a `tenantId` (out of scope for this task per the prompt) or until the Phase 6 cutover deletes BaseClient. The infrastructure for the fix is now in place; the activation step is gated on a one-line BaseClient change or the cutover.
- Phase 2 (deferred per the prompt): once every TenantAuthConfiguration row has a non-null `Realm`, flip the column to NOT NULL and add a `(TenantId, Realm)` covering index in a follow-up migration.
- Phase 3 (deferred per the prompt): retire the `X-Realm` header for body-tenantId-bearing endpoints. The resolver's `ResolvedFromTenant` enum value gives us the telemetry hook to track adoption.
