# Backend: Fix 13 Code Review Issues (Storage.S3 + CQRS)

## Problem Statement
Code reviews of the IdentityService Privacy (GDPR) feature identified 13 architectural and code quality issues spanning Clean Architecture violations, missing CQRS patterns, unnecessary wrappers, and inconsistent API conventions.

## Priority Issues (13 total)

### HIGH
1. UseCases -> Infrastructure dependency (Clean Architecture violation)
2. DownloadDataExport endpoint contains 35+ lines of business logic (needs CQRS handler)
3. AssembleExportZip in Infrastructure layer (should be UseCases)

### MEDIUM
4. Delete StorageServiceExtensions wrapper
5. IS3StorageService lifetime (Scoped -> Singleton)
6. Fragile bucket/key string parsing (add BucketName + S3Key to entity)
7. ISender -> IMediator across all Privacy endpoints
8. Raw StatusCode -> FastEndpoints helpers
9. Hardcoded API route in RequestAccountDeletionHandler
10. GlobalUsings.cs needs DomainCore usings

### LOW
11. ServiceResponseEntry in wrong file (move to Core/Entities)
12. UpdateConsentCommand returns Result<bool> (should be Result)
13. Reflection in GetConsentHandlerTests

## Affected Files
- IdentityService.UseCases.csproj, IdentityService.Core.csproj
- All 7 Privacy endpoints
- All Privacy handlers
- DataExportAggregatorConsumer
- StorageServiceExtensions.cs (deleted)
- ProgramExtensions.cs
- DataExportRequest entity
- S3ServiceExtensions.cs (NuGet)
- Multiple test files

## Implementation Summary

### Issue 1 (HIGH): Clean Architecture Layer Fix
- Created `IPrivacyDbContext` interface in `IdentityService.Core/Interfaces/`
- Removed `ProjectReference` from UseCases -> Infrastructure
- All handlers now depend on `IPrivacyDbContext` abstraction instead of `IdentityDbContext`
- Added `UnfilteredSet<T>()` to interface for bypassing tenant query filters

### Issue 2 (HIGH): DownloadDataExport CQRS
- Created `DownloadDataExportQuery` and `DownloadDataExportHandler`
- Endpoint is now thin -- delegates all logic to handler

### Issue 3 (HIGH): AssembleExportZip Moved to UseCases
- Created `AssembleDataExportCommand` and `AssembleDataExportHandler`
- DataExportAggregatorConsumer now sends command via MediatR

### Issue 4 (MEDIUM): Deleted StorageServiceExtensions Wrapper
- Removed unnecessary wrapper; ProgramExtensions.cs calls `AddS3Storage` directly

### Issue 5 (MEDIUM): S3 Service Lifetime
- Changed from `AddScoped` to `AddSingleton` in S3ServiceExtensions.cs

### Issue 6 (MEDIUM): BucketName + S3Key on Entity
- Added `BucketName` and `S3Key` properties to `DataExportRequest` entity
- Configured column max lengths in DbContext
- AssembleDataExportHandler sets both properties

### Issue 7 (MEDIUM): ISender -> IMediator
- All 7 Privacy endpoints updated to use `IMediator`

### Issue 8 (MEDIUM): FastEndpoints Helpers
- Replaced raw `HttpContext.Response.StatusCode = 401` with `await Send.UnauthorizedAsync(ct)`
- Replaced raw `HttpContext.Response.StatusCode = 404` with `await Send.NotFoundAsync(ct)`

### Issue 9 (MEDIUM): Hardcoded Route Fix
- RequestAccountDeletionCommand now takes `ConfirmationUrlTemplate` parameter
- Endpoint builds template from route constant with `{requestId}` and `{token}` placeholders

### Issue 10 (MEDIUM): GlobalUsings
- Added `global using DomainCore.Entities;` and `global using DomainCore.Interfaces;`

### Issue 11 (LOW): ServiceResponseEntry
- Moved from consumer file to `IdentityService.Core/Entities/ServiceResponseEntry.cs`

### Issue 12 (LOW): UpdateConsentCommand Result Type
- Changed from `IRequest<Result<bool>>` to `IRequest<Result>`

### Issue 13 (LOW): Test Reflection Removed
- GetConsentHandlerTests no longer uses reflection for CreatedDate

## Verification Results
- [x] identity-lint passes
- [x] identity-unit-tests passes (all tests green)
- [x] identity-yagni passes (no unused code warnings)
- [x] identity-api builds and runs (container healthy)
- [x] No Clean Architecture layer violations
- [x] All endpoints use IMediator + FastEndpoints helpers

## Status: COMPLETED
