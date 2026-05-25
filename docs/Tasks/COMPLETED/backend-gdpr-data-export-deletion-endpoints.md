# Backend GDPR Data Export & Account Deletion Endpoints

> **Status**: COMPLETED
> **Started**: 2026-03-13
> **Completed**: 2026-03-13
> **Author**: backend-dev
> **Parent Task**: gdpr-compliance.md
> **Scope**: IdentityService - Data Export Endpoints, Account Deletion Endpoints, Background Services

---

## Problem Statement

Implement GDPR Phase 2 data rights endpoints and background services in IdentityService:
1. Data export endpoints (request, status check, download)
2. Account deletion endpoints (request, confirm, cancel)
3. Background services (data export aggregation, deletion scheduler, user deleted consumer)

## Architectural Approach

- Follow existing FastEndpoints patterns from Privacy/GetConsent.cs and Privacy/UpdateConsent.cs
- Use primary constructor injection per codebase conventions
- Use IBus (MassTransit) for publishing operational events (not INotificationEventPublisher)
- Add Messaging.Contracts package references for cross-service event types
- Register consumers via AddRabbitMqMessaging configureConsumers parameter

## Files Created

### Endpoints (Part 1 - Data Export)
- `src/IdentityService.API/Endpoints/Privacy/RequestDataExport.cs` - POST /api/privacy/data-export
- `src/IdentityService.API/Endpoints/Privacy/GetDataExportStatus.cs` - GET /api/privacy/data-export/{requestId}
- `src/IdentityService.API/Endpoints/Privacy/DownloadDataExport.cs` - GET /api/privacy/data-export/{requestId}/download

### Endpoints (Part 2 - Account Deletion)
- `src/IdentityService.API/Endpoints/Privacy/RequestAccountDeletion.cs` - POST /api/privacy/delete-request
- `src/IdentityService.API/Endpoints/Privacy/RequestAccountDeletion.Validator.cs` - FluentValidation (Reason max 1000 chars)
- `src/IdentityService.API/Endpoints/Privacy/ConfirmAccountDeletion.cs` - POST /api/privacy/delete-request/{requestId}/confirm (AllowAnonymous)
- `src/IdentityService.API/Endpoints/Privacy/ConfirmAccountDeletion.Validator.cs` - FluentValidation (ConfirmationToken required)
- `src/IdentityService.API/Endpoints/Privacy/CancelAccountDeletion.cs` - DELETE /api/privacy/delete-request/{requestId}

### Background Services (Part 3)
- `src/IdentityService.API/Services/DataExportAggregatorConsumer.cs` - MassTransit consumer for UserDataExportResponse, scatter-gather aggregation, ZIP assembly
- `src/IdentityService.API/Services/DeletionSchedulerService.cs` - BackgroundService with 1h PeriodicTimer, processes confirmed+due deletions
- `src/IdentityService.API/Services/UserDeletedConsumer.cs` - MassTransit consumer for UserDeletedEvent, cleanup of ConsentRecords, DataExportRequests, AccountDeletionRequests

### Tests (84 total, all passing)
- `tests/IdentityService.Tests/DataExportAggregatorConsumerTests.cs` - 6 tests (deserialization, expected services, consume behavior)
- `tests/IdentityService.Tests/DeletionSchedulerServiceTests.cs` - 6 tests (no-op, not-yet-due, due processing, multiple, Keycloak failure, pending confirmation)
- `tests/IdentityService.Tests/UserDeletedConsumerTests.cs` - 6 tests (no data, consent cleanup, export cleanup, deletion cleanup, all data types)
- `tests/IdentityService.Tests/PrivacyValidatorTests.cs` - 6 tests (reason null/empty/within limit/exceeds limit, token empty/provided)
- `tests/IdentityService.Tests/GdprEntityTests.cs` - 10 tests (entity defaults, enum values, nullable fields)

### Files Modified
- `src/IdentityService.API/ProgramExtensions.cs` - Registered DataExportAggregatorConsumer, UserDeletedConsumer, DeletionSchedulerService
- `src/IdentityService.API/IdentityService.API.csproj` - Added Messaging.Contracts package reference
- `src/IdentityService.Infrastructure/IdentityService.Infrastructure.csproj` - Added Messaging.Contracts package reference
- `tests/IdentityService.Tests/IdentityService.Tests.csproj` - Added MassTransit, Messaging.Contracts, EF Core InMemory
- `Directory.Packages.props` - Added package versions for Messaging.Contracts, MassTransit, EF Core InMemory
- `nuget.config` - Added Messaging.Contracts to LocalOnlineMenuFeed source mapping
- `local-packages/` - Added Messaging.Contracts.1.0.1.nupkg

## Key Decisions & Patterns

- **FastEndpoints response pattern**: Used `HttpContext.Response.StatusCode` directly (not `SendNotFoundAsync`/`SendErrorsAsync`) per existing GetConsent.cs pattern
- **Cryptographic token generation**: `RandomNumberGenerator.GetBytes(32)` with base64url encoding for confirmation tokens
- **InMemory DB testing**: Database name captured outside lambda to ensure all scoped DbContext instances share the same store
- **IDisposable on test classes**: Marked as `sealed` to satisfy SonarAnalyzer S3881

## Verification Results (All Passed)

- [x] `identity-lint` - ok
- [x] `identity-yagni` - ok (no unused code detected)
- [x] `identity-unit-tests` - ok (84 tests, 0 failures)
- [x] `identity-api` - ok (container rebuilt successfully)
