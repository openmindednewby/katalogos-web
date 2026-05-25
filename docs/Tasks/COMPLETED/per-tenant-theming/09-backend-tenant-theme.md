# Task 09: Extend Backend Tenant Entity with Full Theme Config

> **Status**: COMPLETED (2026-03-06) — 41 unit tests, Redis caching, ETag support
> **Agent**: `backend-dev`
> **Blocked by**: None (can start in parallel with frontend Phase 1)
> **Blocks**: 10 (tenant theme fetch/cache)
> **Estimated effort**: Medium

---

## Problem Statement

The Tenant entity in IdentityService already has `LogoUrl` (string?) and `PrimaryColor` (string?) fields, but we need a full theme configuration stored as a JSON blob. Per the architectural decision, we're extending IdentityService (not creating a new service).

---

## Requirements

### Database Schema

Add to the `Tenant` entity:
```csharp
public string? ThemeConfigJson { get; private set; }  // JSON blob, max 8KB
```

With EF configuration:
```csharp
entity.Property(e => e.ThemeConfigJson).HasMaxLength(8000);
```

Add a domain method:
```csharp
public void UpdateThemeConfig(string? themeConfigJson)
{
    ThemeConfigJson = themeConfigJson;
    LastUpdatedDate = DateTime.UtcNow;
}
```

### New API Endpoints

#### GET /api/tenants/{tenantId}/theme
- **Auth**: `AllowAnonymous` (needed for login page branding, same pattern as `GetTenantAuthConfig`)
- **Returns**: The `ThemeConfigJson` deserialized, or a default config if null
- **Response**: `TenantThemeResponse { presetId, colors, darkColors, typography, logoContentId, faviconContentId }`

#### PUT /api/tenants/{tenantId}/theme
- **Auth**: Requires `Administrator` role
- **Body**: `UpdateTenantThemeRequest` - the theme config JSON
- **Validation**: Validate JSON structure, max size 8KB, hex color format validation
- **Side effect**: Invalidate Redis cache for this tenant's theme

#### GET /api/tenants/theme-presets
- **Auth**: `AllowAnonymous`
- **Returns**: Array of built-in preset configs `{ id, name, config }`
- **Static data**: Hardcoded in the API, not stored in DB

### Redis Caching (New for IdentityService)

IdentityService does not currently use Redis. Add:

1. **NuGet package**: `StackExchange.Redis`
2. **Cache service**: `ITenantThemeCacheService` with:
   - `GetThemeAsync(tenantId)` - Read from cache
   - `SetThemeAsync(tenantId, json)` - Write to cache with TTL
   - `InvalidateThemeAsync(tenantId)` - Remove from cache
3. **Cache key**: `tenant:theme:{tenantId}`
4. **TTL**: 15 minutes (theme changes are rare, aggressive caching is fine)
5. **Redis connection**: Use existing Redis instance at `redis:6379` on `saas-network`

### ETag Support
- GET endpoint returns `ETag` header (hash of ThemeConfigJson)
- Supports `If-None-Match` header for conditional requests
- Returns `304 Not Modified` when theme hasn't changed
- Reduces bandwidth for frontend polling

---

## Acceptance Criteria

- [ ] EF migration adds `ThemeConfigJson` column to Tenants table
- [ ] `GET /api/tenants/{tenantId}/theme` returns theme config or defaults
- [ ] `PUT /api/tenants/{tenantId}/theme` updates theme config with validation
- [ ] `GET /api/tenants/theme-presets` returns built-in presets
- [ ] Redis caching implemented with 15-min TTL
- [ ] Cache invalidated on theme update
- [ ] ETag/If-None-Match support on GET endpoint
- [ ] Input validation (max 8KB, valid JSON structure, hex color format)
- [ ] AllowAnonymous on GET endpoints (for pre-login access)
- [ ] Admin role required on PUT endpoint
- [ ] Unit tests for theme validation logic
- [ ] Unit tests for cache service
- [ ] Swagger documentation for new endpoints
- [ ] Existing `LogoUrl` and `PrimaryColor` fields preserved (backwards compatible)

---

## Files to Modify

- `IdentityService/src/IdentityService.Core/Entities/Tenant.cs` - Add ThemeConfigJson property
- `IdentityService/src/IdentityService.Infrastructure/Data/IdentityDbContext.cs` - Add column config
- `IdentityService/docker-compose.yml` - Add Redis dependency (or use shared Redis)

## Files to Create

- `IdentityService/src/IdentityService.API/Endpoints/Tenants/GetTenantTheme.cs` - GET endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Tenants/UpdateTenantTheme.cs` - PUT endpoint
- `IdentityService/src/IdentityService.API/Endpoints/Tenants/GetThemePresets.cs` - Presets endpoint
- `IdentityService/src/IdentityService.Infrastructure/Caching/TenantThemeCacheService.cs`
- `IdentityService/src/IdentityService.Core/Interfaces/ITenantThemeCacheService.cs`
- EF migration file (auto-generated)

---

## Files to Reference

- `IdentityService/src/IdentityService.Core/Entities/Tenant.cs` - Current entity (lines 27-28: LogoUrl, PrimaryColor)
- `IdentityService/src/IdentityService.API/Endpoints/Tenants/GetTenantAuthConfig.cs` - AllowAnonymous pattern
- `IdentityService/src/IdentityService.API/Endpoints/Tenants/UpdateTenant.cs` - Update pattern
- `IdentityService/src/IdentityService.Infrastructure/Data/IdentityDbContext.cs` - EF config (lines 32-33)
- `NotificationService/` - Reference for how Redis is used in this project

---

## Logo Upload Integration (No New Code Needed)

Logos are uploaded via ContentService's existing flow:
1. Frontend calls `POST /content/upload-url` with `{ category: "Image", isPublic: true }`
2. Uploads file to SeaweedFS via presigned URL
3. Calls `POST /content/upload-complete`
4. Stores returned `ContentId` (GUID) in theme config's `logoContentId`
5. Resolves logo URL via `GET /content/{logoContentId}/public-url`

No changes to ContentService needed. The theme config just stores GUIDs referencing content items.
