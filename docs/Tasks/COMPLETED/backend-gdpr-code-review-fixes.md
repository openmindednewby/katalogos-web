# Backend GDPR Code Review Fixes

## Status: COMPLETED

## Problem Statement
Seven code review issues identified in the GDPR backend implementation within IdentityService. Issues range from critical security concerns (cross-tenant data leaks, missing authorization) to architectural violations (business logic in endpoints, misplaced consumers) and code quality issues.

## Issues Fixed

### Issue 3 (HIGH - Security): Entity inheritance - cross-tenant data leak
- Changed AccountDeletionRequest, ConsentRecord, DataExportRequest from BaseEntity to BaseTenantEntity
- Removed manual UserId/TenantId properties (now inherited from BaseTenantEntity)
- Added ICurrentTenantService to IdentityDbContext with SetTenantFilter calls for all 3 entities
- Entity construction updated to use SetTenant()/SetUser() methods
- Consumers and background services use IgnoreQueryFilters() since they run outside HTTP context

### Issue 4 (HIGH - Security): Missing Roles() in endpoint Configure()
- Added Roles(IdentityRoles.Admin, IdentityRoles.User) to all Privacy endpoints
- ConfirmAccountDeletion stays AllowAnonymous (token-based auth) with IgnoreQueryFilters()
- Removed manual .Where(c => c.TenantId == ...) guards (global filter handles it)

### Issue 1 (HIGH - Architecture): No CQRS pattern
- DEFERRED: IdentityService has no UseCases project. All other endpoints use direct DbContext.
- Adding a UseCases project just for Privacy endpoints would be inconsistent with existing architecture.

### Issue 2 (HIGH - Architecture): Consumer/service placement
- Moved DataExportAggregatorConsumer to Infrastructure/Messaging/Consumers/
- Moved UserDeletedConsumer to Infrastructure/Messaging/Consumers/
- Moved DeletionSchedulerService to Infrastructure/BackgroundServices/
- Deleted old API/Services/ directory
- Updated ProgramExtensions.cs registrations and using directives
- Added MassTransit and Identity.Abstractions package references to Infrastructure.csproj
- Added InternalsVisibleTo for test project

### Issue 5 (MEDIUM): Local disk storage for export ZIPs
- Added TODO comment in DataExportAggregatorConsumer.AssembleExportZip noting need for shared storage

### Issue 6 (MEDIUM): ConsentTypes should be enum
- Converted static class ConsentTypes to enum ConsentType
- Updated ConsentRecord entity property type
- Added HasConversion<string>() in DbContext for DB storage compatibility
- Updated UpdateConsent endpoint to parse string to enum via Enum.TryParse
- Updated validator to use Enum.TryParse for validation

### Issue 7 (LOW): Magic constant
- Moved maxUserAgentLength const to class-level private const MaxUserAgentLength

## Files Modified (23 total)

### Core Layer
- `IdentityService.Core/Entities/AccountDeletionRequest.cs`
- `IdentityService.Core/Entities/ConsentRecord.cs`
- `IdentityService.Core/Entities/DataExportRequest.cs`
- `IdentityService.Core/Enums/ConsentTypes.cs` (renamed to ConsentType enum)

### Infrastructure Layer
- `IdentityService.Infrastructure/Data/IdentityDbContext.cs`
- `IdentityService.Infrastructure/IdentityService.Infrastructure.csproj`
- `IdentityService.Infrastructure/Messaging/Consumers/DataExportAggregatorConsumer.cs` (NEW)
- `IdentityService.Infrastructure/Messaging/Consumers/UserDeletedConsumer.cs` (NEW)
- `IdentityService.Infrastructure/BackgroundServices/DeletionSchedulerService.cs` (NEW)

### API Layer
- `IdentityService.API/ProgramExtensions.cs`
- `IdentityService.API/Endpoints/Privacy/CancelAccountDeletion.cs`
- `IdentityService.API/Endpoints/Privacy/ConfirmAccountDeletion.cs`
- `IdentityService.API/Endpoints/Privacy/DownloadDataExport.cs`
- `IdentityService.API/Endpoints/Privacy/GetConsentSettings.cs`
- `IdentityService.API/Endpoints/Privacy/GetDataExportStatus.cs`
- `IdentityService.API/Endpoints/Privacy/RequestAccountDeletion.cs`
- `IdentityService.API/Endpoints/Privacy/RequestDataExport.cs`
- `IdentityService.API/Endpoints/Privacy/UpdateConsent.cs`
- `IdentityService.API/Endpoints/Privacy/UpdateConsent.Validator.cs`

### Deleted Files
- `IdentityService.API/Services/DataExportAggregatorConsumer.cs`
- `IdentityService.API/Services/UserDeletedConsumer.cs`
- `IdentityService.API/Services/DeletionSchedulerService.cs`

### Test Files
- `IdentityService.Tests/DataExportAggregatorConsumerTests.cs`
- `IdentityService.Tests/DeletionSchedulerServiceTests.cs`
- `IdentityService.Tests/GdprEntityTests.cs`
- `IdentityService.Tests/PrivacyValidatorTests.cs`
- `IdentityService.Tests/UserDeletedConsumerTests.cs`

## Verification Results

| Check | Result |
|-------|--------|
| identity-lint | PASS |
| identity-unit-tests | PASS (89 tests, 0 failures) |
| identity-yagni | PASS |
| identity-api | PASS (container rebuilt successfully) |

## Completion Date
2026-03-13
