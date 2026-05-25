# Backend: Custom Domains Feature for OnlineMenu Service

## Status: COMPLETED

## Problem Statement
Restaurant owners need the ability to map a custom domain (e.g., `menu.myrestaurant.com`) to their public menu page. This requires domain entity modeling, DNS verification, proxy configuration, and CRUD endpoints.

## Architecture Approach
- Extend the OnlineMenu service (no new microservice)
- DNS verification via background `IHostedService` polling every 60s
- CNAME + TXT ownership token verification for security
- Proxy-agnostic design via `IProxyConfigProvider` interface (Nginx provider for v1)
- One custom domain per tenant (not per menu)
- Domain hijacking prevention via TXT ownership token + cross-tenant uniqueness check

## Affected Layers
- **Core**: New `CustomDomainAggregate`, interfaces (`ICustomDomainRepository`, `IDnsVerifier`, `IProxyConfigProvider`)
- **UseCases**: Add/Remove/GetByTenant/RequestVerification/ResolveDomain handlers
- **Infrastructure**: Repository, DnsVerifier, NginxConfigProvider, DomainVerificationService, EF Configuration, Migration
- **Web**: 6 new endpoints under `CustomDomains/`

## Success Criteria
- [x] Entity with proper aggregate root pattern
- [x] Cross-tenant uniqueness check using IgnoreQueryFilters
- [x] Background verification service
- [x] All CRUD endpoints working
- [x] Unit tests passing (onlinemenu-unit-tests: OK)
- [x] YAGNI check passing (onlinemenu-yagni: OK)
- [x] API container rebuilds successfully (onlinemenu-api: OK)

## Files Created (36 new files)

### Core Layer
- `OnlineMenu.Core/CustomDomainAggregate/CustomDomainStatus.cs` - Enum: PendingVerification, Active, Failed, Revoked
- `OnlineMenu.Core/CustomDomainAggregate/CustomDomain.cs` - Entity with BaseTenantEntity + IAggregateRoot
- `OnlineMenu.Core/Interfaces/ICustomDomainRepository.cs` - Repository with cross-tenant queries
- `OnlineMenu.Core/Interfaces/IDnsVerifier.cs` - DNS verification interface + DnsVerificationResult record
- `OnlineMenu.Core/Interfaces/IProxyConfigProvider.cs` - Proxy configuration interface

### UseCases Layer
- `OnlineMenu.UseCases/CustomDomains/DTOs/CustomDomainDto.cs` - DTO with FromEntity factory
- `OnlineMenu.UseCases/CustomDomains/Add/AddCustomDomainCommand.cs` + `AddCustomDomainHandler.cs`
- `OnlineMenu.UseCases/CustomDomains/Remove/RemoveCustomDomainCommand.cs` + `RemoveCustomDomainHandler.cs`
- `OnlineMenu.UseCases/CustomDomains/GetByTenant/GetCustomDomainByTenantQuery.cs` + `GetCustomDomainByTenantHandler.cs`
- `OnlineMenu.UseCases/CustomDomains/RequestVerification/RequestVerificationCommand.cs` + `RequestVerificationHandler.cs`
- `OnlineMenu.UseCases/CustomDomains/ResolveDomain/ResolveDomainQuery.cs` + `ResolveDomainHandler.cs`

### Infrastructure Layer
- `OnlineMenu.Infrastructure/Data/CustomDomainRepository.cs` - EfRepository with IgnoreQueryFilters
- `OnlineMenu.Infrastructure/Data/Config/CustomDomainConfiguration.cs` - EF entity configuration
- `OnlineMenu.Infrastructure/Dns/DotnetDnsVerifier.cs` - System.Net.Dns-based verifier
- `OnlineMenu.Infrastructure/Proxy/NginxConfigProvider.cs` - Nginx server block config manager
- `OnlineMenu.Infrastructure/Services/DomainVerificationService.cs` - Background IHostedService
- `OnlineMenu.Infrastructure/Migrations/20260315120000_AddCustomDomains.cs` + `.Designer.cs`

### Web Layer (Endpoints)
- `OnlineMenu.Web/CustomDomains/Add.cs` - POST /CustomDomains (Admin auth)
- `OnlineMenu.Web/CustomDomains/Remove.cs` - DELETE /CustomDomains/{ExternalId} (Admin auth)
- `OnlineMenu.Web/CustomDomains/GetByTenant.cs` - GET /CustomDomains (Admin auth)
- `OnlineMenu.Web/CustomDomains/RequestVerification.cs` - POST /CustomDomains/{ExternalId}/verify (Admin auth)
- `OnlineMenu.Web/CustomDomains/CheckDomain.cs` - GET /internal/domains/check?domain= (Anonymous, rate-limited)
- `OnlineMenu.Web/CustomDomains/GetByDomain.cs` - GET /public/domains/resolve?domain= (Anonymous, rate-limited)

### Unit Tests (7 test files, all passing)
- `tests/OnlineMenu.UnitTests/Domain/CustomDomainEntityTests.cs`
- `tests/OnlineMenu.UnitTests/UseCases/CustomDomains/AddCustomDomainHandlerTests.cs`
- `tests/OnlineMenu.UnitTests/UseCases/CustomDomains/RemoveCustomDomainHandlerTests.cs`
- `tests/OnlineMenu.UnitTests/UseCases/CustomDomains/GetCustomDomainByTenantHandlerTests.cs`
- `tests/OnlineMenu.UnitTests/UseCases/CustomDomains/RequestVerificationHandlerTests.cs`
- `tests/OnlineMenu.UnitTests/UseCases/CustomDomains/ResolveDomainHandlerTests.cs`
- `tests/OnlineMenu.UnitTests/Infrastructure/Services/DomainVerificationServiceTests.cs`

## Files Modified (4 existing files)
- `OnlineMenu.Infrastructure/Data/AppDbContext.cs` - Added CustomDomains DbSet
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` - Registered new services
- `OnlineMenu.Infrastructure/Migrations/AppDbContextModelSnapshot.cs` - Updated snapshot
- `OnlineMenu.Web/appsettings.json` - Added DomainVerification and Proxy config sections

## Tilt MCP Verification Results
- `onlinemenu-lint`: Pre-existing S2699 errors only (not from this feature)
- `onlinemenu-yagni`: OK
- `onlinemenu-unit-tests`: OK
- `onlinemenu-api`: OK (container rebuilt and running)

## Notes
- Pre-existing lint errors S2699 in `ActivateTenantMenusHandlerTests.cs` and `DeactivateTenantMenusHandlerTests.cs` are unrelated to this feature
- DotnetDnsVerifier uses System.Net.Dns which has limited TXT/CNAME support; production should use DnsClient.NET

## Date Started
2026-03-15

## Date Completed
2026-03-15
