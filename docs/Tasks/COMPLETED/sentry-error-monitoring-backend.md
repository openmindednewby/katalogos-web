# Task: Implement Sentry Error Monitoring (Backend)

## Status: COMPLETE

## Problem Statement
All 6 backend services need Sentry error monitoring for production error tracking, including
performance monitoring (transaction tracing) and correlation ID tagging for cross-service tracing.

## Architectural Decision
**Chose to extend the existing `Logging.Client` NuGet package** rather than creating a separate
`Sentry.Client` package. The rationale:
- Sentry Serilog sink was already in Logging.Client (v1.1.0)
- Creating a separate package would cause duplication and dependency conflicts
- The Logging.Client package is the single integration point for all observability concerns

## What Was Added (v1.2.0)

### 1. Full Sentry SDK (Sentry.AspNetCore)
- Added `Sentry.AspNetCore` NuGet dependency for full SDK with performance monitoring
- `ConfigureSentrySdk()` method initializes `builder.WebHost.UseSentry()` when DSN is present
- Configures `TracesSampleRate` for performance monitoring (transaction tracing)
- Sets `AutoSessionTracking = true` for release health
- No-op when DSN is empty (zero overhead)

### 2. Performance Monitoring (TracesSampleRate)
- Added `SentryTracesSampleRate` property to `LoggingOptions` (default: 0.0)
- `BindSentryConfiguration()` reads `Sentry:TracesSampleRate` from config
- Value is clamped to [0.0, 1.0] range
- All 6 appsettings.json files updated with `"TracesSampleRate": "0.1"`
- All 6 docker-compose files pass `Sentry__TracesSampleRate` env var

### 3. Correlation ID as Sentry Tag
- `SentryUserContextMiddleware` now reads `CorrelationIdContext.Current` and sets it as a Sentry tag
- `ConfigureSentrySdk()` also attaches correlation ID via `SetBeforeSend` callback
- Both authenticated and unauthenticated requests get the correlation ID tag

### 4. Refactored Configuration Binding
- Extracted `BindSentryConfiguration()` as a testable internal method
- Replaces inline config reading in `AddStructuredLogging()`

### 5. Cleaned Up Package References
- Replaced standalone `Microsoft.AspNetCore.Http.Abstractions` and `Microsoft.Extensions.*`
  packages with `<FrameworkReference Include="Microsoft.AspNetCore.App" />`
- Reduces dependency surface and avoids version conflicts

## Affected Components

### NuGet Package (Logging.Client v1.2.0)
- `src/Logging.Client/Logging.Client.csproj` - added Sentry.AspNetCore, FrameworkReference
- `src/Logging.Client/Configuration/LoggingOptions.cs` - added SentryTracesSampleRate
- `src/Logging.Client/Extensions/LoggingServiceExtensions.cs` - ConfigureSentrySdk, BindSentryConfiguration
- `src/Logging.Client/Middleware/SentryUserContextMiddleware.cs` - correlation ID tagging
- `Directory.Build.props` - version 1.2.0, added sentry/error-monitoring tags

### Services (all 6 - already had UseSentryUserContext and Sentry config)
- `appsettings.json` - added TracesSampleRate
- `docker-compose.yml` - added Sentry__TracesSampleRate env var

### Environment
- `.env.example` - added SENTRY_TRACES_SAMPLE_RATE=0.1

### Tests (101 passing)
- `SentrySinkConfigurationTests.cs` - 8 new tests for BindSentryConfiguration + TracesSampleRate
- `SentryUserContextMiddlewareTests.cs` - 3 new tests for correlation ID tagging
- `LoggingServiceExtensionsTests.cs` - updated defaults assertion

## Success Criteria
- [x] Logging.Client NuGet compiles with Sentry.AspNetCore + Sentry.Serilog
- [x] Sentry SDK only activates when DSN is non-empty
- [x] Performance monitoring configured via TracesSampleRate
- [x] Correlation ID attached as Sentry tag on every event
- [x] SentryUserContextMiddleware sets user/tenant/correlationId scope
- [x] All 6 services have TracesSampleRate in appsettings + docker-compose
- [x] .env.example has SENTRY_TRACES_SAMPLE_RATE
- [x] Unit tests: 101 passing, 0 warnings, 0 errors
- [x] Version bumped to 1.2.0

## Date Started: 2026-03-19
## Date Completed: 2026-03-19
