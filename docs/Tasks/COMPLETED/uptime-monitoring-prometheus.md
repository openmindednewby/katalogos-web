# Task: Prometheus Application Metrics + Health Aggregator

## Status: COMPLETED (2026-03-20)

## Problem Statement
The SaaS platform has Prometheus collecting container metrics via cAdvisor, but NO application-level metrics (request count, latency, error rates). All 6 backend services have health check endpoints but no central aggregator. Grafana is running but has no dashboards provisioned.

## Changes Made

### 1. Metrics.Client NuGet Package (NEW)
**Location**: `NuGetPackages/Metrics.Client/`

Created a lightweight Prometheus metrics package wrapping `prometheus-net.AspNetCore`:
- `builder.AddPrometheusMetrics()` - Builder phase: configures service name, suppresses default metrics
- `app.UsePrometheusMetrics()` - Middleware phase: HTTP metrics middleware + /metrics endpoint
- Three metrics collected:
  - `http_requests_total` (Counter) - labels: service, method, endpoint, status_code
  - `http_request_duration_seconds` (Histogram) - same labels, buckets: 5ms to 10s
  - `http_requests_in_flight` (Gauge) - label: service
- Route template normalization to keep cardinality low
- Health/metrics endpoints excluded from tracking to avoid noise

**Files created**:
- `Directory.Build.props` - Package metadata v1.0.0
- `src/Metrics.Client/Metrics.Client.csproj` - Minimal csproj
- `src/Metrics.Client/Configuration/MetricsOptions.cs` - Options class
- `src/Metrics.Client/Extensions/MetricsServiceExtensions.cs` - Extension methods
- `src/Metrics.Client/Middleware/HttpMetricsMiddleware.cs` - HTTP metrics middleware
- `publish.ps1`, `README.md`, `LICENSE`, `.gitignore`

### 2. Service Integration (6 services)
Each service received:
- `Metrics.Client` added to `Directory.Packages.props` (version 1.0.0)
- `<PackageReference Include="Metrics.Client" />` added to Web/API `.csproj`
- `Metrics.Client` pattern added to `nuget.config` `packageSourceMapping`
- `Metrics.Client.1.0.0.nupkg` copied to `local-packages/` for Docker builds
- `builder.AddPrometheusMetrics(opts => opts.ServiceName = "...")` in builder phase
- `app.UsePrometheusMetrics()` after health check endpoint mapping

**Services integrated**:
- IdentityService (ProgramExtensions.cs + Program.cs)
- QuestionerService (Program.cs)
- OnlineMenuService (Program.cs)
- ContentService (Program.cs)
- NotificationService (Program.cs)
- PaymentService (ProgramExtensions.cs + Program.cs)

### 3. Prometheus Configuration
**File**: `infrastructure/observability/prometheus/prometheus.yml`
- Added 6 scrape jobs for application metrics (one per service)
- Using docker-compose service names as targets
- 15s scrape interval with service label

**File**: `infrastructure/observability/prometheus/rules/application-alerts.yml` (NEW)
- ServiceDown alert (critical, 2min threshold)
- HighErrorRate alert (warning, >5% 5xx rate over 5min)
- HighLatency alert (warning, P95 > 2s over 5min)

### 4. Grafana Dashboards
**File**: `infrastructure/observability/provisioning/dashboards/dashboards.yaml` (NEW)
- Dashboard provisioning config pointing to dashboards directory

**File**: `infrastructure/observability/provisioning/dashboards/service-health-overview.json` (NEW)
- Service up/down status (stat panel)
- Request rate per service (timeseries)
- Error rate per service (timeseries)
- P50/P95/P99 latency per service (3 panels)
- Active requests per service (timeseries)
- Total requests last 24h (stat panel)

**File**: `infrastructure/observability/provisioning/dashboards/service-detail.json` (NEW)
- Service selector dropdown variable
- Request rate by endpoint (timeseries)
- Error rate by endpoint with status codes (timeseries)
- Error rate percentage gauge (with thresholds)
- Latency distribution P50/P95/P99 (timeseries)
- Active connections (timeseries)
- Latency by endpoint P95 (timeseries)

### 5. Health Aggregator Endpoint
**File**: `IdentityService/src/IdentityService.API/HealthAggregator/GetAggregateHealth.cs` (NEW)
- `GET /health/aggregate` endpoint (AllowAnonymous, FastEndpoints pattern)
- Polls all 6 service health endpoints concurrently
- 10-second IMemoryCache to avoid polling storms
- 5-second timeout per service poll
- Resilient: if one service is down, still returns results for others
- Response: `{ overallStatus, services: [{ name, status, responseTimeMs, lastChecked }] }`

### 6. Environment Variables
**File**: `.env.example` - Added `PROMETHEUS_ENABLED=true`

### 7. publish-all.ps1
**File**: `NuGetPackages/publish-all.ps1` - Added `Metrics.Client` to publish order

## Docker Service Names (for Prometheus scraping)
- identityservice.api -> port 8080 internally
- questioner.web -> port 8081 internally
- project1.web (OnlineMenu) -> port 8081 internally
- content.web -> port 8080 internally
- notification.web -> port 8081 internally
- paymentservice.api -> port 8080 internally

## Verification Results (2026-03-20)
- [x] All 6 service builds pass (lint + unit tests) — verified 2026-03-20 quality check
- [x] Container rebuild with Metrics.Client integration — all 6 API services rebuilt successfully
- [x] Prometheus scrapes application metrics — all 8 targets UP (bug fix: Questioner/OnlineMenu/Notification ports changed from 8081→8080 in prometheus.yml to use HTTP instead of HTTPS)
- [x] Grafana dashboards load correctly — 2 dashboards provisioned (service-health-overview, service-detail) in "SaaS Platform" folder
- [x] Health aggregator endpoint returns correct responses — GET /api/v1/health/aggregate returns overallStatus: Healthy, all 6 services responding (9-31ms)

## Bug Fix Applied During Verification
- `prometheus.yml`: Changed questioner.web, project1.web, notification.web targets from port 8081 (HTTPS) to 8080 (HTTP)
- `GetAggregateHealth.cs`: Same port fix for health aggregator polling URLs
- Root cause: Services bind HTTPS on 8081 and HTTP on 8080 internally; Prometheus and the aggregator were hitting the HTTPS port with plain HTTP, causing EOF errors
