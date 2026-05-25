# Task: Add showWatermark Field to Public Menu DTO

## Status: COMPLETED

## Problem Statement
The PaymentService implements free-tier watermarking ("Powered by MenuFlow") but the public menu endpoint (`GET /public/menus/{ExternalId}`) does not yet expose whether the watermark should be shown. The frontend has a `FreeTierWatermark` component ready but needs a `showWatermark` boolean on the public menu DTO.

## Architectural Approach

### Layer Changes (Clean Architecture)

1. **Core Layer** (`OnlineMenu.Core/Interfaces/`)
   - Added `ISubscriptionStatusService` interface with `HasActivePaidSubscriptionAsync(Guid tenantId, CancellationToken)` method.

2. **UseCases Layer** (`OnlineMenu.UseCases/`)
   - Added `ShowWatermark` boolean to `PublicMenuDto` (defaults to `true` for safe fallback)
   - Updated `GetPublicMenuHandler` to inject `ISubscriptionStatusService` and set `ShowWatermark` based on subscription status
   - Mapper unchanged -- handler sets `ShowWatermark` after mapper constructs the DTO

3. **Infrastructure Layer** (`OnlineMenu.Infrastructure/Services/`)
   - Added `DefaultSubscriptionStatusService` that returns `false` (no paid subscription) for all tenants, causing watermark to always show
   - Registered as scoped service in `InfrastructureServiceExtensions`
   - Designed to be replaced with PaymentService API or RabbitMQ-driven implementation later

4. **Tests**
   - Updated `GetPublicMenuHandlerTests` with `ISubscriptionStatusService` mock
   - Added 4 new test cases for watermark-specific scenarios
   - Updated `DtoTests` to verify `ShowWatermark` default and explicit values

### Key Design Decisions
- **Safe fallback**: Default to `showWatermark = true` (show watermark) when subscription status cannot be determined
- **Interface in Core**: Following existing pattern (e.g., `IAiDescriptionService`, `IEmailSender`)
- **Simple first**: No PaymentService HTTP call or RabbitMQ consumer yet -- just the interface and a default implementation
- **Handler sets watermark, not mapper**: The mapper maps entity fields; the handler enriches with cross-cutting data (subscription status)

## Files Changed

### New Files
- `OnlineMenu.Core/Interfaces/ISubscriptionStatusService.cs`
- `OnlineMenu.Infrastructure/Services/DefaultSubscriptionStatusService.cs`

### Modified Files
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` - Registered `ISubscriptionStatusService`
- `OnlineMenu.UseCases/DTOs/PublicMenuDto.cs` - Added `ShowWatermark` property
- `OnlineMenu.UseCases/TenantMenus/GetPublicMenu/GetPublicMenuHandler.cs` - Injected and used `ISubscriptionStatusService`
- `OnlineMenu.UnitTests/UseCases/GetPublicMenuHandlerTests.cs` - 4 new tests, updated constructor
- `OnlineMenu.UnitTests/Domain/DtoTests.cs` - Updated PublicMenuDto tests for `ShowWatermark`

## Unit Test Coverage
- `Handle_FreeTierTenant_ReturnsShowWatermarkTrue` -- free tier shows watermark
- `Handle_PaidTierTenant_ReturnsShowWatermarkFalse` -- paid tier hides watermark
- `Handle_SubscriptionServiceCalledWithCorrectTenantId` -- verifies correct tenant ID passed
- `Handle_MenuNotFound_DoesNotCallSubscriptionService` -- no unnecessary calls
- `Handle_InactiveMenu_DoesNotCallSubscriptionService` -- no unnecessary calls
- `PublicMenuDto_DefaultValues` -- verifies `ShowWatermark` defaults to `true`
- `PublicMenuDto_SetAllProperties_AccessibleCorrectly` -- verifies explicit `false`

## Verification Results
- [x] `onlinemenu-lint` -- PASSED
- [x] `onlinemenu-yagni` -- PASSED
- [x] `onlinemenu-unit-tests` -- PASSED

## Success Criteria
- [x] `ShowWatermark` boolean present on `PublicMenuDto`
- [x] `ShowWatermark = true` when tenant is on Free tier
- [x] `ShowWatermark = false` when tenant has active Pro/Enterprise subscription
- [x] Safe fallback to `true` if subscription status unknown
- [x] All unit tests pass
- [x] Lint passes
- [x] No YAGNI warnings

## API Contract for Frontend

**Endpoint**: `GET /public/menus/{ExternalId:guid}`

**Response field added**:
```json
{
  "externalId": "...",
  "tenantId": "...",
  "name": "...",
  "description": "...",
  "contents": { ... },
  "showWatermark": true,
  "createdDate": "...",
  "lastUpdatedDate": "..."
}
```

`showWatermark` is `true` for Free-tier tenants and `false` for Pro/Enterprise subscribers.
