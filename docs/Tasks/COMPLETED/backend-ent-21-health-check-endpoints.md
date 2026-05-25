# ENT-21: Health Check Endpoints for MockServer

## Status: COMPLETED
## Priority: Low
## Agent: backend-dev

## Problem Statement

The MockServer lacks health check endpoints needed for Docker/Kubernetes liveness and readiness probes. The `theme-studio` service depends on `mock-server` but has no way to confirm it is actually ready to serve traffic before starting.

## Architectural Approach

Use ASP.NET Core built-in health checks for `/healthz` (liveness) and `/readyz` (readiness), mapped outside FastEndpoints. Use a custom FastEndpoint for `/api/health` (detailed health info) following the existing domain-folder pattern.

### Changes Made

1. **MockServer.Web.csproj** -- Added `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` v9.0.1 package
2. **Program.cs** -- Registered health checks with `AddHealthChecks().AddDbContextCheck<MockDbContext>("database")`, mapped `/healthz` (liveness, always 200) and `/readyz` (readiness, checks DB, JSON response)
3. **Health/GetDetails.cs** -- New FastEndpoint at `/health` (becomes `/api/health` with route prefix) returning version, uptime, database status, memory usage
4. **docker-compose.yml** -- Added healthcheck to mock-server using `curl -f http://localhost:8080/healthz`, updated theme-studio depends_on with `condition: service_healthy`
5. **Dockerfile** -- Installed curl in runtime image for Docker healthcheck

### Affected Files

- `SyncfusionThemeStudio/MockServer/src/MockServer.Web/MockServer.Web.csproj`
- `SyncfusionThemeStudio/MockServer/src/MockServer.Web/Program.cs`
- `SyncfusionThemeStudio/MockServer/src/MockServer.Web/Health/GetDetails.cs` (NEW)
- `SyncfusionThemeStudio/docker-compose.yml`
- `SyncfusionThemeStudio/MockServer/Dockerfile`

## Verification

- [x] `dotnet build` passes with 0 warnings, 0 errors
- [x] `dotnet test` passes -- all 27 existing unit tests pass
- [x] `/healthz` returns 200 (liveness, no checks executed)
- [x] `/readyz` returns 200 when DB is connected, 503 when not (checks MockDbContext)
- [x] `/api/health` returns version, uptime, DB status, memory usage
- [x] Docker Compose uses health check for service ordering
