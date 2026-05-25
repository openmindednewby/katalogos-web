# Task: Daily Environment Report Emails

**Status**: COMPLETED
**Created**: 2026-04-11
**Domain**: Backend (NotificationService) + Infrastructure (Observability)

---

## Goal

Build an automated daily report system that emails a comprehensive environment health summary for each deployment environment (production, staging). The system must:

1. **Auto-scale** to any number of containers — no hardcoded service lists
2. Report on container resource consumption (CPU, memory, disk, network) at idle and under traffic
3. Report HTTP traffic volume, error rates, and latency per service
4. Report error logs (count + top errors) from centralized logging
5. Report environment-level health (host RAM, disk, CPU)
6. Report user login activity
7. Send **2 separate emails** (one per environment) to `loizidesdemetris@gmail.com`

---

## Architecture Overview

### Approach: Self-Reporting Per Environment

Each environment (production, staging) runs its own observability stack (Prometheus + cAdvisor + Loki + Grafana). The NotificationService in each environment generates a daily report about **itself** by querying the co-located Prometheus and Loki.

```
Production Environment                    Staging Environment
+---------------------------+             +---------------------------+
| NotificationService       |             | NotificationService       |
|   DailyReportScheduler    |             |   DailyReportScheduler    |
|     |                     |             |     |                     |
|     +-> Prometheus :9090  |             |     +-> Prometheus :9090  |
|     +-> Loki :3100        |             |     +-> Loki :3100        |
|     +-> Keycloak Admin    |             |     +-> Keycloak Admin    |
|     |                     |             |     |                     |
|     +-> SMTP ------------->--+          |     +-> SMTP ------------->--+
+---------------------------+  |          +---------------------------+  |
                               v                                        v
                    [Production Report Email]              [Staging Report Email]
                    to: loizidesdemetris@gmail.com         to: loizidesdemetris@gmail.com
```

**Why self-reporting**: No cross-network communication. Each environment is self-contained. Adding a new environment = deploy the stack = automatic reporting.

### Auto-Scaling Strategy (No Hardcoded Services)

All data collection uses **label-based dynamic discovery** from Prometheus:

| Data | Source | Discovery Method |
|------|--------|-----------------|
| Container CPU/memory | cAdvisor | `container_cpu_usage_seconds_total{name!=""}` — all containers with names |
| Container network I/O | cAdvisor | `container_network_receive_bytes_total{name!=""}` |
| HTTP traffic/errors | Application metrics | `http_requests_total` grouped by `service` label — auto-includes new services |
| HTTP latency | Application metrics | `http_request_duration_seconds_bucket` grouped by `service` |
| Error logs | Loki | `{Level="Error"}` grouped by `ServiceName` — auto-includes new services |
| Host resources | cAdvisor | `machine_memory_bytes`, `machine_cpu_cores` |
| User logins | Keycloak Admin API | `/admin/realms/{realm}/events?type=LOGIN` |

When a new service is added to Prometheus scraping (prometheus.yml), it **automatically appears** in the next daily report with zero configuration changes.

---

## Components to Build

### 1. Reporting Module (NotificationService)

```
NotificationService/Notification/src/Notification.Web/
  Reporting/
    DailyReportSchedulerService.cs      BackgroundService (PeriodicTimer, configurable UTC hour)
    Configuration/
      ReportingOptions.cs               Config POCO (schedule, recipients, Prometheus/Loki URLs)
    DataCollectors/
      IReportDataCollector.cs           Common interface for all collectors
      PrometheusCollector.cs            Queries Prometheus HTTP API for container + app metrics
      LokiCollector.cs                  Queries Loki HTTP API for error log summaries
      KeycloakCollector.cs              Queries Keycloak admin API for login events
    Models/
      DailyReportData.cs                Aggregated report data model
      ContainerMetrics.cs               Per-container CPU/memory/network
      ServiceTrafficMetrics.cs          Per-service request/error/latency
      ErrorLogSummary.cs                Error counts + top error messages
      EnvironmentHealth.cs              Host-level CPU/RAM/disk
      LoginActivity.cs                  Login counts, unique users
    Rendering/
      DailyReportRenderer.cs            Builds HTML from DailyReportData using template
```

### 2. Email Template

New `daily-report.html` template in `Email.Smtp` NuGet package (or embedded in NotificationService).

### 3. Configuration

```json
// appsettings.json
{
  "DailyReport": {
    "Enabled": true,
    "ScheduleUtcHour": 6,
    "EnvironmentName": "Production",
    "Recipients": ["loizidesdemetris@gmail.com"],
    "Prometheus": {
      "BaseUrl": "http://prometheus:9090"
    },
    "Loki": {
      "BaseUrl": "http://loki:3100"
    },
    "Keycloak": {
      "AdminBaseUrl": "http://keycloak:8080",
      "Realm": "OnlineMenu"
    }
  }
}
```

### 4. NuGet Package Dependency

Add `Email.Smtp` package reference to `Notification.Web.csproj` and register in `Program.cs`.

---

## Prometheus Queries (Key PromQL)

### Container Resources (from cAdvisor)

```promql
# CPU usage per container (average over 24h, in cores)
avg_over_time(rate(container_cpu_usage_seconds_total{name!="",container_label_com_docker_compose_service!=""}[5m])[24h:5m]) by (container_label_com_docker_compose_service)

# Current memory usage per container
container_memory_working_set_bytes{name!="",container_label_com_docker_compose_service!=""}

# Peak memory over 24h
max_over_time(container_memory_working_set_bytes{name!="",container_label_com_docker_compose_service!=""}[24h])

# Network received/transmitted per container (total over 24h)
increase(container_network_receive_bytes_total{name!="",container_label_com_docker_compose_service!=""}[24h])
increase(container_network_transmit_bytes_total{name!="",container_label_com_docker_compose_service!=""}[24h])

# Filesystem usage
container_fs_usage_bytes{name!="",container_label_com_docker_compose_service!=""}
```

### Application Traffic (from Metrics.Client middleware)

```promql
# Total requests per service (24h)
sum(increase(http_requests_total[24h])) by (service)

# 5xx errors per service (24h)
sum(increase(http_requests_total{status_code=~"5.."}[24h])) by (service)

# 4xx errors per service (24h)
sum(increase(http_requests_total{status_code=~"4.."}[24h])) by (service)

# P50 latency per service (over 24h)
histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[24h])) by (service, le))

# P95 latency per service (over 24h)
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[24h])) by (service, le))

# P99 latency per service (over 24h)
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[24h])) by (service, le))

# Top endpoints by traffic
topk(10, sum(increase(http_requests_total[24h])) by (service, endpoint))
```

### Environment Health (from cAdvisor)

```promql
# Host total memory
machine_memory_bytes

# Host CPU cores
machine_cpu_cores

# Total container memory usage vs host
sum(container_memory_working_set_bytes{name!=""}) / machine_memory_bytes * 100
```

### Loki Error Queries (LogQL)

```logql
# Error count by service (24h)
sum(count_over_time({Level="Error"}[24h])) by (ServiceName)

# Warning count by service (24h)
sum(count_over_time({Level="Warning"}[24h])) by (ServiceName)

# Top error messages (sample from last 24h)
{Level="Error"} | json | line_format "{{.Message}}"
```

### Keycloak Login Activity

```
GET /admin/realms/{realm}/events?type=LOGIN&dateFrom={yesterday}&dateTo={today}&max=1000
GET /admin/realms/{realm}/events?type=LOGIN_ERROR&dateFrom={yesterday}&dateTo={today}&max=1000
```

---

## Email Report Sections

### 1. Header
- Environment name (Production / Staging) with color coding
- Report period (date range)
- Overall health status indicator (green/yellow/red)

### 2. Environment Health Summary
- Host CPU cores, total RAM, disk usage
- Total containers running
- Overall resource utilization percentage

### 3. Container Resource Table
- Rows: All discovered containers (auto-populated)
- Columns: CPU avg | CPU peak | Memory avg | Memory peak | Memory limit | Network in | Network out
- Color-coded: Green (<70%), Yellow (70-85%), Red (>85%) of limits

### 4. Service Traffic Table
- Rows: All discovered services (auto-populated)
- Columns: Total requests | 2xx | 4xx | 5xx | Error % | P50 | P95 | P99
- Sorted by traffic volume

### 5. Top Endpoints
- Top 10 most-called endpoints across all services
- Request count + avg latency

### 6. Error Summary
- Total errors and warnings per service
- Top 5 most frequent error messages (deduplicated)
- Link to Grafana/Loki for full details

### 7. User Activity
- Total logins in period
- Unique users who logged in
- Failed login attempts
- Peak login hour

### 8. Alerts Fired
- List of Grafana alerts that fired during the period (if queryable)

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Add `Email.Smtp` NuGet package to NotificationService
- [ ] Register SMTP services in `Program.cs`
- [ ] Create `ReportingOptions` configuration class
- [ ] Create `DailyReportSchedulerService` (BackgroundService skeleton)
- [ ] Add config section to `appsettings.json` + env var overrides in docker-compose

### Phase 2: Data Collection
- [ ] Create `PrometheusCollector` (HTTP client to Prometheus API)
- [ ] Create `LokiCollector` (HTTP client to Loki API)
- [ ] Create `KeycloakCollector` (HTTP client to Keycloak Admin API)
- [ ] Create data models (`DailyReportData`, `ContainerMetrics`, etc.)
- [ ] Unit tests for data collectors (mock HTTP responses)

### Phase 3: Report Rendering
- [ ] Create `daily-report.html` email template
- [ ] Create `DailyReportRenderer` (populates template with data)
- [ ] Unit tests for renderer

### Phase 4: Integration & Testing
- [ ] Wire up scheduler -> collectors -> renderer -> email sender
- [ ] Test with Mailpit in dev environment
- [ ] Add health check for report scheduler
- [ ] Add Prometheus metrics for report generation (duration, success/fail)

### Phase 5: Production Config
- [ ] Add environment-specific appsettings (`appsettings.Production.json`, `appsettings.Staging.json`)
- [ ] Add SMTP config for production mail server
- [ ] Add Keycloak admin credentials to env vars
- [ ] Verify report delivery end-to-end

---

## Dependencies

- **Email.Smtp** NuGet package (already published)
- **Prometheus** HTTP API (already running, same Docker network)
- **Loki** HTTP API (already running, same Docker network)
- **Keycloak** Admin API (already running)
- **Mailpit** (dev SMTP, already running on saas-network)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Prometheus query timeout on large time ranges | Use step parameter, limit cardinality, cache results |
| Keycloak admin API rate limiting | Single daily query with pagination, retry with backoff |
| Email delivery failure | Log error, retry once, Prometheus counter for failures |
| New environment with no data | Graceful handling of empty query results |
| Report generation taking too long | Timeout per collector (30s), parallel collection |

---

## Non-Goals (Out of Scope)

- Real-time dashboards (Grafana already does this)
- Alerting (Grafana alerting already handles this)
- Historical trend analysis (future enhancement)
- Multi-tenant reports (this is platform-level, not tenant-level)
