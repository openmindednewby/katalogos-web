# Phase 1 Cleanup — Test Coverage Gap

## Status
COMPLETED — 2026-05-01

## Problem Statement
Two NuGet packages were shipped without unit test projects:
- `Branding.AspNetCore@1.0.1` — no tests at all
- `Security.Claims@1.5.0` — empty `tests/` directory; new `RealmExtensions` plus existing `ClaimsPrincipalExtensions`, `ClaimsExtensions`, `OnlineMenuClaimTypes`, `OnlineMenuRoles` had zero coverage

## Outcome

### Branding.AspNetCore.Tests
- Path: `NuGetPackages/Branding.AspNetCore/tests/Branding.AspNetCore.Tests/`
- Test files: 5 (BrandingOptions, BuiltByHeaderMiddleware, BrandingExtensions, SwaggerBrandingExtensions, BrandingHealthCheckPayload)
- Test count: **46**
- Coverage on source: **100% line / 100% branch** (66/66 lines, 10/10 branches)
- All tests pass on `dotnet test -c Release`

### Security.Claims.Tests
- Path: `NuGetPackages/Security.Claims/tests/Security.Claims.Tests/`
- Test files: 5 (RealmExtensions, ClaimsPrincipalExtensions, ClaimsExtensions, OnlineMenuClaimTypes, OnlineMenuRoles)
- Test count: **77**
- Coverage on source: **100% line / 100% branch** (38/38 lines, 24/24 branches)
- `ClaimsExtensions` is `internal` — tests use reflection to reach the `FindFirstValue` helper rather than modifying source to add `InternalsVisibleTo`
- All tests pass on `dotnet test -c Release`

## Versions published
- `Branding.AspNetCore` 1.0.1 → **1.0.2** (live on nuget.org)
- `Security.Claims` 1.5.0 → **1.5.1** (live on nuget.org)

Both pushed via the existing `publish.ps1 -Bump patch -ApiKey ...` workflow which also auto-bumped `Directory.Build.props`. Solution files updated to register the new test projects so `dotnet build <sln>` covers both source and tests.

## Consumer service updates
Bumped both packages in 6 `Directory.Packages.props` files:
- `IdentityService/Directory.Packages.props`
- `QuestionerService/Questioner/Directory.Packages.props`
- `OnlineMenuSaaS/OnlineMenuService/OnlineMenu/Directory.Packages.props`
- `ContentService/Directory.Packages.props`
- `NotificationService/Notification/Directory.Packages.props`
- `PaymentService/Directory.Packages.props`

Verified each service's API project builds cleanly against the new versions:
- IdentityService — `dotnet build` succeeds
- Questioner.Web — `dotnet build` succeeds
- OnlineMenu.Web — `dotnet build` succeeds
- Content.Web — `dotnet build` succeeds
- Notification.Web — `dotnet build` succeeds
- PaymentService.API — `dotnet build` succeeds

## Deviations
- `ClaimsExtensions` is `internal` and the package does not declare `InternalsVisibleTo`. Rather than modify source, the test reaches it via reflection — pragmatic and additive only.
- A pre-existing `NU1109` package downgrade error exists in `QuestionerService/tests/Questioner.AspireTests` (Aspire 9.4.1 wants `Microsoft.Extensions.Http.Resilience >= 9.7.0`, central version pins 9.6.0). This is unrelated to the Branding/Security bumps and was not introduced by this work; flagged but not fixed in this task to keep scope tight.
- Test files use 4-space indent and UTF-8 (no BOM) — matching the local convention of the existing `NuGetPackages/*` source files. The "BOM required" rule from the root CLAUDE.md applies to `Services/` projects (which carry their own `.editorconfig` mandating it); the NuGet package directories do not have an `.editorconfig` and existing source there does not use BOM. `dotnet format --verify-no-changes` reports no issues for either solution.

## Verification commands
```
# Branding.AspNetCore
cd NuGetPackages/Branding.AspNetCore
dotnet test tests/Branding.AspNetCore.Tests/Branding.AspNetCore.Tests.csproj -c Release --collect:"XPlat Code Coverage"
# 46/46 passed, line-rate=1, branch-rate=1

# Security.Claims
cd NuGetPackages/Security.Claims
dotnet test tests/Security.Claims.Tests/Security.Claims.Tests.csproj -c Release --collect:"XPlat Code Coverage"
# 77/77 passed, line-rate=1, branch-rate=1
```
