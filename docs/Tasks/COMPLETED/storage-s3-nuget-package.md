# Task: Storage.S3 NuGet Package + IdentityService Integration

## Status: COMPLETED

## Problem Statement

The IdentityService's GDPR data export (DataExportAggregatorConsumer) currently writes ZIP files to local temp storage via `Path.GetTempPath()`. This breaks in multi-instance deployment behind a load balancer since the ZIP is local to one container. We need to replace this with S3-compatible storage (SeaweedFS).

ContentService already has a working S3 integration, but it is service-specific. We need to extract a shared `Storage.S3` NuGet package for reuse across services.

## Architectural Approach

1. **Created `NuGetPackages/Storage.S3/`** -- shared NuGet package with:
   - `IS3StorageService` interface (upload stream, download stream, presigned URLs, exists, delete)
   - `S3StorageService` implementation using AWSSDK.S3
   - `StorageSettings` configuration POCO
   - `S3ServiceExtensions` DI registration extension method
   - 15 unit tests (all passing)

2. **Integrated with IdentityService**:
   - Added Storage.S3 package reference to Infrastructure.csproj
   - Updated DataExportAggregatorConsumer to use S3 instead of local temp files
   - Updated DownloadDataExport endpoint to redirect to presigned URL (302)
   - Added S3 env vars to docker-compose.yml
   - Created StorageServiceExtensions.cs with TODO for ProgramExtensions.cs wiring
   - Added gdpr-exports bucket to SeaweedFS init in ContentService docker-compose

## Files Created

### NuGet Package (NuGetPackages/Storage.S3/)
- `Directory.Build.props` -- Package metadata, versioning (1.0.0)
- `.gitignore` -- Standard .NET gitignore
- `LICENSE` -- MIT
- `README.md` -- Quick start and API reference
- `publish.ps1` -- Version bump + pack + push script
- `src/Storage.S3/Storage.S3.csproj` -- Minimal csproj with AWSSDK.S3 dependency
- `src/Storage.S3/IS3StorageService.cs` -- Interface with 6 methods
- `src/Storage.S3/S3StorageService.cs` -- Implementation with URL rewriting for Docker
- `src/Storage.S3/StorageSettings.cs` -- Configuration POCO (ServiceUrl, ExternalServiceUrl, AccessKey, SecretKey, Region)
- `src/Storage.S3/S3ServiceExtensions.cs` -- DI extension method: AddS3Storage()
- `tests/Storage.S3.Tests/Storage.S3.Tests.csproj` -- Test project
- `tests/Storage.S3.Tests/S3StorageServiceTests.cs` -- 15 unit tests

### IdentityService Integration
- `src/IdentityService.Infrastructure/Storage/StorageServiceExtensions.cs` -- DI extension with TODO for ProgramExtensions.cs

## Files Modified

- `IdentityService/src/IdentityService.Infrastructure/Messaging/Consumers/DataExportAggregatorConsumer.cs` -- Replaced local temp file with S3 upload via MemoryStream
- `IdentityService/src/IdentityService.API/Endpoints/Privacy/DownloadDataExport.cs` -- Changed from FileStream to 302 redirect with presigned URL
- `IdentityService/src/IdentityService.Infrastructure/IdentityService.Infrastructure.csproj` -- Added Storage.S3 package reference
- `IdentityService/docker-compose.yml` -- Added Storage__ServiceUrl, Storage__ExternalServiceUrl, Storage__AccessKey, Storage__SecretKey env vars
- `IdentityService/Directory.Packages.props` -- Added Storage.S3 version 1.0.0
- `IdentityService/nuget.config` -- Added Storage.S3 to LocalOnlineMenuFeed source mapping
- `IdentityService/local-packages/Storage.S3.1.0.0.nupkg` -- Local package for Docker builds
- `ContentService/docker-compose.yml` -- Added gdpr-exports bucket to seaweedfs-init

## TODO for Phase 2 Agent

Wire `StorageServiceExtensions` into `ProgramExtensions.cs`:
```csharp
using IdentityService.Infrastructure.Storage;
// ...
builder.Services.AddS3StorageServices(builder.Configuration);
```

## Verification Results

- identity-lint: PASSED (via Tilt MCP)
- identity-unit-tests: PASSED (119 tests, 0 failed, via Tilt MCP)
- Storage.S3 unit tests: PASSED (15 tests, 0 failed, local dotnet test)
- Storage.S3 package builds: PASSED (dotnet pack produces Storage.S3.1.0.0.nupkg)

## Key Design Decisions

1. **MemoryStream for ZIP assembly**: Instead of writing to local disk then uploading, we build the ZIP entirely in memory. For GDPR exports (typically small JSON files), this is safe and avoids filesystem dependencies.

2. **S3 key format**: `{tenantId}/{exportId}.zip` stored in `gdpr-exports` bucket. The full path `gdpr-exports/{tenantId}/{exportId}.zip` is stored in `DataExportRequest.DownloadUrl`.

3. **302 redirect for download**: Instead of streaming the file through the API server, the endpoint generates a presigned S3 URL with 15-minute expiry and returns a 302 redirect. This offloads bandwidth to the S3 storage.

4. **URL rewriting**: The `ReplaceInternalWithExternalUrl` method handles Docker environments where the internal S3 URL (seaweedfs-s3:8333) must be rewritten to an external URL (localhost:5013) for browser access.

5. **ZipArchiveEntry.Open() pragma**: Suppressed S6966 with `#pragma warning disable` because `ZipArchiveEntry.Open()` has no async alternative in the .NET API.

## Date: 2026-03-13
