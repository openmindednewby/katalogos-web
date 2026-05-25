# Input Validation Pipeline (FluentValidation)

> **Status**: COMPLETED
> **Priority**: P0 - Security
> **Started**: 2026-03-12
> **Completed**: 2026-03-12
> **Scope**: All 5 backend services

---

## Decision Log

- **Shared NuGet package**: `DLoizides.Validation` v1.0.1 on nuget.org (namespace: `Validation.Defaults`, directory: `NuGetPackages/Validation.Defaults/`)
- **Validator base class**: `AbstractValidator<T>` (matching existing OnlineMenu pattern)
- **Scope**: All 5 services at once, parallel agents
- **TenantId validation**: Stays in multi-tenancy middleware, NOT in validators
- **Library**: FluentValidation 12.0.0 (transitive from FastEndpoints 7.0.1)
- **Docker packaging**: `local-packages/` dir in each service with .nupkg, referenced via nuget.config (fallback until nuget.org propagation)
- **Package rename history**: `Validation.FluentValidation` → `Validation.Defaults` (directory rename) → PackageId `OnlineMenu.Validation` (nuget.org prefix reservation) → PackageId `DLoizides.Validation` (final, more generic prefix)

---

## Phase 0: Shared Package (DONE)

- [x] Created `NuGetPackages/Validation.Defaults/` (PackageId: `DLoizides.Validation`)
- [x] `Rules/GuidValidationExtensions.cs` — `.NotEmptyGuid()`
- [x] `Rules/HexColorValidationExtensions.cs` — `.ValidHexColor()`
- [x] `Rules/PaginationValidationExtensions.cs` — `.ValidPageNumber()`, `.ValidPageSize()`, `.ValidSkip()`
- [x] `Rules/StringValidationExtensions.cs` — `.ValidUrl()`, `.ValidEmail()`
- [x] `Constants/ValidationLimits.cs` — field length limits
- [x] Published to nuget.org as `DLoizides.Validation` v1.0.1
- [x] GitHub repo: `openmindednewby/DLoizides.Validation`
- [x] Updated `publish-all.ps1` dependency order
- [x] Copied .nupkg to all 5 service `local-packages/` dirs

## Phase 1: Service Validators (DONE)

- [x] Audited all endpoints across 5 services (5 parallel explorer agents)
- [x] IdentityService: 13 validators + migrated inline validation from 5 endpoints
- [x] OnlineMenuService: 1 enhanced + 1 new validator
- [x] QuestionerService: 4 validators
- [x] ContentService: 3 validators + migrated inline validation from RequestUploadUrlHandler
- [x] NotificationService: 2 validators (incl. QuietHours conditional logic)

## Phase 2: Quality Gates (DONE)

- [x] All 5 services lint pass
- [x] All 5 services YAGNI pass
- [x] All 5 services unit tests pass
- [x] All 5 API containers rebuild successfully
- [x] E2E health tests pass
- [x] E2E identity tests pass
- [x] E2E questioner tests pass
- [x] E2E online-menus-crud tests pass
- [x] E2E content tests pass
- [x] E2E notification tests pass

---

## Files Changed

### New Package
- `NuGetPackages/Validation.Defaults/` (PackageId: `DLoizides.Validation` — Directory.Build.props, .csproj, Rules/, Constants/, LICENSE, README, BUILD.md, publish.ps1)

### IdentityService (22 files)
- `Directory.Packages.props` — added DLoizides.Validation 1.0.1
- `nuget.config` — local-packages feed with DLoizides.Validation pattern
- `Dockerfile` — COPY local-packages/
- `local-packages/DLoizides.Validation.1.0.1.nupkg`
- `src/IdentityService.API/IdentityService.API.csproj` — added PackageReference
- 13 new validator files in `Endpoints/Auth/`, `Endpoints/Tenants/`, `Endpoints/Users/`, `Endpoints/LogIngestion/`
- 5 endpoint files edited (removed inline validation): Logout, Refresh, SendOtp, VerifyOtp, UpdateTenantTheme
- `tests/IdentityService.Tests/ThemeColorValidationTests.cs` — rewritten to test new validator

### OnlineMenuService (5 files)
- `Directory.Packages.props` — added DLoizides.Validation 1.0.1
- `nuget.config` — added local-packages feed
- `Dockerfile` — COPY local-packages/
- `local-packages/DLoizides.Validation.1.0.1.nupkg`
- `OnlineMenu.Web.csproj` — added PackageReference
- `TenantMenus/Create.TenantMenusValidator.cs` — enhanced with MaxLength
- `TenantMenus/Update.Validator.cs` — new

### QuestionerService (7 files)
- `Directory.Packages.props` — added DLoizides.Validation 1.0.1
- `nuget.config` — added local-packages feed
- `Dockerfile` — COPY local-packages/
- `local-packages/DLoizides.Validation.1.0.1.nupkg`
- `Questioner.Web.csproj` — added PackageReference
- 4 new validator files in `CompletedQuestioners/` and `QuestionerTemplates/`

### ContentService (8 files)
- `Directory.Packages.props` — added DLoizides.Validation 1.0.1
- `nuget.config` — added local-packages feed
- `Dockerfile` — COPY local-packages/
- `local-packages/DLoizides.Validation.1.0.1.nupkg`
- `Content.Web.csproj` — added PackageReference
- 3 new validator files: RequestUploadUrl, CompleteUpload, ListContent
- `Content.UseCases/Upload/RequestUploadUrlHandler.cs` — removed inline validation
- `tests/Content.UnitTests/UseCases/RequestUploadUrlHandlerTests.cs` — removed 2 tests for migrated validation

### NotificationService (5 files)
- `Directory.Packages.props` — added DLoizides.Validation 1.0.1
- `nuget.config` — added local-packages feed
- `Dockerfile` — COPY local-packages/
- `local-packages/DLoizides.Validation.1.0.1.nupkg`
- `Notification.Web.csproj` — added PackageReference
- 2 new validator files: List, UpdatePreferences

### Other
- `NuGetPackages/publish-all.ps1` — added Validation.Defaults to publish order (PackageId: DLoizides.Validation)
