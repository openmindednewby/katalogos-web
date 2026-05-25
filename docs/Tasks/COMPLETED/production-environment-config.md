# Production Environment Configuration

> **Status**: COMPLETED
> **Priority**: P0 - Critical (Deployment Blocker)
> **Started**: 2026-03-12
> **Completed**: 2026-03-12
> **Scope**: All 5 backend services

---

## Decision Log

- **TLS termination**: Caddy reverse proxy handles HTTPS; services listen on HTTP internally
- **UseHttpsRedirection**: Removed in non-dev (would break Caddy proxy chain)
- **UseHsts**: Added for non-dev environments (Caddy passes the header through)
- **CORS approach**: All 5 services now read from `Cors:AllowedOrigins` config (IdentityService pattern)
- **CORS policy name**: Standardized to `"AllowedOrigins"` across all services
- **RequireHttpsMetadata**: Defaults to `true` in base config; overridden to `false` only in Development
- **Request body limits**: 10MB default (all services), 500MB for ContentService (file uploads)
- **Connection strings**: Intentionally NOT in Staging/Production JSON — injected via environment variables
- **Frontend**: Already has dev/test/prod configs in `environment.ts` — no changes needed

---

## Changes Made

### Phase 1: CORS — Config-based origins (All 5 Services) (DONE)

- [x] IdentityService: Already config-based, renamed policy `"ApiGateway"` → `"AllowedOrigins"`
- [x] OnlineMenuService: Replaced hardcoded origins with `Cors:AllowedOrigins` from config
- [x] QuestionerService: Same as OnlineMenu
- [x] ContentService: Same pattern, NO `AllowCredentials()` (Bearer token auth only)
- [x] NotificationService: Same pattern, WITH `AllowCredentials()` (required for SignalR)

### Phase 2: Migration Guard (DONE)

- [x] OnlineMenuService: Wrapped `SeedDatabase(app)` in `IsDevelopment()` check
- [x] QuestionerService: Same as OnlineMenu
- [x] ContentService: Wrapped migration block in `IsDevelopment()` check
- [x] IdentityService: Already guarded (pre-existing)
- [x] NotificationService: Already guarded (pre-existing)

### Phase 3: HSTS / HTTPS Pipeline (DONE)

- [x] IdentityService: Replaced `UseHttpsRedirection()` with `UseHsts()` in non-dev
- [x] OnlineMenuService: Removed `UseHttpsRedirection()` (HSTS already in non-dev branch)
- [x] QuestionerService: Same as OnlineMenu
- [x] ContentService: Added `UseHsts()` in non-dev branch
- [x] NotificationService: Added `UseHsts()` in non-dev block

### Phase 4: RequireHttpsMetadata — Safe Defaults (DONE)

- [x] IdentityService: Changed from `IsProduction()` to config-based (`Keycloak:RequireHttpsMetadata`)
- [x] OnlineMenuService: Changed base default from `false` → `true` in both Jwt and Keycloak sections
- [x] QuestionerService: Same as OnlineMenu
- [x] ContentService: Changed base default from `"false"` → `"true"`
- [x] NotificationService: Already `"true"` in base config (no change)

### Phase 5: Request Body Size Limits (DONE)

- [x] All services: Added `Kestrel.Limits.MaxRequestBodySize` to base appsettings.json
- [x] 10MB for Identity, OnlineMenu, Questioner, Notification
- [x] 500MB for ContentService (file uploads)

### Phase 6: Environment Config Files (DONE)

Created for all 5 services:
- [x] `appsettings.Staging.json` — staging CORS origins, Warning-level logging, moderate rate limits
- [x] `appsettings.Production.json` — production CORS origins, Warning-level logging, strict rate limits

---

## Quality Gates (DONE)

- [x] All 5 services lint pass
- [x] All 5 services unit tests pass
- [x] All 5 API containers rebuild and start successfully

---

## Files Changed

### IdentityService (5 files)
- `src/IdentityService.API/ProgramExtensions.cs` — RequireHttpsMetadata from config, CORS rename, HSTS
- `src/IdentityService.API/appsettings.json` — Added RequireHttpsMetadata default + Kestrel limits
- `src/IdentityService.API/appsettings.Development.json` — Added RequireHttpsMetadata override
- `src/IdentityService.API/appsettings.Staging.json` — NEW
- `src/IdentityService.API/appsettings.Production.json` — NEW

### OnlineMenuService (6 files)
- `src/OnlineMenu.Web/Program.cs` — Config-based CORS, renamed policy
- `src/OnlineMenu.Web/Configurations/MiddlewareConfig.cs` — Migration guard, removed HttpsRedirection
- `src/OnlineMenu.Web/appsettings.json` — RequireHttpsMetadata=true, Cors section, Kestrel limits
- `src/OnlineMenu.Web/appsettings.Development.json` — CORS origins, RequireHttpsMetadata override
- `src/OnlineMenu.Web/appsettings.Staging.json` — NEW
- `src/OnlineMenu.Web/appsettings.Production.json` — NEW

### QuestionerService (6 files)
- Same pattern as OnlineMenuService

### ContentService (6 files)
- `src/Content.Web/Program.cs` — Config-based CORS, renamed policy
- `src/Content.Web/Configurations/MiddlewareConfig.cs` — Migration guard, HSTS
- `src/Content.Web/appsettings.json` — RequireHttpsMetadata=true, Cors, Kestrel 500MB
- `src/Content.Web/appsettings.Development.json` — CORS origins, RequireHttpsMetadata override
- `src/Content.Web/appsettings.Staging.json` — NEW
- `src/Content.Web/appsettings.Production.json` — NEW

### NotificationService (5 files)
- `src/Notification.Web/Program.cs` — Config-based CORS, renamed policy, HSTS
- `src/Notification.Web/appsettings.json` — Cors section, Kestrel limits
- `src/Notification.Web/appsettings.Development.json` — CORS origins
- `src/Notification.Web/appsettings.Staging.json` — NEW
- `src/Notification.Web/appsettings.Production.json` — NEW
