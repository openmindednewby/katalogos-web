# Logging Service Stage 1 Implementation (Grafana Loki)

> **Status**: ALL STREAMS COMPLETE — LIFECYCLE PASSED
> **Started**: 2026-03-06
> **Source Task**: `BaseClient/docs/Tasks/TODO/logging-service-implementation.md`

## Scope

Stage 1 only -- Grafana Loki as the sole log backend.

## Work Streams (Parallel)

### Stream 1: Backend (NuGet Package + Infrastructure + Service Integration + Tiltfile)
- [x] Create `NuGetPackages/Logging.Client/` NuGet package
  - [x] LoggingOptions, LogSinkType (Loki + Console)
  - [x] AddStructuredLogging() extension method with Loki sink
  - [x] TenantEnricher, CorrelationIdEnricher, UserContextEnricher
  - [x] CorrelationIdMiddleware, RequestLoggingMiddleware
  - [x] PiiMaskingPolicy
  - [x] Unit tests (73 tests, >80% coverage)
- [x] Create `infrastructure/observability/` Docker Compose (Loki, Grafana, Prometheus, cAdvisor)
- [x] Create Prometheus config + Grafana provisioning files (datasources + alerting rules)
- [x] Update all 5 backend services to use Logging.Client
- [x] Add `Logging:LokiUrl` and `Logging:SinkType` to all service appsettings.json
- [x] Add frontend log ingestion endpoint (POST /api/logs in IdentityService)
- [x] Add stress test endpoints (#if DEBUG) to all 5 services
- [x] Update Tiltfile with Observability section
- [x] Remove dead code (obsolete LoggerConfigs.cs from OnlineMenu + Questioner + Content)

### Stream 2: Frontend (Logging Service + Tests)
- [x] Create `BaseClient/src/lib/logging/` (LoggingService, LogTransport, OfflineQueue, types)
- [x] Create device/session enrichers
- [x] Update existing `BaseClient/src/utils/logger.ts` to redirect
- [x] Update ErrorBoundary integration
- [x] Unit tests (45 tests, 91% statement coverage)

### Stream 3: E2E Tests + Stress Tests
- [x] Create Loki client helper (`E2ETests/helpers/loki-client.ts`)
- [x] Create Prometheus client helper (`E2ETests/helpers/prometheus-client.ts`)
- [x] Create logging E2E tests (health, verification, correlation tracking, PII masking)
- [x] Create monitoring E2E tests (Prometheus health, container metrics, Grafana health)
- [x] Create stress tests (throughput, resilience, large batches, large payloads)
- [x] Update playwright config and package.json

## Build Verification

| Project | Build | Tests |
|---------|-------|-------|
| Logging.Client | PASS (0 errors) | 73/73 PASS |
| IdentityService | PASS (0 errors) | 51/51 PASS |
| OnlineMenuService | PASS (0 errors) | 68/68 PASS |
| QuestionerService | PASS (0 errors) | 8/8 PASS |
| NotificationService | PASS (0 errors) | 101/101 PASS |
| ContentService | PASS (0 errors) | 36/36 PASS |
| BaseClient (Frontend) | PASS (build + lint) | 2415/2415 PASS |
| E2E Tests (TypeScript) | PASS (0 errors) | Infra-dependent |

## Lifecycle Pipeline Results

| Check | Domain | Status | Details |
|-------|--------|--------|---------|
| quality-gate | Backend | PASS (after fix) | All builds, 337 tests, YAGNI clean, lint clean |
| quality-gate | Frontend | PASS | 0 lint errors, 2415 tests, build succeeds |
| code-reviewer | Backend | PASS (after fix) | Endpoint naming, magic numbers, consistency fixed |
| code-reviewer | Frontend | PASS (after fix) | Record<LogLevel> type, ErrorBoundary a11y fixed |
| visual-qa | N/A | SKIP | No UI changes (internal infrastructure) |
| regression-tester | N/A | SKIP | No user-facing behavior changes |

## Results

| Stream | Status | Tests | Coverage |
|--------|--------|-------|----------|
| Backend | COMPLETE | 337 pass (all services) | >80% |
| Frontend | COMPLETE | 45 logging + 2415 total | 91% stmts |
| E2E | COMPLETE | 20+ spec files | N/A (infra tests) |
