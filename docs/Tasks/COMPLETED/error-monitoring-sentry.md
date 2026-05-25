# Task: Error Monitoring with Sentry

**Status**: COMPLETED (already implemented)
**Date**: 2026-03-22
**Domain**: Cross-cutting (Frontend + Backend + NuGet Package)

---

## Context

The user requested design and implementation of Sentry error monitoring for both frontend (BaseClient) and backend (all 5 C# services). After thorough codebase analysis, the integration was found to be **already fully implemented** across all layers.

---

## Architecture Overview

### Data Flow

```
Frontend (React/Expo)                   Backend (ASP.NET Core x6)
    |                                        |
    v                                        v
@sentry/react                          Sentry.AspNetCore + Sentry.Serilog
    |                                        |
    v                                        v
src/lib/monitoring/sentry.ts           Logging.Client NuGet package
    |                                        |
    +------- Sentry Cloud (DSN) --------+
```

### Frontend Architecture

```
app/_layout.tsx
  |-- initSentry()              --> src/lib/monitoring/sentry.ts
  |-- <SentryEffects />         --> useSentryUser() hook
  |-- <ErrorBoundary />         --> captureException() on React errors
  |
  src/lib/api/errors/
  |-- errorReporter.ts          --> captureException() on API errors
  |
  src/config/environment.ts
  |-- SENTRY_DSN                --> per-environment (dev/test/prod)
  |-- SENTRY_ENVIRONMENT
  |-- SENTRY_TRACES_SAMPLE_RATE
```

### Backend Architecture

```
NuGetPackages/Logging.Client/
  |-- Extensions/LoggingServiceExtensions.cs
  |     |-- AddStructuredLogging()    --> Sentry SDK + Serilog sink init
  |     |-- ConfigureSentrySdk()      --> Performance monitoring, correlationId
  |     |-- ConfigureSentrySink()     --> Error-level log forwarding
  |     |-- BindSentryConfiguration() --> appsettings.json "Sentry" section
  |
  |-- Middleware/SentryUserContextMiddleware.cs
  |     |-- Sets Sentry scope: userId (sub claim), tenantId, correlationId
  |
  |-- Configuration/LoggingOptions.cs
        |-- SentryDsn, SentryEnvironment, SentryMinimumLevel, SentryTracesSampleRate

Each service's Program.cs:
  builder.AddStructuredLogging(opts => { ... });  --> Initialises Sentry
  app.UseSentryUserContext();                     --> Tags requests
```

---

## Implementation Inventory

### Frontend (BaseClient)

| Component | File | Purpose |
|-----------|------|---------|
| Sentry wrapper | `src/lib/monitoring/sentry.ts` | `initSentry`, `captureException`, `captureMessage`, `setSentryUser`, `clearSentryUser` -- all no-op when DSN is empty |
| User scope hook | `src/lib/monitoring/useSentryUser.ts` | Syncs Redux auth state with Sentry user scope (userId + tenantId) |
| Barrel export | `src/lib/monitoring/index.ts` | Re-exports all monitoring functions |
| Error boundary | `src/components/ErrorBoundary/ErrorBoundary.tsx` | Calls `captureException` in `componentDidCatch` |
| Analytics boundary | `src/components/ErrorBoundary/AnalyticsErrorBoundary.tsx` | Wraps ErrorBoundary with analytics event |
| API error reporter | `src/lib/api/errors/errorReporter.ts` | Reports classified HTTP errors to Sentry with extra context |
| Environment config | `src/config/environment.ts` | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` per env |
| Root layout | `app/_layout.tsx` | Calls `initSentry()` at startup, renders `<SentryEffects />` |
| Package | `package.json` | `@sentry/react: ^10.44.0` |

| Test | File |
|------|------|
| Sentry wrapper tests | `src/lib/monitoring/sentry.test.ts` (12 tests: enabled + disabled paths) |
| User scope hook tests | `src/lib/monitoring/useSentryUser.test.tsx` (3 tests) |

### Backend (Logging.Client NuGet Package)

| Component | File | Purpose |
|-----------|------|---------|
| Service extensions | `Extensions/LoggingServiceExtensions.cs` | `AddStructuredLogging()`, `ConfigureSentrySdk()`, `ConfigureSentrySink()`, `BindSentryConfiguration()` |
| User context middleware | `Middleware/SentryUserContextMiddleware.cs` | Sets Sentry scope from JWT claims (sub, tenant_id, correlationId) |
| Configuration | `Configuration/LoggingOptions.cs` | `SentryDsn`, `SentryEnvironment`, `SentryMinimumLevel`, `SentryTracesSampleRate` |
| NuGet deps | `Logging.Client.csproj` | `Sentry.AspNetCore 6.*`, `Sentry.Serilog 6.*` |

| Test | File |
|------|------|
| Sink config tests | `SentrySinkConfigurationTests.cs` (12 tests: DSN empty/null/valid, defaults, binding, clamping) |
| Middleware tests | `SentryUserContextMiddlewareTests.cs` (10 tests: auth/unauth, claims, concurrent, correlationId) |

### Backend Services (all 6 -- Identity, Questioner, OnlineMenu, Content, Notification, Payment)

Each service's `Program.cs` contains:
```csharp
builder.AddStructuredLogging(opts => { opts.ServiceName = "..."; });
app.UseSentryUserContext();
```

Each service's `appsettings.json` contains:
```json
"Sentry": {
  "Dsn": "",
  "Environment": "Development",
  "MinimumEventLevel": "Error"
}
```

Each service's `docker-compose.yml` maps environment variables:
```yaml
- Sentry__Dsn=${SENTRY_DSN_BACKEND:-}
- Sentry__TracesSampleRate=${SENTRY_TRACES_SAMPLE_RATE:-0.1}
```

### Environment Configuration

| File | Variable | Purpose |
|------|----------|---------|
| `.env.example` | `SENTRY_DSN_BACKEND=` | Backend DSN placeholder |
| `.env.example` | `SENTRY_TRACES_SAMPLE_RATE=0.1` | Performance sample rate |
| `.env.staging.example` | `SENTRY_DSN_BACKEND=https://...` | Staging DSN placeholder |
| `.env.production.example` | `SENTRY_DSN_BACKEND=https://...` | Production DSN placeholder |
| `BaseClient/src/config/environment.ts` | `SENTRY_DSN` per env | Frontend DSN (empty by default) |

---

## Security Design

- **SendDefaultPii = false** in both frontend and backend -- no emails, names, or other PII sent
- Only opaque GUIDs (userId, tenantId) are used as identifiers
- CorrelationId is attached as a tag for cross-service tracing
- DSN is read from environment variables, never hardcoded
- Empty DSN = complete no-op (safe for dev environments without Sentry)

---

## How to Enable Sentry

### For Backend (all services at once)

1. Create a Sentry project, obtain a DSN
2. Add to `.env.local`:
   ```
   SENTRY_DSN_BACKEND=https://your-key@o123.ingest.sentry.io/456
   SENTRY_TRACES_SAMPLE_RATE=0.1
   ```
3. Restart services (`tilt trigger <service>-api`)

### For Frontend

1. Create a separate Sentry project for the frontend
2. Update `BaseClient/src/config/environment.ts` for the target environment:
   ```typescript
   SENTRY_DSN: 'https://your-frontend-key@o123.ingest.sentry.io/789',
   SENTRY_ENVIRONMENT: 'production',
   SENTRY_TRACES_SAMPLE_RATE: 0.1,
   ```
3. Rebuild the frontend

---

## Conclusion

No code changes are required. The Sentry integration is complete and production-ready across:
- **Frontend**: `@sentry/react` with error boundary integration, API error reporting, user/tenant tagging, and comprehensive unit tests
- **Backend**: `Sentry.AspNetCore` + `Sentry.Serilog` via the shared `Logging.Client` NuGet package, with user/tenant/correlationId middleware and comprehensive unit tests
- **Infrastructure**: Docker Compose environment variable mapping, `.env.example` templates for all environments

The entire integration is designed to be no-op when DSN is empty, making it safe for development environments.
