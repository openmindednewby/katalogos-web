# Backend: Menu View Analytics (Section 1.4 Dashboard)

## Status: COMPLETED

## Problem Statement

The analytics dashboard needs detailed per-menu analytics with date-range filtering, device breakdown from UserAgent parsing, and per-item view tracking. Currently, only aggregate tenant-level summaries and basic QR scan counts exist.

## Changes Made

### Phase 1: Core Domain
- Created `DeviceType.cs` enum (Mobile/Tablet/Desktop/Unknown) in QrScanAggregate
- Created `MenuItemViewEvent.cs` entity (BaseEntity, not BaseTenantEntity) in MenuItemViewAggregate
- Created `IMenuItemViewRepository.cs` interface in Core/Interfaces
- Created `IDeviceTypeClassifier.cs` interface in Core/Interfaces
- Extended `IQrScanEventRepository.cs` with 3 new methods: GetScansByDateRangeAsync, GetScansByDayInRangeAsync, GetUserAgentBreakdownAsync

### Phase 2: Infrastructure
- Created `DeviceTypeClassifier.cs` implementing IDeviceTypeClassifier (UA classifier)
- Implemented new methods in `QrScanEventRepository.cs`
- Created `MenuItemViewRepository.cs`
- Created `MenuItemViewEventConfiguration.cs` with composite index on (MenuExternalId, ViewedAt)
- Registered MenuItemViewEvents DbSet in AppDbContext
- Registered IMenuItemViewRepository, IDeviceTypeClassifier in DI
- Created EF Core migration `20260319130000_AddMenuItemViewEvents.cs`

### Phase 3: Application Layer
- Created DTOs: MenuAnalyticsDetailDto, DeviceBreakdownDto, ItemViewDto
- Created GetMenuAnalyticsDetailQuery + Handler (uses Task.WhenAll for parallel repo calls, verifies tenant ownership)
- Created TrackMenuItemViewCommand + Handler (swallows all exceptions for analytics safety)

### Phase 4: API Endpoints
- `GET /analytics/menu/{MenuId:guid}?from=&to=` - Admin auth, defaults 30 days
- `POST /menus/{MenuId:guid}/views` - AllowAnonymous, rate-limited, always returns 204

### Phase 5: Unit Tests
- GetMenuAnalyticsDetailHandlerTests - 6 tests (not found, complete analytics, empty, percentages, parallel calls, item order)
- TrackMenuItemViewHandlerTests - 4 tests (valid, null metadata, exception swallowing, logging)
- DeviceTypeClassifierTests - 10 tests (null, empty, whitespace, iPhone, Android phone, iPad, Android tablet, Windows, Mac, Kindle)

## Tilt Verification Results
- [x] onlinemenu-lint: PASSED
- [x] onlinemenu-yagni: PASSED
- [x] onlinemenu-unit-tests: PASSED
- [x] onlinemenu-api: PASSED

## Success Criteria
- [x] All new code follows Clean Architecture patterns
- [x] Unit tests pass via Tilt MCP
- [x] Lint passes via Tilt MCP
- [x] API container builds via Tilt MCP
- [x] No YAGNI warnings
- [x] UTF-8 BOM encoding for all C# files

## API Contract (for frontend-dev)

### GET /analytics/menu/{menuId}
- **Auth**: Admin role required
- **Query params**: `from` (DateTime, optional, defaults 30 days ago), `to` (DateTime, optional, defaults end of today)
- **200 OK response**:
```json
{
  "totalScans": 100,
  "scansByDay": [{ "date": "2026-03-10", "count": 30 }],
  "deviceBreakdown": [{ "deviceType": "Mobile", "count": 60, "percentage": 60.0 }],
  "topViewedItems": [{ "categoryName": "Appetizers", "itemName": "Spring Rolls", "viewCount": 50 }]
}
```
- **404**: Menu not found or not owned by tenant

### POST /menus/{menuId}/views
- **Auth**: AllowAnonymous (public, rate-limited)
- **Request body**: `{ "categoryName": "string", "itemName": "string" }`
- **204 NoContent**: Always (analytics failures are silently swallowed)
