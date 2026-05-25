# Backend: GDPR Entities, Enums, Migration & Consent Endpoints

> **Status**: COMPLETED
> **Started**: 2026-03-13
> **Completed**: 2026-03-13
> **Agent**: backend-dev
> **Parent Task**: gdpr-phase2-phase3-architecture.md

---

## Problem Statement

IdentityService needs new GDPR entities (ConsentRecord, DataExportRequest, AccountDeletionRequest), supporting enums, a database migration, and the initial consent endpoints (GET and PUT `/api/privacy/consent`).

## Architectural Approach

- Entities in `IdentityService.Core/Entities/` extending BaseEntity (not BaseTenantEntity, since users live in Keycloak)
- Enums in `IdentityService.Core/Enums/` (each in own file)
- DbContext updated with DbSet properties and full entity configurations with indexes per blueprint section 3.7
- Migration generated via `dotnet ef migrations add AddGdprEntities`
- Consent endpoints in `IdentityService.API/Endpoints/Privacy/` following FastEndpoints pattern with primary constructors

## Affected Services

- IdentityService (Core, Infrastructure, API, Tests)

## Files Created

- `IdentityService.Core/Entities/ConsentRecord.cs`
- `IdentityService.Core/Entities/DataExportRequest.cs`
- `IdentityService.Core/Entities/AccountDeletionRequest.cs`
- `IdentityService.Core/Enums/DataExportStatus.cs`
- `IdentityService.Core/Enums/DeletionStatus.cs`
- `IdentityService.Core/Enums/ConsentTypes.cs`
- `IdentityService.API/Endpoints/Privacy/GetConsent.cs`
- `IdentityService.API/Endpoints/Privacy/UpdateConsent.cs`
- `IdentityService.API/Endpoints/Privacy/UpdateConsent.Validator.cs`
- `IdentityService.Infrastructure/Data/Migrations/20260313115107_AddGdprEntities.cs` (auto-generated)
- `IdentityService.Infrastructure/Data/Migrations/20260313115107_AddGdprEntities.Designer.cs` (auto-generated)

## Files Modified

- `IdentityService.Infrastructure/Data/IdentityDbContext.cs` (3 new DbSets + OnModelCreating config with indexes)
- `IdentityService.Infrastructure/Data/Migrations/IdentityDbContextModelSnapshot.cs` (auto-updated)

## Verification Results

- [x] identity-lint: PASSED
- [x] identity-yagni: PASSED
- [x] identity-unit-tests: PASSED
- [x] identity-api: PASSED (container rebuild + runtime ok)
- [x] All 3 entities properly configured with correct indexes per blueprint section 3.7
- [x] Consent endpoints accessible and functional

## API Contracts

### GET `/api/privacy/consent`
- Auth: Any authenticated user (JWT required)
- Response: `{ Consents: [{ ConsentType: string, IsGranted: bool, GrantedAt?: DateTime, RevokedAt?: DateTime }] }`
- Returns the latest consent record per type for the user

### PUT `/api/privacy/consent`
- Auth: Any authenticated user (JWT required)
- Request: `{ Consents: [{ ConsentType: string, IsGranted: bool }] }`
- Response: `{ Updated: bool }`
- Validates consent types against known values (essential, analytics, marketing)
- Creates new ConsentRecord entries (immutable audit trail)
- Captures IP address and User-Agent from request

## Database Schema

### Tables Created
- `ConsentRecords` with indexes: `IX_ConsentRecords_UserId_TenantId`, `IX_ConsentRecords_UserId_ConsentType`
- `DataExportRequests` with indexes: `IX_DataExportRequests_UserId`, `IX_DataExportRequests_Status`
- `AccountDeletionRequests` with indexes: `IX_AccountDeletionRequests_ConfirmationToken` (unique), `IX_AccountDeletionRequests_UserId_Status`, `IX_AccountDeletionRequests_ScheduledDeletionDate_Status` (filtered: Status=1)
