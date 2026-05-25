# Task: Extract Privacy Endpoints to CQRS with MediatR + Ardalis.Result

## Problem Statement

The IdentityService Privacy endpoints contained all business logic directly in the endpoint `HandleAsync` methods, violating Clean Architecture layer separation. This task extracted the business logic from 7 Privacy endpoints (excluding DownloadDataExport which is owned by Phase 1 agent) into a new `IdentityService.UseCases` project following CQRS patterns established in QuestionerService and NotificationService.

## Scope

### New Project: `IdentityService.UseCases`

Created the application layer with:
- 4 Commands: UpdateConsent, RequestDataExport, RequestAccountDeletion, ConfirmAccountDeletion, CancelAccountDeletion
- 2 Queries: GetConsent, GetDataExportStatus
- 7 Handlers with extracted business logic
- 6 DTOs for API responses
- AssemblyMarker for MediatR scanning

### Endpoints Extracted (7 of 8)

1. **GetConsent** (Query) - Get consent preferences for authenticated user
2. **UpdateConsent** (Command) - Update consent preferences (audit trail)
3. **RequestDataExport** (Command) - Create GDPR data export request + publish event
4. **GetDataExportStatus** (Query) - Get status of a data export request
5. **RequestAccountDeletion** (Command) - Create deletion request + email confirmation
6. **ConfirmAccountDeletion** (Command) - Confirm deletion via email token (anonymous)
7. **CancelAccountDeletion** (Command) - Cancel pending/confirmed deletion

### SKIPPED: DownloadDataExport - Phase 1 agent owns this endpoint

## Changes Made

### New Files Created
- `IdentityService/src/IdentityService.UseCases/IdentityService.UseCases.csproj`
- `IdentityService/src/IdentityService.UseCases/AssemblyMarker.cs`
- `IdentityService/src/IdentityService.UseCases/GlobalUsings.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/ConsentItemDto.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/DataExportStatusDto.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/DataExportRequestedDto.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/AccountDeletionRequestedDto.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/AccountDeletionConfirmedDto.cs`
- `IdentityService/src/IdentityService.UseCases/DTOs/AccountDeletionCancelledDto.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/Consent/GetConsent/GetConsentQuery.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/Consent/GetConsent/GetConsentHandler.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/Consent/UpdateConsent/UpdateConsentCommand.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/Consent/UpdateConsent/UpdateConsentHandler.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/DataExport/RequestDataExport/RequestDataExportCommand.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/DataExport/RequestDataExport/RequestDataExportHandler.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/DataExport/GetDataExportStatus/GetDataExportStatusQuery.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/DataExport/GetDataExportStatus/GetDataExportStatusHandler.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/AccountDeletion/RequestAccountDeletion/RequestAccountDeletionCommand.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/AccountDeletion/RequestAccountDeletion/RequestAccountDeletionHandler.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/AccountDeletion/ConfirmAccountDeletion/ConfirmAccountDeletionCommand.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/AccountDeletion/ConfirmAccountDeletion/ConfirmAccountDeletionHandler.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/AccountDeletion/CancelAccountDeletion/CancelAccountDeletionCommand.cs`
- `IdentityService/src/IdentityService.UseCases/Privacy/AccountDeletion/CancelAccountDeletion/CancelAccountDeletionHandler.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/GetConsentHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/UpdateConsentHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/RequestDataExportHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/GetDataExportStatusHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/RequestAccountDeletionHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/ConfirmAccountDeletionHandlerTests.cs`
- `IdentityService/tests/IdentityService.Tests/Privacy/Handlers/CancelAccountDeletionHandlerTests.cs`

### Files Modified
- `IdentityService/IdentityService.sln` - Added UseCases project
- `IdentityService/Directory.Packages.props` - Added MediatR, Ardalis.Result, Microsoft.EntityFrameworkCore versions
- `IdentityService/src/IdentityService.API/IdentityService.API.csproj` - Added UseCases + MediatR refs
- `IdentityService/src/IdentityService.API/ProgramExtensions.cs` - Added MediatR registration
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/GetConsent.cs` - Thin endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/UpdateConsent.cs` - Thin endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/RequestDataExport.cs` - Thin endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/GetDataExportStatus.cs` - Thin endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/RequestAccountDeletion.cs` - Thin endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/ConfirmAccountDeletion.cs` - Thin endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/CancelAccountDeletion.cs` - Thin endpoint
- `IdentityService/tests/IdentityService.Tests/IdentityService.Tests.csproj` - Added UseCases + Ardalis.Result refs

## Verification Results

- [x] identity-lint: OK
- [x] identity-unit-tests: OK (119 tests pass)
- [x] identity-yagni: OK
- [x] identity-api: OK (container builds and runs)

## Status: COMPLETED
