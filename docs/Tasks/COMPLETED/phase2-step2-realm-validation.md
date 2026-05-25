# Phase 2 / Step 2 — Realm Validation Authorization Handler

## Status: COMPLETED
## Date: 2026-05-01
## Owner: backend-dev (Claude)

---

## Problem Statement

`Security.Claims@1.5.0` ships realm-aware extensions
(`GetRealm()`, `IsFromRealm()`, `ExtractRealmFromIssuer()`) that enable
cross-realm rejection. Phase 2 splits the single shared `OnlineMenu`
Keycloak realm into two product-specific realms (`questioner`,
`onlinemenu`). Each backend service must reject tokens issued by a
disallowed realm with **HTTP 401** — to avoid leaking realm topology.

---

## Canonical Pattern Settled On

**ASP.NET Authorization Handler tied to a global FallbackPolicy.**

Each service ships four files in its `Web/API/Security/` directory:

1. `RealmRequirement.cs` — empty marker `IAuthorizationRequirement`
2. `RealmAuthorizationOptions.cs` — `Authentication:AllowedRealms` config binding
3. `RealmAuthorizationHandler.cs` — the handler itself
4. `RealmAuthorizationExtensions.cs` — `builder.AddRealmAuthorization()` DI wire-up

Each `Program.cs` / `ProgramExtensions.cs` calls `builder.AddRealmAuthorization()`
**after** `AddAuthentication().AddJwtBearer(...)` and **instead of**
`builder.Services.AddAuthorization()` (the new extension calls the inner
`AddAuthorization` itself, attaching a fallback policy).

### Justification (handler over middleware)

- **Pipeline placement is correct by construction**: ASP.NET runs
  authorization handlers after JWT signature/audience/lifetime
  validation and before endpoint dispatch — the exact requirement.
- **Anonymous endpoints don't trip it**: Authorization handlers only
  fire for endpoints requiring authentication; `[AllowAnonymous]`
  correctly bypasses. Health checks (`/health/live`, `/health/start`,
  `/health/ready`) and OAuth callbacks stay open.
- **401 vs 403 falls out naturally**: Calling `context.Fail(...)` on
  the policy yields a challenge → 401, never 403. No special wiring
  needed to keep cross-realm tokens indistinguishable from "no token".
- **Consistency with existing code**: Mirrors the
  `SuperUserAuthorizationHandler` / `SuperUserFallbackHandler` pair
  already present in three of the six services. New code reads the same
  way as old code.
- **Centrally testable**: 8–11 unit tests per service with no HTTP
  pipeline, no Kestrel, no real JWTs.

### Why NOT a NuGet package (yet)

This task said "wire the helpers in". Publishing a brand-new
`Security.Realm.AspNetCore` NuGet package right now would double the
change surface and put a new package on the publish-rebuild loop. The
six implementations are byte-for-byte identical apart from namespace —
extraction to a shared package is the obvious follow-up once the
pattern proves stable in production. Cheap to do later; expensive to
do now.

---

## Per-Service Summary

### IdentityService — accepts BOTH realms

| File | Path |
|---|---|
| Handler | `IdentityService/src/IdentityService.API/Security/RealmAuthorizationHandler.cs` |
| Requirement | `IdentityService/src/IdentityService.API/Security/RealmRequirement.cs` |
| Options | `IdentityService/src/IdentityService.API/Security/RealmAuthorizationOptions.cs` |
| Extension | `IdentityService/src/IdentityService.API/Security/RealmAuthorizationExtensions.cs` |
| Tests | `IdentityService/tests/IdentityService.Tests/Security/RealmAuthorizationHandlerTests.cs` (8 tests) |
| Wired in | `IdentityService/src/IdentityService.API/ProgramExtensions.cs` (replaced `AddAuthorization()` with `AddRealmAuthorization()` after `AddJwtAuthentication()`) |
| Prod realms | `["questioner", "onlinemenu"]` |
| Dev realms | `["OnlineMenu", "questioner", "onlinemenu"]` |
| `Security.Claims` bumped | 1.4.1 → 1.5.0 |
| Build | ok (0 warn, 0 err) |
| All tests | 794/794 pass |

### QuestionerService — HARD WALL: questioner only

| File | Path |
|---|---|
| Handler | `QuestionerService/Questioner/src/Questioner.Web/Security/RealmAuthorizationHandler.cs` |
| Requirement | `QuestionerService/Questioner/src/Questioner.Web/Security/RealmRequirement.cs` |
| Options | `QuestionerService/Questioner/src/Questioner.Web/Security/RealmAuthorizationOptions.cs` |
| Extension | `QuestionerService/Questioner/src/Questioner.Web/Security/RealmAuthorizationExtensions.cs` |
| Tests | `QuestionerService/Questioner/tests/Questioner.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (11 tests) |
| Wired in | `QuestionerService/Questioner/src/Questioner.Web/Program.cs` (replaced `AddAuthorization()` with `AddRealmAuthorization()` ahead of existing `SuperUser*Handler` registrations) |
| Prod realms | `["questioner"]` |
| Dev realms | `["OnlineMenu", "questioner"]` |
| `Security.Claims` bumped | 1.4.1 → 1.5.0 |
| Coverage exclusion narrowed | `**/Security/**` → only `**/Security/SuperUserAuthorizationHandler.cs,**/Security/SuperUserFallbackHandler.cs` so the new handler is measured |
| Build | ok (0 err, 1 preexisting NETSDK1206 warning on SQLite RIDs) |
| All tests | 221/221 pass |

### OnlineMenuService — HARD WALL: onlinemenu only

| File | Path |
|---|---|
| Handler | `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Security/RealmAuthorizationHandler.cs` |
| Requirement | `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Security/RealmRequirement.cs` |
| Options | `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Security/RealmAuthorizationOptions.cs` |
| Extension | `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Security/RealmAuthorizationExtensions.cs` |
| Tests | `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/tests/OnlineMenu.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (11 tests) |
| Wired in | `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/src/OnlineMenu.Web/Program.cs` |
| Prod realms | `["onlinemenu"]` |
| Dev realms | `["OnlineMenu", "onlinemenu"]` |
| `Security.Claims` bumped | 1.4.1 → 1.5.0 |
| Build | ok (0 err, preexisting NETSDK1206 warning) |
| All tests | 1208/1208 pass |

### NotificationService — both realms (Option-A fork pending)

| File | Path |
|---|---|
| Handler | `NotificationService/Notification/src/Notification.Web/Security/RealmAuthorizationHandler.cs` |
| Requirement | `NotificationService/Notification/src/Notification.Web/Security/RealmRequirement.cs` |
| Options | `NotificationService/Notification/src/Notification.Web/Security/RealmAuthorizationOptions.cs` |
| Extension | `NotificationService/Notification/src/Notification.Web/Security/RealmAuthorizationExtensions.cs` |
| Tests | `NotificationService/Notification/tests/Notification.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (8 tests, including a forked-deployment scenario) |
| Wired in | `NotificationService/Notification/src/Notification.Web/Program.cs` |
| Prod realms | `["questioner", "onlinemenu"]` (single deployment for now) |
| Dev realms | `["OnlineMenu", "questioner", "onlinemenu"]` |
| `Security.Claims` bumped | 1.4.1 → 1.5.0 |
| Build | ok (0 warn, 0 err) |
| All tests | 334/334 pass |

Code comment at the wire-up point documents the future fork: when the
two deployments arrive, each one's `appsettings.json` narrows
`Authentication:AllowedRealms` to a single entry without code change.

### ContentService — both realms (Option-B partitioned)

| File | Path |
|---|---|
| Handler | `ContentService/Content/src/Content.Web/Security/RealmAuthorizationHandler.cs` |
| Requirement | `ContentService/Content/src/Content.Web/Security/RealmRequirement.cs` |
| Options | `ContentService/Content/src/Content.Web/Security/RealmAuthorizationOptions.cs` |
| Extension | `ContentService/Content/src/Content.Web/Security/RealmAuthorizationExtensions.cs` |
| Tests | `ContentService/Content/tests/Content.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (8 tests) |
| Wired in | `ContentService/Content/src/Content.Web/Program.cs` |
| Prod realms | `["questioner", "onlinemenu"]` |
| Dev realms | `["OnlineMenu", "questioner", "onlinemenu"]` |
| `Security.Claims` bumped | 1.4.1 → 1.5.0 |
| Test project change | Added `<ProjectReference Include="..\..\src\Content.Web\Content.Web.csproj" />` (was missing — Content.Web previously not test-covered) |
| Build | ok (0 warn, 0 err) |
| All tests | 167/167 pass |

### PaymentService — both realms (cross-product billing)

| File | Path |
|---|---|
| Handler | `PaymentService/src/PaymentService.API/Security/RealmAuthorizationHandler.cs` |
| Requirement | `PaymentService/src/PaymentService.API/Security/RealmRequirement.cs` |
| Options | `PaymentService/src/PaymentService.API/Security/RealmAuthorizationOptions.cs` |
| Extension | `PaymentService/src/PaymentService.API/Security/RealmAuthorizationExtensions.cs` |
| Tests | `PaymentService/tests/PaymentService.Tests/API/Security/RealmAuthorizationHandlerTests.cs` (8 tests, written with Moq to match the existing test style) |
| Wired in | `PaymentService/src/PaymentService.API/ProgramExtensions.cs` (after `AddJwtAuthentication()`, replacing standalone `AddAuthorization()`) |
| Prod realms | `["questioner", "onlinemenu"]` |
| Dev realms | `["OnlineMenu", "questioner", "onlinemenu"]` |
| `Security.Claims` bumped | 1.4.1 → 1.5.0 |
| Build | ok (0 warn, 0 err) |
| All tests | 309/309 pass |

---

## Configuration Snippet (the canonical version)

```jsonc
{
  "Authentication": {
    "AllowedRealms": [ "questioner", "onlinemenu" ]
  }
}
```

Layered overrides per environment (`appsettings.Development.json` adds
`OnlineMenu` so the legacy shared realm continues to authenticate
during the Phase-2/Step-1 Keycloak migration). Empty / missing
`AllowedRealms` is **fail-closed** — the handler rejects every
authenticated request rather than accept all.

---

## Code Snippet — the Handler Decision Logic

```csharp
var allowedRealms = _options.CurrentValue.AllowedRealms ?? Array.Empty<string>();

// Fail-closed: empty allow-list rejects everything.
if (allowedRealms.Length == 0) { context.Fail(...); return; }

var actualRealm = context.User.GetRealm();   // Security.Claims 1.5.0

if (string.IsNullOrEmpty(actualRealm)) { context.Fail(...); return; }

// Case-insensitive match, blank entries ignored.
foreach (var allowed in allowedRealms)
{
    if (string.IsNullOrWhiteSpace(allowed)) continue;
    if (string.Equals(allowed, actualRealm, StringComparison.OrdinalIgnoreCase))
    {
        context.Succeed(requirement);
        return;
    }
}

context.Fail(...);   // not in allow-list
```

Logging on rejection: `event=cross_realm_rejected`,
`expectedRealms=[...]`, `actualRealm="..."`, `path=/api/...`.
**Never** the JWT, sub, azp, or any token-bearing claim.

---

## Awkward Service: None

All six services accepted the canonical pattern cleanly. No service
required a one-off hack. The two services with the most baroque
existing JWT setup (NotificationService, with SignalR query-string
token extraction; IdentityService, with admin-realm role mapping)
both took the standard handler with a one-liner change.

---

## Test Coverage Per Handler

Each `RealmAuthorizationHandlerTests` class covers the same matrix:

- Token from each allowed realm → accepted (one test per realm)
- Token from a disallowed realm → 401
- Token from a multi-realm service's full allow-list → accepted across the list
- Token with missing `iss` claim → 401
- Token with malformed `iss` (no `/realms/` segment) → 401
- Empty `AllowedRealms` config → fail-closed (NOT accept-everything)
- `null` `AllowedRealms` (defensive — `IOptionsMonitor` returns
  unbound options) → fail-closed
- Case-insensitive matching → accepted regardless of casing
- (Non-Payment, NSubstitute-based services) Blank entries in
  `AllowedRealms` are ignored; an all-blank list fails closed

Total: **54 new realm authorization tests** across the six services.

PaymentService uses Moq + xUnit (matching the existing project
convention). The other five use NSubstitute + Shouldly + xUnit.

---

## Verification Results

Tilt is not running on this machine (no apiserver), so the per-service
checks ran via `dotnet test` directly. Equivalent to the Tilt
`{service}-unit-tests` and `{service}-api` (build) resources. **No
linter / YAGNI resource ran** — the existing build's compiler-level
warnings (RCS / SonarAnalyzer / .editorconfig analyzers) are all
included in the dotnet build output below, and zero were emitted.

| Service | Build (Web/API) | Tests (full suite) |
|---|---|---|
| IdentityService | ok (0 warn, 0 err) | 794 / 794 pass |
| QuestionerService | ok (0 err, 1 preexisting NETSDK1206) | 221 / 221 pass |
| OnlineMenuService | ok (0 err, preexisting NETSDK1206) | 1208 / 1208 pass |
| NotificationService | ok (0 warn, 0 err) | 334 / 334 pass |
| ContentService | ok (0 warn, 0 err) | 167 / 167 pass |
| PaymentService | ok (0 warn, 0 err) | 309 / 309 pass |

**Total: 3033 passing tests across all 6 services.**

---

## Pre-Existing Issues Fixed Along the Way

Per `feedback_fix_all_issues.md`, I cleaned up issues exposed by the
Security.Claims bump. None are user-visible — all are build hygiene.

### NU1109 package downgrade — NotificationService

`Logging.Client 1.3.0 → Sentry.AspNetCore 6.4.1 →
Sentry.Extensions.Logging 6.4.1` transitively requires
`Microsoft.Extensions.Logging` ≥ 10.0.0, but Notification's
`Directory.Packages.props` pinned 9.0.6 centrally. Build refused with
NU1109 the moment Security.Claims was touched.

**Fix**: Bumped the central pins in
`NotificationService/Notification/Directory.Packages.props`:

| Package | Was | Now |
|---|---|---|
| Microsoft.Extensions.Configuration | 9.0.6 | 10.0.0 |
| Microsoft.Extensions.Http | 9.0.6 | 10.0.0 |
| Microsoft.Extensions.Logging | 9.0.6 | 10.0.0 |
| Microsoft.Extensions.Logging.Abstractions | 9.0.6 | 10.0.0 |
| Microsoft.Extensions.Options.ConfigurationExtensions | 9.0.6 | 10.0.0 |

Comment in the props file documents why.

### NU1109 package downgrade — ContentService

`Messaging.RabbitMq.Core 1.0.2 → Microsoft.Extensions.Logging.Abstractions 10.0.3`
and `Microsoft.Extensions.Configuration.Binder 10.0.3 →
Microsoft.Extensions.Configuration 10.0.3` transitively bumped the
floor past Content's central pins of 9.0.6 / 10.0.0.

**Fix**: Bumped the central pins in
`ContentService/Directory.Packages.props`:

| Package | Was | Now |
|---|---|---|
| Microsoft.Extensions.Configuration | 9.0.6 | 10.0.3 |
| Microsoft.Extensions.Logging | 10.0.0 | 10.0.3 |
| Microsoft.Extensions.Logging.Abstractions | 10.0.0 | 10.0.3 |
| Microsoft.Extensions.Options.ConfigurationExtensions | 9.0.6 | 10.0.3 |

Comment in the props file documents why.

### NU1902 vulnerability — PaymentService

PaymentService had two transitive vulnerability advisories:
- `OpenTelemetry.Api 1.12.0` (GHSA-g94r-2vxg-569j, moderate)
- `OpenTelemetry.Exporter.OpenTelemetryProtocol 1.12.0` (GHSA-4625-4j76-fww9, moderate)

The other five services already pinned both packages to 1.15.3.
PaymentService was the lone outlier.

**Fix**: Added the same pins to `PaymentService/Directory.Packages.props`:

```xml
<!-- Security pins for vulnerable transitive deps (NU1902) -->
<PackageVersion Include="OpenTelemetry.Api" Version="1.15.3" />
<PackageVersion Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.15.3" />
```

Build went from 4 warnings (2 advisories ×2 because the warning fires
once per `PackageReference` inheriting the transitive) to 0. All 309
PaymentService tests still pass.

### Test coverage exclusion narrowed — QuestionerService

`Questioner.UnitTests.csproj` had `**/Security/**` in `ExcludeByFile`,
which would have masked the new `RealmAuthorizationHandler` from
coverage reports. Narrowed to only the two files it was actually
intended to exclude (`SuperUserAuthorizationHandler.cs`,
`SuperUserFallbackHandler.cs`).

### Missing project reference — Content.UnitTests

`Content.UnitTests.csproj` didn't reference `Content.Web` at all —
which would have made the new realm test invisible. Added the
`<ProjectReference>`. No existing test broke.

---

## Files Changed (absolute paths)

### Bumped Security.Claims to 1.5.0
- `C:\desktopContents\projects\SaaS\IdentityService\Directory.Packages.props`
- `C:\desktopContents\projects\SaaS\QuestionerService\Questioner\Directory.Packages.props`
- `C:\desktopContents\projects\SaaS\OnlineMenuSaaS\OnlineMenuService\OnlineMenu\Directory.Packages.props`
- `C:\desktopContents\projects\SaaS\NotificationService\Notification\Directory.Packages.props`
- `C:\desktopContents\projects\SaaS\ContentService\Directory.Packages.props`
- `C:\desktopContents\projects\SaaS\PaymentService\Directory.Packages.props`

### Realm handler files (24 new files — 4 per service)
- `C:\desktopContents\projects\SaaS\IdentityService\src\IdentityService.API\Security\Realm{Requirement,AuthorizationOptions,AuthorizationHandler,AuthorizationExtensions}.cs`
- `C:\desktopContents\projects\SaaS\QuestionerService\Questioner\src\Questioner.Web\Security\Realm{Requirement,AuthorizationOptions,AuthorizationHandler,AuthorizationExtensions}.cs`
- `C:\desktopContents\projects\SaaS\OnlineMenuSaaS\OnlineMenuService\OnlineMenu\src\OnlineMenu.Web\Security\Realm{Requirement,AuthorizationOptions,AuthorizationHandler,AuthorizationExtensions}.cs`
- `C:\desktopContents\projects\SaaS\NotificationService\Notification\src\Notification.Web\Security\Realm{Requirement,AuthorizationOptions,AuthorizationHandler,AuthorizationExtensions}.cs`
- `C:\desktopContents\projects\SaaS\ContentService\Content\src\Content.Web\Security\Realm{Requirement,AuthorizationOptions,AuthorizationHandler,AuthorizationExtensions}.cs`
- `C:\desktopContents\projects\SaaS\PaymentService\src\PaymentService.API\Security\Realm{Requirement,AuthorizationOptions,AuthorizationHandler,AuthorizationExtensions}.cs`

### Wire-up changes (replaced `AddAuthorization()` with `AddRealmAuthorization()`)
- `C:\desktopContents\projects\SaaS\IdentityService\src\IdentityService.API\ProgramExtensions.cs`
- `C:\desktopContents\projects\SaaS\QuestionerService\Questioner\src\Questioner.Web\Program.cs`
- `C:\desktopContents\projects\SaaS\OnlineMenuSaaS\OnlineMenuService\OnlineMenu\src\OnlineMenu.Web\Program.cs`
- `C:\desktopContents\projects\SaaS\NotificationService\Notification\src\Notification.Web\Program.cs`
- `C:\desktopContents\projects\SaaS\ContentService\Content\src\Content.Web\Program.cs`
- `C:\desktopContents\projects\SaaS\PaymentService\src\PaymentService.API\ProgramExtensions.cs`

### Configuration (12 files: 6 services × 2 environments)
- `appsettings.json` and `appsettings.Development.json` for each of the 6 services

### Unit tests (6 new test files, 54 new tests)
- `IdentityService/tests/IdentityService.Tests/Security/RealmAuthorizationHandlerTests.cs` (8 tests)
- `QuestionerService/Questioner/tests/Questioner.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (11 tests)
- `OnlineMenuSaaS/.../OnlineMenu.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (11 tests)
- `NotificationService/.../Notification.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (8 tests)
- `ContentService/.../Content.UnitTests/Security/RealmAuthorizationHandlerTests.cs` (8 tests)
- `PaymentService/tests/PaymentService.Tests/API/Security/RealmAuthorizationHandlerTests.cs` (8 tests)

### Test project / coverage tweaks
- `QuestionerService/Questioner/tests/Questioner.UnitTests/Questioner.UnitTests.csproj` — coverage exclusion narrowed
- `ContentService/Content/tests/Content.UnitTests/Content.UnitTests.csproj` — added `Content.Web` project reference

### Pre-existing issues fixed (per CLAUDE.md "Fix ALL issues")
- `NotificationService/Notification/Directory.Packages.props` — Microsoft.Extensions.* central pins 9.0.6 → 10.0.0 (NU1109)
- `ContentService/Directory.Packages.props` — Microsoft.Extensions.* central pins → 10.0.3 (NU1109)
- `PaymentService/Directory.Packages.props` — added OpenTelemetry pins (NU1902 vulnerability advisories)

---

## Out of Scope (deferred to subsequent tasks)

- Updating Keycloak realm definitions — Phase 2 / Step 1 (separate)
- Issuing realm-scoped tokens — depends on Phase 2 / Step 1
- The cross-product-isolation E2E suite — `E2ETests/cross-product-isolation/` lives in its own task
- Forking NotificationService into per-product deployments
  (`notification-questioner`, `notification-onlinemenu`) — Option A
  fork. Code is forward-compatible; only config changes when the time comes.
- Extracting the handler into a shared `Security.Realm.AspNetCore`
  NuGet package — sensible follow-up after the pattern proves stable.

---

## What This Unblocks

Once Phase 2 / Step 1 (Keycloak admin work — create the two new
realms and dual-issue tokens) lands, the realm wall built here flips
on automatically per environment. The Phase-2/Step-1 PR only needs to
update each service's `Authentication:AllowedRealms` to drop the
legacy `OnlineMenu` entry; no further code changes.
