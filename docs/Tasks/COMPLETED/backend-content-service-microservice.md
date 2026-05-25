# ContentService Microservice Implementation

> **Reference**: OnlineMenuService patterns at `C:\desktopContents\projects\SaaS\OnlineMenuSaaS\OnlineMenuService\OnlineMenu\`

## Status: IN_PROGRESS

## Problem Statement
Create a new ContentService microservice for handling content storage (images, videos, documents) for the online menu feature. The service must support:
- Presigned URL upload flow for S3/RustFS compatible storage
- Multi-tenant content isolation
- Content metadata storage in PostgreSQL
- Content variants (thumbnails, compressed versions)

## Architecture Overview
Following Clean Architecture with CQRS pattern:
- **Content.Core**: Domain entities, value objects, repository interfaces
- **Content.UseCases**: Commands, queries, handlers using MediatR
- **Content.Infrastructure**: EF Core, S3 storage service
- **Content.Web**: FastEndpoints API layer
- **Content.ServiceDefaults**: Aspire service defaults

## Implementation Plan

### Phase 1: Project Structure & Domain Layer
1. Create solution and project files
2. Define Content entity with BaseTenantEntity inheritance
3. Define ContentVariant entity
4. Define ContentCategory and ContentStatus enums
5. Define IContentRepository interface

### Phase 2: Use Cases Layer
1. Create RequestUploadUrl command/handler
2. Create CompleteUpload command/handler
3. Create GetContent query/handler
4. Create ListContent query/handler
5. Create DeleteContent command/handler
6. Create GetContentUrl query/handler

### Phase 3: Infrastructure Layer
1. Create ContentDbContext
2. Create EfContentRepository
3. Create ContentConfiguration
4. Create IS3StorageService interface
5. Create S3StorageService implementation
6. Create InfrastructureServiceExtensions

### Phase 4: Web Layer
1. Create Program.cs with authentication, FastEndpoints
2. Create Upload endpoints
3. Create Content CRUD endpoints
4. Create Dockerfile
5. Create appsettings.json

### Phase 5: Testing & Docker
1. Create unit tests for handlers
2. Create docker-compose.yml with MinIO
3. Verify build and test success

## Files to Create
```
ContentService/
├── Content/
│   ├── src/
│   │   ├── Content.Core/
│   │   ├── Content.UseCases/
│   │   ├── Content.Infrastructure/
│   │   ├── Content.ServiceDefaults/
│   │   └── Content.Web/
│   └── tests/
│       └── Content.UnitTests/
├── docker-compose.yml
├── Directory.Build.props
├── Directory.Packages.props
├── nuget.config
└── Content.sln
```

## Success Criteria
- [ ] Solution builds without errors
- [ ] All unit tests pass
- [ ] Docker containers start successfully
- [ ] Upload presigned URL endpoint works
- [ ] Complete upload endpoint works
- [ ] Get content metadata endpoint works
- [ ] List content endpoint works
- [ ] Delete content endpoint works

## Changes Made
(Will be updated as implementation progresses)

## Test Results
(Will be updated after testing)
