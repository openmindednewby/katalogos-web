# Analytics Phase 4 - Tenant Analytics Summary Endpoint

## Status: COMPLETED

## Problem Statement
The OnlineMenu service has per-menu QR scan analytics (`GET /api/menus/{MenuId}/qr-analytics`), but the analytics dashboard needs a tenant-level aggregate endpoint that summarizes all menus and scan data for a tenant.

## Architectural Approach
- Follow existing CQRS pattern with MediatR (Query + Handler)
- Follow existing FastEndpoints pattern (domain folder with simple names)
- Use `IBaseRepository<TenantMenus>` for menu counts and `IQrScanEventRepository` for scan aggregation
- Extend `IQrScanEventRepository` with tenant-level aggregation methods
- Return `Result<T>` pattern from handler
- Tenant isolation enforced by EF Core global query filters (automatic)

## Affected Services
- OnlineMenu.Core (IQrScanEventRepository interface extension)
- OnlineMenu.UseCases (new query, handler, DTO)
- OnlineMenu.Web (new endpoint)
- OnlineMenu.Infrastructure (repository implementation)
- OnlineMenu.UnitTests (handler tests)

## Files Created/Modified
1. **CREATED** `OnlineMenu.UseCases/Analytics/DTOs/TenantAnalyticsSummaryDto.cs` - Response DTOs
2. **CREATED** `OnlineMenu.UseCases/Analytics/GetTenantSummary/GetTenantSummaryQuery.cs` - CQRS query record
3. **CREATED** `OnlineMenu.UseCases/Analytics/GetTenantSummary/GetTenantSummaryHandler.cs` - Handler with menu/scan aggregation
4. **CREATED** `OnlineMenu.Web/Analytics/GetTenantSummary.cs` - FastEndpoint (GET /api/analytics/tenant-summary)
5. **MODIFIED** `OnlineMenu.Core/Interfaces/IQrScanEventRepository.cs` - Added 3 tenant-level aggregation methods
6. **MODIFIED** `OnlineMenu.Infrastructure/Data/QrScanEventRepository.cs` - Implemented tenant-level aggregation methods
7. **CREATED** `OnlineMenu.UnitTests/UseCases/Analytics/GetTenantSummaryHandlerTests.cs` - 5 test cases
8. **MODIFIED** `OnlineMenu.UnitTests/Web/EndpointRoutesAndDtosTests.cs` - Added route test for analytics endpoint
9. **MODIFIED** `OnlineMenu.UnitTests/Domain/DtoTests.cs` - Added DTO property tests for new DTOs
10. **MODIFIED** `OnlineMenu.UnitTests/Domain/EndpointRequestResponseTests.cs` - Added query record test

## Verification Results
- [x] `onlinemenu-lint` - PASSED
- [x] `onlinemenu-yagni` - PASSED
- [x] `onlinemenu-unit-tests` - PASSED (624+ tests)
- [x] `onlinemenu-api` - PASSED (container rebuild successful)

## Success Criteria
- [x] Endpoint returns correct tenant-level summary
- [x] Unit tests pass for all scenarios (happy path, edge cases, empty tenant)
- [x] `onlinemenu-lint` passes
- [x] `onlinemenu-unit-tests` passes
- [x] `onlinemenu-api` rebuilds successfully
- [x] Follows all existing patterns exactly

## API Contract

**Endpoint**: `GET /api/analytics/tenant-summary`
**Auth**: Requires `Admin` role
**Response** (200 OK):
```json
{
  "totalMenus": 5,
  "activeMenus": 3,
  "totalQrScans": 250,
  "scansToday": 18,
  "topMenusByScans": [
    { "menuId": "guid", "menuName": "Lunch Menu", "scanCount": 150 },
    { "menuId": "guid", "menuName": "Dinner Menu", "scanCount": 100 }
  ]
}
```
