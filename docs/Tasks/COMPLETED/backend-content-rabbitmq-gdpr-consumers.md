# Task: Add RabbitMQ Messaging to ContentService with GDPR Consumers

> **Status**: COMPLETED
> **Started**: 2026-03-13
> **Completed**: 2026-03-13
> **Agent**: backend-dev
> **Parent Task**: gdpr-phase2-phase3-architecture.md (sections 3.5, 7.5)

---

## Problem Statement

ContentService had NO RabbitMQ integration. For GDPR compliance (Phase 2), it needed to:
1. Consume `UserDeletedEvent` to soft-delete all content items for deleted users
2. Consume `UserDataExportRequest` to export all user content metadata for data portability

## Implementation Summary

### Infrastructure Changes
- Added `Messaging.RabbitMq.Core` 1.0.2 to `Content.Web.csproj` (provides MassTransit + RabbitMQ setup)
- Added `Messaging.Contracts` 1.0.1 and `MassTransit` 8.4.0 to `Content.Infrastructure.csproj`
- Added `MassTransit` 8.4.0 to `Content.UnitTests.csproj` for test mocking
- Registered consumers in `Program.cs` via `AddRabbitMqMessaging()` extension
- Added `RabbitMq` configuration section to `appsettings.json`
- Added RabbitMQ environment variables to `docker-compose.yml`
- Bumped `Messaging.Contracts` from 1.0.0 to 1.0.1 (rebuilt for net10.0 TFM)
- Added `Messaging.Contracts.1.0.1.nupkg` to `local-packages/` for Docker builds
- Updated `nuget.config` to serve `Messaging.Contracts` from local feed

### Consumer Implementations
1. **UserDeletedConsumer**: Queries all `ContentItem` entities by `UserId`, skips already-deleted items, calls `Delete()` + `UpdateAsync()` for each. Uses primary constructor injection.
2. **UserDataExportConsumer**: Queries all `ContentItem` entities by `UserId`, maps to `ContentExportDto`, serializes to JSON, responds via `context.RespondAsync()`. Handles exceptions by responding with error response instead of throwing.

### Unit Tests (9 tests total)
- `UserDeletedConsumerTests` (4 tests): happy path, no items, already-deleted items skipped, mixed statuses
- `UserDataExportConsumerTests` (5 tests): has content, no content, repository throws, multiple items count, valid JSON structure

## Files Created
- `ContentService/Content/src/Content.Infrastructure/Messaging/Consumers/UserDeletedConsumer.cs`
- `ContentService/Content/src/Content.Infrastructure/Messaging/Consumers/UserDataExportConsumer.cs`
- `ContentService/Content/tests/Content.UnitTests/Messaging/UserDeletedConsumerTests.cs`
- `ContentService/Content/tests/Content.UnitTests/Messaging/UserDataExportConsumerTests.cs`

## Files Modified
- `ContentService/Content/src/Content.Web/Content.Web.csproj`
- `ContentService/Content/src/Content.Infrastructure/Content.Infrastructure.csproj`
- `ContentService/Content/src/Content.Web/appsettings.json`
- `ContentService/Content/src/Content.Web/Program.cs`
- `ContentService/docker-compose.yml`
- `ContentService/Directory.Packages.props`
- `ContentService/nuget.config`
- `ContentService/Content/tests/Content.UnitTests/Content.UnitTests.csproj`
- `NuGetPackages/Messaging.Contracts/Directory.Build.props` (version bump to 1.0.1)

## Verification Results
- [x] content-lint: PASSED
- [x] content-yagni: PASSED
- [x] content-unit-tests: PASSED
- [x] content-api: PASSED (container builds and runs)
- [x] Consumers follow existing patterns (NSubstitute, Shouldly, AAA)
- [x] UTF-8 BOM on all new .cs files
- [x] Primary constructor injection used in both consumers
- [x] SonarAnalyzer S1067 compliant (no complex inline conditions)
