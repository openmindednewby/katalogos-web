# Backend: Complete Distributed Tracing Setup

## Status: COMPLETED

## Problem Statement

OpenTelemetry tracing was configured in code across all 5 services via the `Tracing.Client` NuGet package, and Jaeger was running in Docker. However, the docker-compose environment variable naming was mismatched with what the Tracing.Client reads.

## Root Cause

All 6 docker-compose files set `OTEL_EXPORTER_OTLP_ENDPOINT=http://saas-jaeger:4317`, but the `Tracing.Client` package intentionally does NOT read `OTEL_EXPORTER_OTLP_ENDPOINT` (to avoid conflicts with .NET Aspire's `UseOtlpExporter()`). The package reads from `Tracing:OtlpEndpoint` config (env var: `Tracing__OtlpEndpoint`), which was never set in any docker-compose.

## Discovery

The Identity service already had full OpenTelemetry setup:
- `Tracing.Client` NuGet package referenced in csproj
- `builder.AddTracingDefaults(opts => opts.ServiceName = "IdentityService")` in Program.cs
- `OTEL_EXPORTER_OTLP_ENDPOINT` env var in docker-compose (but wrong key name)

So the issue was NOT "add OpenTelemetry to Identity" but rather "fix the env var naming across ALL services."

The Grafana Jaeger datasource was also already configured at `infrastructure/observability/provisioning/datasources/jaeger.yaml`.

## Changes Made

### 1. Fixed docker-compose env var in all 6 services
Changed `OTEL_EXPORTER_OTLP_ENDPOINT` to `Tracing__OtlpEndpoint` in:
- `IdentityService/docker-compose.yml`
- `OnlineMenuSaaS/OnlineMenuService/docker-compose.yml`
- `QuestionerService/docker-compose.yml`
- `ContentService/docker-compose.yml`
- `NotificationService/docker-compose.yml`
- `PaymentService/docker-compose.yml`

### 2. Fixed misleading Tracing.Client README
- Updated env var table to show `Tracing__OtlpEndpoint` (not `OTEL_EXPORTER_OTLP_ENDPOINT`)
- Added note explaining why `OTEL_EXPORTER_OTLP_ENDPOINT` is not read
- Fixed docker-compose example

### 3. Fixed misleading TracingOptions doc comment
- Updated `OtlpEndpoint` property XML doc to correctly state `Tracing__OtlpEndpoint` is the mechanism

### 4. Added uid to Grafana Jaeger datasource
- Added `uid: jaeger` to the provisioned datasource for cross-referencing

## Verification

- All 5 API services rebuilt successfully via Tilt
- Identity lint: PASSED
- Identity YAGNI: PASSED
- Identity unit tests: PASSED
- Tracing.Client lint: PASSED
- Tracing.Client unit tests: PASSED
- Jaeger UI shows all 5 services: IdentityService, QuestionerService, OnlineMenuService, ContentService, NotificationService
- Traces confirmed present via Jaeger API query
