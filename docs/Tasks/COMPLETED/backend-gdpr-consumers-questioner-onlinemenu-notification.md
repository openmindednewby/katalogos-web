# GDPR Consumers: QuestionerService, OnlineMenuSaaS, NotificationService

> **Status**: COMPLETED
> **Started**: 2026-03-13
> **Author**: backend-dev
> **Parent Task**: gdpr-compliance.md
> **Scope**: Backend (Phase 2 - Sections 7.3, 7.4, 7.6)

---

## Problem Statement

Add GDPR-mandated `UserDeletedConsumer` and `UserDataExportConsumer` to three services that already have RabbitMQ/MassTransit configured: QuestionerService, OnlineMenuSaaS, and NotificationService.

## Architectural Approach

Each service gets two new MassTransit consumers in its Infrastructure layer:

1. **UserDeletedConsumer** - Handles cleanup when a user account is deleted
2. **UserDataExportConsumer** - Responds with user data for GDPR data export requests

### Per-Service Cleanup

| Service | UserDeletedConsumer Actions | UserDataExportConsumer Data |
|---------|---------------------------|---------------------------|
| QuestionerService | Delete CompletedQuestioner, anonymize QuestionerTemplate.UserId | Completed questionnaires + templates |
| OnlineMenuSaaS | Delete TenantMenus by UserId | Menus created by user |
| NotificationService | Hard-delete NotificationEntity + NotificationPreference | Notification history + preferences |

## Files to Create

### QuestionerService
- `Questioner.Infrastructure/Messaging/Consumers/UserDeletedConsumer.cs`
- `Questioner.Infrastructure/Messaging/Consumers/UserDataExportConsumer.cs`
- `Questioner.UnitTests/Messaging/UserDeletedConsumerTests.cs`
- `Questioner.UnitTests/Messaging/UserDataExportConsumerTests.cs`

### OnlineMenuSaaS
- `OnlineMenu.Infrastructure/Messaging/Consumers/UserDeletedConsumer.cs`
- `OnlineMenu.Infrastructure/Messaging/Consumers/UserDataExportConsumer.cs`
- `OnlineMenu.UnitTests/Messaging/UserDeletedConsumerTests.cs`
- `OnlineMenu.UnitTests/Messaging/UserDataExportConsumerTests.cs`

### NotificationService
- `Notification.Infrastructure/Messaging/Consumers/UserDeletedConsumer.cs`
- `Notification.Infrastructure/Messaging/Consumers/UserDataExportConsumer.cs`
- `Notification.UnitTests/Messaging/UserDeletedConsumerTests.cs`
- `Notification.UnitTests/Messaging/UserDataExportConsumerTests.cs`

## Files to Modify

- 3x `Directory.Packages.props` - Add Messaging.Contracts version
- 3x Infrastructure `.csproj` - Add Messaging.Contracts + MassTransit references
- 3x Unit test `.csproj` - Add Infrastructure project reference + MassTransit
- 2x `Program.cs` (Questioner, OnlineMenu) - Add consumer registration
- 1x `Program.cs` (Notification) - Add consumer registration to existing MassTransit config

## Success Criteria

- [x] All 6 consumers compile and follow existing patterns
- [x] 12 unit test files created (covering happy path, edge cases, errors)
- [x] `{service}-lint` passes for all 3 services
- [x] `{service}-unit-tests` passes for all 3 services
- [x] `{service}-api` rebuilds successfully for all 3 services

## Completion Notes

All 6 consumers implemented across 3 services with comprehensive unit tests (26 total):
- **QuestionerService**: 8 tests (4 deleted, 4 export)
- **OnlineMenuSaaS**: 8 tests (4 deleted, 4 export)
- **NotificationService**: 10 tests (5 deleted, 5 export)

### Tilt MCP Verification (all passed)

| Service | Lint | YAGNI | Unit Tests | API Build |
|---------|------|-------|------------|-----------|
| Questioner | ok | ok | ok | ok |
| OnlineMenu | ok | ok | ok | ok |
| Notification | ok | ok | ok | ok |

### Issues Resolved During Verification

1. **Messaging.Contracts nuget.org name collision**: The `Messaging.Contracts` package on nuget.org (by IvanLavriv) is a different package from the project's private one (by DLoizides). Fixed by adding the correct nupkg to each service's `local-packages/` directory and updating `nuget.config` packageSourceMapping.
2. **MassTransit version conflict**: Removed explicit MassTransit 8.4.0 from Questioner/OnlineMenu Directory.Packages.props (conflicts with transitive 8.5.8 from Messaging.RabbitMq.Core).
3. **Messaging.Contracts version**: Updated from 1.0.0 (net8.0, no GDPR events) to 1.0.1 (net10.0, has GDPR events).
4. **SQLite gen_random_uuid()**: Registered custom SQLite function in test setup to handle PostgreSQL-specific default value generation.
5. **EF Core change tracker**: Added `.AsNoTracking()` to assertion queries after `ExecuteUpdateAsync` to bypass cached entity state.
6. **S3881 IDisposable**: Made all test classes `sealed` to satisfy SonarAnalyzer dispose pattern rule.
7. **S2699 missing assertion**: Used `Record.ExceptionAsync` + `ShouldBeNull()` for "should not throw" tests.
8. **SQLite for Notification**: Added `Microsoft.EntityFrameworkCore.Sqlite` package reference.
9. **ICurrentTenantService**: Added `using MultiTenancy.Abstractions;` to test files (global using only in Infrastructure project).

### Key Patterns

- All consumers use primary constructor injection, `IgnoreQueryFilters()`, and structured logging
- SQLite in-memory DB with `CreateFunction("gen_random_uuid")` for testing bulk EF Core operations
- `ExecuteDeleteAsync()` for hard deletes, `ExecuteUpdateAsync()` for anonymization
- NSubstitute `Arg.Do<T>()` to capture `RespondAsync` responses in export tests
