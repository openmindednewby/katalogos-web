# Analytics Phase 5 -- Server-Side Event Tracking Pipeline

## Status: COMPLETE

## Problem Statement

Frontend analytics (Phases 1-4) are complete. We need lightweight server-side event tracking so backend actions (e.g., QR scan recording) can also publish analytics events. The approach is a MediatR pipeline behavior that fires analytics events after command handlers succeed.

## Architectural Approach

### Design Decisions

1. **IAnalyticsPublisher interface** lives in `OnlineMenu.Core/Interfaces/` following the established pattern (infrastructure abstractions in Core, implementations in Infrastructure/Web).
2. **IAnalyticsTracked marker interface** lives in `OnlineMenu.Core/Interfaces/` since it is a domain-level contract that commands implement.
3. **UmamiAnalyticsPublisher** lives in `OnlineMenu.Infrastructure/Services/` as an infrastructure service implementation.
4. **AnalyticsPipelineBehavior** lives in `OnlineMenu.UseCases/Behaviors/` as a MediatR pipeline behavior (application layer concern).
5. **Fire-and-forget** analytics: wrapped in try/catch, logged errors never thrown. Analytics must never break the request pipeline.
6. **No-op when unconfigured**: If Umami URL/websiteId are not set, TrackAsync is a silent no-op.
7. **Singleton lifetime** for UmamiAnalyticsPublisher since it is stateless and uses IHttpClientFactory.

### Affected Services

- OnlineMenu (primary: new interfaces, implementation, pipeline behavior, wiring)
- Docker infrastructure (new docker-compose.analytics.yml for Umami)
- Tiltfile (new Analytics resource group)

### Layers Affected

| Layer | Changes |
|-------|---------|
| Core | IAnalyticsPublisher, IAnalyticsTracked interfaces |
| UseCases | AnalyticsPipelineBehavior, RecordQrScanCommand implements IAnalyticsTracked |
| Infrastructure | UmamiAnalyticsPublisher, UmamiOptions |
| Web | DI wiring in MediatrConfigs + InfrastructureServiceExtensions, appsettings configuration |
| Tests | 15 new unit tests (9 publisher + 6 behavior) |
| Infrastructure (Docker) | docker-compose.analytics.yml, Tiltfile entries |

## Verification Results

- [x] `onlinemenu-yagni`: PASSED
- [x] `onlinemenu-lint`: PASSED
- [x] `onlinemenu-unit-tests`: PASSED (639 total, 0 failures, 15 new tests)
- [x] `onlinemenu-api`: PASSED (container rebuilds successfully)

## Success Criteria

- [x] IAnalyticsPublisher interface defined in Core/Interfaces
- [x] IAnalyticsTracked marker interface defined in Core/Interfaces
- [x] UmamiAnalyticsPublisher implementation in Infrastructure
- [x] AnalyticsPipelineBehavior in UseCases
- [x] RecordQrScanCommand implements IAnalyticsTracked
- [x] docker-compose.analytics.yml created
- [x] Tiltfile updated with Analytics resources (TRIGGER_MODE_MANUAL, auto_init=False)
- [x] Unit tests pass for publisher and pipeline behavior
- [x] onlinemenu-lint passes
- [x] onlinemenu-unit-tests passes
- [x] onlinemenu-api builds successfully

## Additional Fix

- Fixed pre-existing build error in `OnlineMenu.Web/Analytics/GetTenantSummary.cs`: replaced invalid `SendErrorsAsync(cancellation: ct)` with `Send.NotFoundAsync(ct)` to match the established FastEndpoints pattern.

## Files Created/Modified

### New Files
- `OnlineMenu.Core/Interfaces/IAnalyticsPublisher.cs`
- `OnlineMenu.Core/Interfaces/IAnalyticsTracked.cs`
- `OnlineMenu.Infrastructure/Services/UmamiAnalyticsPublisher.cs`
- `OnlineMenu.Infrastructure/Services/UmamiOptions.cs`
- `OnlineMenu.UseCases/Behaviors/AnalyticsPipelineBehavior.cs`
- `OnlineMenu.UnitTests/UseCases/Behaviors/AnalyticsPipelineBehaviorTests.cs`
- `OnlineMenu.UnitTests/Infrastructure/Services/UmamiAnalyticsPublisherTests.cs`
- `infrastructure/analytics/docker-compose.yml`

### Modified Files
- `OnlineMenu.UseCases/QrScans/RecordScan/RecordQrScanCommand.cs` (implements IAnalyticsTracked)
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` (register Umami services)
- `OnlineMenu.Web/Configurations/MediatrConfigs.cs` (register AnalyticsPipelineBehavior)
- `OnlineMenu.Web/appsettings.json` (Umami config section)
- `OnlineMenu.Web/appsettings.Development.json` (Umami dev config)
- `OnlineMenuSaaS/OnlineMenuService/docker-compose.yml` (Umami env vars)
- `OnlineMenu.Web/Analytics/GetTenantSummary.cs` (fix pre-existing build error)
- `Tiltfile` (Analytics resource group)
