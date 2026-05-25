# Task: Create Messaging.Contracts NuGet Package

> **Status**: COMPLETED
> **Started**: 2026-03-13
> **Completed**: 2026-03-13
> **Agent**: backend-dev
> **Parent Task**: gdpr-phase2-phase3-architecture.md

---

## Problem Statement

The GDPR Phase 2 architecture requires cross-service event contracts for user deletion, data export, and deletion confirmation workflows. Currently, `NotificationService.Contracts` only holds notification-specific events (`INotificationEvent`). GDPR events are operational commands/events, not notifications, so a new shared package `Messaging.Contracts` is needed.

## Architectural Approach

Create a zero-dependency NuGet package containing plain C# record types for cross-service GDPR messaging:

1. **UserDeletedEvent** -- Published when account deletion is confirmed (IdentityService publishes, all services consume)
2. **UserDataExportRequest** -- Published by IdentityService to request user data from all services
3. **UserDataExportResponse** -- Response from each service with user data JSON
4. **DeletionConfirmationEvent** -- Triggers confirmation email via NotificationService

## Package Structure

```
NuGetPackages/Messaging.Contracts/
  .gitignore
  Directory.Build.props          -- All metadata, versioning, NuGet config
  Messaging.Contracts.sln        -- Solution file
  LICENSE                        -- MIT license
  README.md                      -- Usage docs
  BUILD.md                       -- Build/publish instructions
  publish.ps1                    -- Version bump + publish script
  src/Messaging.Contracts/
    Messaging.Contracts.csproj   -- Minimal .csproj
    Events/
      UserDeletedEvent.cs
      UserDataExportRequest.cs
      UserDataExportResponse.cs
      DeletionConfirmationEvent.cs
  tests/Messaging.Contracts.Tests/
    Messaging.Contracts.Tests.csproj
    EventTests.cs
```

## Affected Services

All 5 services will eventually reference this package:
- IdentityService (publisher)
- QuestionerService (consumer)
- OnlineMenuSaaS (consumer)
- ContentService (consumer)
- NotificationService (consumer for DeletionConfirmationEvent)

## Implementation Results

### Build
- `dotnet build` -- 0 errors, 4 warnings (source link / git repo not yet initialized -- expected)
- `dotnet pack -c Release` -- produces `Messaging.Contracts.1.0.0.nupkg` and `.snupkg`

### Tests
- 8 unit tests, all passing
- Tests cover: property setting, sealed record verification, value equality, success/failure response paths

### Design Decisions
- All events are `sealed record` types with `required` properties for compile-time safety
- `ErrorMessage` on `UserDataExportResponse` is the only nullable property (null on success)
- No `INotificationEvent` interface -- these are operational events, not notification events
- No external dependencies -- zero `PackageReference` entries in the `.csproj`
- Follows exact same structure as `NotificationService.Contracts`

## Success Criteria

- [x] Package builds successfully with `dotnet build`
- [x] All unit tests pass with `dotnet test` (8/8 passed)
- [x] Package structure matches NotificationService.Contracts conventions exactly
- [x] All C# files use UTF-8 BOM encoding (verified via hex dump)
- [x] No external dependencies (plain records only)
- [x] Targets net10.0
- [x] XML documentation enabled
- [x] Package packs successfully (1.0.0.nupkg + 1.0.0.snupkg)
