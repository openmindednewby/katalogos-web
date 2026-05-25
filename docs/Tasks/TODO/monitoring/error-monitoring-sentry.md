# Error Monitoring (Sentry Integration)

> **Status**: TODO
> **Priority**: P3 - Operational Visibility
> **Estimated Scope**: Small-Medium (Frontend + Backend)
> **Estimated Effort**: 1-2 days

---

## 1. Problem

Production errors go to Loki logs only. No real-time alerts for JavaScript errors, no stack traces with source maps, no user impact analysis, no error grouping/deduplication, no release tracking.

---

## 2. Solution

Integrate Sentry for both frontend and backend error monitoring.

### 2.1 Why Sentry

- Free tier: 5K errors/month (sufficient for launch)
- Source map support for minified JS
- .NET SDK for backend services
- Release tracking ties errors to deployments
- User context shows which users are affected
- Performance monitoring (optional)

---

## 3. Frontend Integration

### 3.1 Install

```bash
npm install @sentry/react @sentry/browser
```

### 3.2 Initialize in `_layout.tsx`

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: envConfig.SENTRY_DSN,
  environment: envConfig.ENVIRONMENT,
  release: envConfig.APP_VERSION,
  enabled: envConfig.ENVIRONMENT !== 'development',
  tracesSampleRate: 0.1, // 10% of transactions
});
```

### 3.3 Error Boundary Integration

Update existing `ErrorBoundary` to report to Sentry:
```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
}
```

### 3.4 Source Maps

Add source map upload to build pipeline:
```bash
npx @sentry/cli sourcemaps upload --release=$VERSION ./dist
```

---

## 4. Backend Integration

### 4.1 Per Service

```csharp
builder.WebHost.UseSentry(o =>
{
    o.Dsn = builder.Configuration["Sentry:Dsn"];
    o.Environment = builder.Environment.EnvironmentName;
    o.TracesSampleRate = 0.1;
    o.SendDefaultPii = false; // GDPR
});
```

### 4.2 User Context

```csharp
app.Use(async (context, next) =>
{
    var userId = context.User.FindFirstValue("sub");
    if (userId != null)
        SentrySdk.ConfigureScope(scope => scope.User = new SentryUser { Id = userId });
    await next();
});
```

---

## 5. Implementation Steps

1. Create Sentry project (frontend + backend)
2. Add `@sentry/react` to BaseClient
3. Initialize Sentry in root layout (production only)
4. Update ErrorBoundary to capture exceptions
5. Add `Sentry.AspNetCore` NuGet package to all backend services
6. Configure Sentry in each service's Program.cs
7. Add source map upload to frontend build pipeline
8. Set up Sentry alert rules (Slack/email on new issues)
9. Add Sentry DSN to secrets management (not hardcoded)

---

## 6. Verification

- [ ] Frontend JS errors appear in Sentry with source maps
- [ ] Backend exceptions appear in Sentry with stack traces
- [ ] User context attached to errors (without PII)
- [ ] Errors grouped and deduplicated
- [ ] Alert notifications sent on new error types
- [ ] No errors reported in development environment
