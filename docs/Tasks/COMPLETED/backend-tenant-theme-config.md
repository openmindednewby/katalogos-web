# Task 09: Extend Backend Tenant Entity with Full Theme Config

> **Status**: COMPLETED
> **Agent**: backend-dev
> **Started**: 2026-02-14
> **Completed**: 2026-03-06

---

## Problem Statement

The Tenant entity in IdentityService needs a full theme configuration stored as a JSON blob (ThemeConfigJson). This supports per-tenant branding for white-label functionality.

## Architectural Approach

1. **Database Schema**: Add `ThemeConfigJson` (string, max 8000) to Tenant entity with EF migration
2. **Domain Method**: Add `UpdateThemeConfig()` method on Tenant entity
3. **GET /api/tenants/{tenantId}/theme**: AllowAnonymous endpoint for pre-login branding
4. **PUT /api/tenants/{tenantId}/theme**: Admin-only endpoint with validation + cache invalidation
5. **GET /api/tenants/theme-presets**: AllowAnonymous endpoint returning hardcoded presets
6. **Redis Caching**: ITenantThemeCacheService with 15-min TTL via StackExchange.Redis
7. **ETag Support**: Conditional GET with If-None-Match / 304 Not Modified

## Affected Services

- IdentityService.Core (Tenant entity, ITenantThemeCacheService interface)
- IdentityService.Infrastructure (EF config, migrations, TenantThemeCacheService implementation)
- IdentityService.API (3 new endpoints, Redis DI registration)
- IdentityService.Tests (validation + cache service unit tests)

## Changes Made

### Pre-existing (already implemented before this session)
- Tenant.ThemeConfigJson property (private setter, max 8000)
- Tenant.UpdateThemeConfig() domain method
- EF configuration with HasMaxLength(8000)
- EF Migration 20260214112332_AddThemeConfigJson
- ITenantThemeCacheService interface in Core/Interfaces
- TenantThemeCacheService Redis implementation in Infrastructure/Caching
- StackExchange.Redis NuGet in Infrastructure
- Redis + cache service DI registration in ProgramExtensions
- GetTenantTheme endpoint (AllowAnonymous, ETag, cache-first)
- UpdateTenantTheme endpoint (Admin role, size + color validation, cache invalidation)
- GetThemePresets endpoint (AllowAnonymous, 5 hardcoded presets)

### Added in this session
- **TenantThemeTests.cs**: 6 unit tests for Tenant entity theme config methods
  - Set JSON, clear with null, timestamp update, overwrite, default null, empty string
- **ThemeColorValidationTests.cs**: 24 unit tests for hex color validation
  - Valid 3/6/8-digit hex, invalid formats, null handling, section prefix, bulk validation
- **TenantThemeCacheServiceTests.cs**: 11 unit tests for Redis cache service
  - Get cached/not-cached/error, set with TTL/error, invalidate/error, cache key format
- **IdentityService.Tests.csproj**: Added StackExchange.Redis package for Redis mocking
- **IdentityService.API.csproj**: Added InternalsVisibleTo for test project access

## Success Criteria

- [x] EF migration adds ThemeConfigJson column
- [x] GET theme endpoint returns config or defaults (AllowAnonymous)
- [x] PUT theme endpoint updates with validation (Admin role)
- [x] GET presets endpoint returns hardcoded presets
- [x] Redis caching with 15-min TTL
- [x] Cache invalidated on PUT
- [x] ETag/If-None-Match support on GET
- [x] Unit tests for validation and cache service (41 new tests)
- [x] dotnet build passes
- [x] dotnet test passes (51 total: 10 existing + 41 new)
- [x] No YAGNI warnings
