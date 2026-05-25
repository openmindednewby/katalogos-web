# Task: Configure Grafana Alerting for Service Health Monitoring

## Status: COMPLETED

## Problem Statement
The observability stack (Grafana, Prometheus, Loki) was running but the alerting configuration was incomplete and broken. Multiple issues existed:
1. Missing critical alert rules for service health, HTTP error rates, and response times
2. Datasource UIDs were not explicitly set, causing "data source not found" errors
3. Alert rule `labels` field used Go template syntax which only works in `annotations`
4. Observability docker-compose was missing `env_file` in Tiltfile, so env vars were empty
5. Slack contact point had `recipient` field incompatible with webhook mode
6. Container memory threshold needed update from 85% to 90%
7. Missing 4xx rate and database connection failure alerts

## Changes Made

### 1. Alert Rules - `alerts.yaml`
ADDED new "Service Health Alerts" group with 3 Prometheus-based critical alerts:
- **Service Down**: `up{job=~".*-service"} == 0`, evaluated every 1m, fires after 2m
- **High HTTP 5xx Error Rate**: 5xx/total > 5%, evaluated every 1m, fires after 5m
- **High P95 Response Time**: p95 latency > 2s, evaluated every 1m, fires after 5m

FIXED existing Log Alerts group:
- Removed templated `service` label from `labels` field (only static values allowed)
- Annotations still use `{{ $labels.xxx }}` template syntax (supported there)
- Renamed "High Error Rate" to "High Error Rate (Logs)" to distinguish from HTTP 5xx alert

### 2. Container Alerts - `container-alerts.yaml`
UPDATED Container Memory alert: threshold changed from 85% to 90%
FIXED all container alerts: removed templated `service` label from `labels` field

ADDED new "Application Warning Alerts" group:
- **High HTTP 4xx Rate**: 4xx/total > 20% over 10m, evaluated every 5m, fires after 10m
- **Database Connection Failures**: Loki log pattern match for PostgreSQL/Npgsql connection errors, threshold > 5 in 5m

### 3. Contact Points - `contact-points.yaml`
FIXED Slack contact point: removed `recipient` field which conflicts with Incoming Webhook mode in Grafana 10.2.0. Also removed `color` field (Slack webhook mode limitation).

### 4. Notification Policies - `notification-policies.yaml`
UPDATED routing:
- Default receiver changed from `slack-alerts` to `email-alerts`
- **Critical** alerts -> Slack + Email + PagerDuty (all contact points, with `continue: true`)
- **Warning** alerts -> Email only
- Group by: `alertname`, `service`
- Group wait: 30s, group interval: 5m

### 5. Datasource UIDs - `prometheus.yaml`, `loki.yaml`, `jaeger.yaml`
ADDED explicit `uid` fields to all datasource provisioning files:
- `uid: prometheus` for Prometheus datasource
- `uid: loki` for Loki datasource
- `uid: jaeger` for Jaeger datasource

This fixed the "data source not found" errors that affected ALL alert rules.

### 6. Tiltfile
FIXED observability docker-compose to include env file:
```
docker_compose('infrastructure/observability/docker-compose.yml', env_file=ENV_FILE)
```
Previously it had no `env_file`, so `SLACK_ALERTING_WEBHOOK_URL`, `ALERT_EMAIL_TO`, and `PAGERDUTY_INTEGRATION_KEY` were always empty inside the Grafana container.

## Files Modified
1. `infrastructure/observability/provisioning/alerting/alerts.yaml` - Added Service Health Alerts group, fixed label templates
2. `infrastructure/observability/provisioning/alerting/container-alerts.yaml` - Updated memory threshold to 90%, added 4xx/DB alerts, fixed label templates
3. `infrastructure/observability/provisioning/alerting/notification-policies.yaml` - Updated routing (warnings -> email only)
4. `infrastructure/observability/provisioning/alerting/contact-points.yaml` - Fixed Slack webhook mode
5. `infrastructure/observability/provisioning/datasources/prometheus.yaml` - Added explicit UID
6. `infrastructure/observability/provisioning/datasources/loki.yaml` - Added explicit UID
7. `infrastructure/observability/provisioning/datasources/jaeger.yaml` - Added explicit UID
8. `Tiltfile` - Added `env_file=ENV_FILE` for observability docker-compose

## Verification
- Grafana starts cleanly with no provisioning errors
- All 12 alert rules loaded and evaluating (confirmed via `/api/v1/provisioning/alert-rules`)
- All 3 datasources have explicit UIDs (confirmed via `/api/datasources`)
- Notification policies correctly route critical to all, warning to email only
- Alert evaluation runs on schedule (no "data source not found" errors)
- Slack/PagerDuty delivery fails with expected placeholder errors (not real credentials in dev)
- Email delivery configured to Mailpit via internal Docker network

## Alert Rules Summary (12 total)

| UID | Title | Severity | Datasource | Threshold | Duration |
|-----|-------|----------|------------|-----------|----------|
| service-down | Service Down | critical | prometheus | up == 0 | 2m |
| high-5xx-rate | High HTTP 5xx Error Rate | critical | prometheus | >5% | 5m |
| high-p95-latency | High P95 Response Time | critical | prometheus | >2s | 5m |
| container-cpu-high | Container CPU > 80% | warning | prometheus | >80% | 5m |
| container-memory-high | Container Memory > 90% | warning | prometheus | >90% | 5m |
| container-restart | Container Restart Detected | critical | prometheus | >0 | 0s |
| container-oom | Container OOM Kill | critical | prometheus | >0 | 0s |
| high-error-rate | High Error Rate (Logs) | warning | loki | >50 errors | 5m |
| auth-failure-spike | Authentication Failure Spike | critical | loki | >100 failures | 5m |
| backup-failure | Database Backup Failed | critical | loki | >0 | 0s |
| high-4xx-rate | High HTTP 4xx Rate | warning | prometheus | >20% | 10m |
| db-connection-failures | Database Connection Failures | warning | loki | >5 errors | 5m |
