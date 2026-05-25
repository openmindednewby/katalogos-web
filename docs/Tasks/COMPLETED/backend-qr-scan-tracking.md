# Task: QR Code Scan Tracking Endpoint

## Status: COMPLETED

## Problem Statement
Restaurant owners need analytics on QR code usage. When customers scan a QR code, the URL should go through a tracking redirect endpoint that logs scan metadata before redirecting to the actual public menu page.

## Architectural Approach

### Layer Breakdown
1. **Core Layer**: New `QrScanEvent` entity (extends `BaseEntity`, not `BaseTenantEntity` since scans happen without auth)
2. **UseCases Layer**:
   - `RecordQrScan` command to log the scan event
   - `GetQrAnalytics` query to retrieve scan statistics for a menu
3. **Infrastructure Layer**: EF Core migration for `QrScanEvents` table, `QrScanEventConfiguration`, `QrScanEventRepository`
4. **Web Layer**:
   - `QrScans/Track.cs` - Public redirect endpoint (`GET /api/qr/{menuId}`)
   - `QrScans/GetAnalytics.cs` - Authenticated analytics endpoint

### Design Decisions
- `QrScanEvent` uses `BaseEntity` (not `BaseTenantEntity`) because scans are recorded anonymously
- Store `MenuExternalId` as the ExternalId (GUID) of the TenantMenus entity
- IP addresses are hashed with SHA-256 for GDPR compliance (never stored raw)
- User agents truncated to 500 chars, referrers to 1000 chars
- The public menu page URL is constructed from `PublicMenu:BaseUrl` configuration
- `IQrScanEventRepository` interface in Core/Interfaces for analytics aggregation queries

## Files Created/Modified

### Core Layer
- **NEW**: `OnlineMenu.Core/QrScanAggregate/QrScanEvent.cs` - Domain entity
- **NEW**: `OnlineMenu.Core/Interfaces/IQrScanEventRepository.cs` - Repository interface

### UseCases Layer
- **NEW**: `OnlineMenu.UseCases/QrScans/RecordScan/RecordQrScanCommand.cs` - Command
- **NEW**: `OnlineMenu.UseCases/QrScans/RecordScan/RecordQrScanHandler.cs` - Handler
- **NEW**: `OnlineMenu.UseCases/QrScans/GetAnalytics/GetQrAnalyticsQuery.cs` - Query
- **NEW**: `OnlineMenu.UseCases/QrScans/GetAnalytics/GetQrAnalyticsHandler.cs` - Handler
- **NEW**: `OnlineMenu.UseCases/QrScans/DTOs/QrAnalyticsDto.cs` - Response DTO

### Infrastructure Layer
- **NEW**: `OnlineMenu.Infrastructure/Data/Config/QrScanEventConfiguration.cs` - EF Core config
- **NEW**: `OnlineMenu.Infrastructure/Data/QrScanEventRepository.cs` - Repository implementation
- **NEW**: `OnlineMenu.Infrastructure/Migrations/20260313120000_AddQrScanEvents.cs` - Migration
- **NEW**: `OnlineMenu.Infrastructure/Migrations/20260313120000_AddQrScanEvents.Designer.cs` - Migration designer
- **MODIFIED**: `OnlineMenu.Infrastructure/Data/AppDbContext.cs` - Added QrScanEvents DbSet
- **MODIFIED**: `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` - Registered IQrScanEventRepository
- **MODIFIED**: `OnlineMenu.Infrastructure/Migrations/AppDbContextModelSnapshot.cs` - Updated snapshot

### Web Layer
- **NEW**: `OnlineMenu.Web/QrScans/Track.cs` - Public QR scan tracking endpoint
- **NEW**: `OnlineMenu.Web/QrScans/GetAnalytics.cs` - Authenticated analytics endpoint

### Tests
- **NEW**: `OnlineMenu.UnitTests/UseCases/QrScans/RecordQrScanHandlerTests.cs` - 5 tests
- **NEW**: `OnlineMenu.UnitTests/UseCases/QrScans/GetQrAnalyticsHandlerTests.cs` - 3 tests
- **NEW**: `OnlineMenu.UnitTests/Domain/QrScanEventTests.cs` - 9 tests

## Quality Gate Results
- [x] `onlinemenu-lint` - PASSED
- [x] `onlinemenu-yagni` - PASSED
- [x] `onlinemenu-unit-tests` - PASSED (17 new tests)
- [x] `onlinemenu-api` - PASSED (container rebuilt successfully)

## Success Criteria
- [x] `GET /api/qr/{menuId}` logs scan and returns 302 redirect
- [x] `GET /api/menus/{menuId}/qr-analytics` returns scan statistics (authenticated)
- [x] QrScanEvent entity with proper EF Core configuration
- [x] Database migration created
- [x] Unit tests for handlers and domain entity
- [x] All Tilt quality checks pass (lint, YAGNI, unit-tests, API rebuild)
