# API Versioning Implementation Plan

> **Status**: COMPLETED (All phases done - RoutePrefix `api/v1` across 7 services, 308 redirects, swagger regen, E2E path updates)
> **Priority**: P2 - Required Before Public API
> **Estimated Effort**: 3-5 days
> **Author**: Chief Architect
> **Date**: 2026-03-15
> **Parent Doc**: `BaseClient/docs/Tasks/TODO/backend-services/api-versioning.md`

---

## 1. Current State Analysis

### 1.1 Route Prefix Configuration Per Service

| Service | RoutePrefix | Location | Effect |
|---------|------------|----------|--------|
| **IdentityService** | `"api"` | `ProgramExtensions.cs:215` | Endpoints at `/api/{route}` |
| **OnlineMenuService** | *(none)* | `MiddlewareConfig.cs:22` | Endpoints at `/{route}` (bare `UseFastEndpoints()`) |
| **QuestionerService** | *(none)* | `MiddlewareConfig.cs:22` | Endpoints at `/{route}` (bare `UseFastEndpoints()`) |
| **ContentService** | `"api"` | `MiddlewareConfig.cs:33` | Endpoints at `/api/{route}` |
| **NotificationService** | *(none)* | `Program.cs:283` | Endpoints at `/{route}` (bare `UseFastEndpoints()`) |
| **PaymentService** | `"api"` | `ProgramExtensions.cs:164` | Endpoints at `/api/{route}` |
| **MockServer** | `"api"` | `Program.cs:107` | Endpoints at `/api/{route}` |

### 1.2 Endpoint Route Patterns Per Service

**IdentityService** (RoutePrefix = `"api"`) -- routes are relative:
- `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/methods`
- `/users`, `/users/{userId}`, `/users/{userId}/password`, `/users/{userId}/enabled`
- `/tenants`, `/tenants/{TenantId}`, `/tenants/{tenantId}/theme`, `/tenants/{tenantId}/auth-config`, `/tenants/sync`, `/tenants/theme-presets`
- `/me/profile`, `/me/password`, `/me/sessions`, `/me/sessions/{sessionId}`, `/me/preferences`
- `/privacy/consent`, `/privacy/data-export`, `/privacy/data-export/{requestId}`, `/privacy/data-export/{requestId}/download`, `/privacy/delete-request`, `/privacy/delete-request/{requestId}`, `/privacy/delete-request/{requestId}/confirm`
- **BUG**: `/api/logs` (hardcoded absolute -- becomes `/api/api/logs` with RoutePrefix!)
- **BUG**: `/api/debug/log-stress` (hardcoded absolute -- becomes `/api/api/debug/log-stress`!)

**OnlineMenuService** (RoutePrefix = *none*) -- routes are bare:
- `/TenantMenus`, `/TenantMenus/{ExternalId:guid}`, `/TenantMenus/list`, `/TenantMenus/list/all`, `/TenantMenus/{ExternalId}/activate`, `/TenantMenus/{ExternalId}/deactivate`
- `/public/menus/{ExternalId:guid}`, `/public/domains/resolve`
- `/CustomDomains`, `/CustomDomains/{ExternalId:guid}`, `/CustomDomains/{ExternalId:guid}/verify`
- `/internal/domains/check`
- **BUG**: `/api/qr/{MenuId:guid}` (hardcoded `/api/` prefix)
- **BUG**: `/api/menus/{MenuId:guid}/qr-analytics` (hardcoded `/api/` prefix)
- **BUG**: `/api/debug/log-stress` (hardcoded `/api/` prefix)

**QuestionerService** (RoutePrefix = *none*) -- routes are bare:
- `/questionerTemplates`, `/questionerTemplates/{ExternalId:guid}`, `/questionerTemplates/list`, `/questionerTemplates/active`, `/questionerTemplates/ActivateTemplate/{ExternalId:guid}`, `/questionerTemplates/delete/inactive`
- `/completedQuestioners`, `/completedQuestioners/{ExternalId:guid}`, `/completedQuestioners/list`, `/completedQuestioners/list/byUserId`
- **BUG**: `/api/debug/log-stress` (hardcoded `/api/` prefix)

**ContentService** (RoutePrefix = `"api"`) -- routes are relative:
- `/content/upload-url`, `/content/upload-complete`
- `/content`, `/content/{id:guid}`, `/content/{id:guid}/url`, `/content/{id:guid}/public-url`
- **BUG**: `/api/debug/log-stress` (hardcoded absolute -- becomes `/api/api/debug/log-stress`!)

**NotificationService** (RoutePrefix = *none*) -- routes include `/api/` manually:
- `/api/notifications`, `/api/notifications/unread-count`, `/api/notifications/read-all`, `/api/notifications/{Id}/read`
- `/api/notifications/preferences`
- `/api/notifications/test/trigger`, `/api/notifications/test/bulk`, `/api/notifications/test/clear`, `/api/notifications/test/health`
- `/api/debug/log-stress`
- **SignalR Hub**: `/hubs/notifications` (not FastEndpoints, not affected by RoutePrefix)

**PaymentService** (RoutePrefix = `"api"`) -- routes are relative:
- `/subscriptions`, `/subscriptions/current`, `/subscriptions/current/plan`, `/subscriptions/features/{FeatureCode}`
- `/pricing-plans`
- `/billing/portal-session`, `/billing/history`
- `/webhooks/stripe`

### 1.3 Resulting Effective URLs Today

| Service | Example Effective URL |
|---------|----------------------|
| Identity | `http://localhost:5002/api/auth/login` |
| OnlineMenu | `https://localhost:5006/TenantMenus` (no `/api/` prefix!) |
| Questioner | `https://localhost:5004/questionerTemplates/list` (no `/api/` prefix!) |
| Content | `http://localhost:5009/api/content/upload-url` |
| Notification | `http://localhost:5015/api/notifications` (manually prefixed) |
| Payment | `http://localhost:5018/api/subscriptions/current` |

### 1.4 Frontend API Client Architecture

- **Per-service HTTP clients**: `BaseClient/src/server/httpClient{Service}.ts` each create an axios instance with `baseURL` from `environment.ts`
- **Orval codegen**: Reads `src/server/swagger/{service}.json`, generates hooks into `src/server/autoGeneratedHooks/{service}/`
- **Mutator pattern**: Stub mutators in `src/server/mutators/` delegate to real HTTP clients at runtime via registry
- **URL construction**: Orval-generated code passes relative paths (from swagger `paths` keys) to the mutator. The mutator passes them to `httpService.get/post/etc`, which uses `baseURL` from client options (falling back to `env.API_URL`)
- **No `/api/` suffix in baseURLs**: All `environment.ts` URLs point to bare service roots (e.g., `http://localhost:5002`)
- The E2E `AuthHelper` class **manually appends `/api`** to the identity base URL

### 1.5 Swagger JSON Files (Orval Input)

Each swagger file's `paths` keys match the service's effective route:
- `identity.json`: paths like `/api/users`, `/api/auth/login` (includes `/api/` because RoutePrefix adds it)
- `onlinemenu.json`: paths like `/TenantMenus/{externalId}` (no `/api/` -- no RoutePrefix)
- `questioner.json`: paths like `/questionerTemplates/list` (no `/api/` -- no RoutePrefix)
- `content.json`: paths like `/api/content/upload-complete` (includes `/api/`)
- `notification.json`: paths like `/api/notifications/preferences` (manually prefixed)

### 1.6 SignalR Hub

The notification hub is mapped via `app.MapHub<NotificationHub>("/hubs/notifications")`, which is outside FastEndpoints and unaffected by RoutePrefix. It must remain separate from the versioned API.

---

## 2. Pre-Existing Bugs to Fix First

Before versioning, fix route inconsistencies that will compound during migration:

### Bug 1: Double `/api/` prefix in Identity, Content, OnlineMenu, Questioner

Files with hardcoded `/api/` in their route constant, where RoutePrefix already adds `/api/`:

| Service | File | Current Route | Effective URL | Correct Route |
|---------|------|---------------|---------------|---------------|
| Identity | `LogIngestion/LogIngestionEndpoint.cs` | `/api/logs` | `/api/api/logs` (double!) | `/logs` |
| Identity | `LogStress/LogStressEndpoint.cs` | `/api/debug/log-stress` | `/api/api/debug/log-stress` (double!) | `/debug/log-stress` |
| Content | `LogStress/LogStressEndpoint.cs` | `/api/debug/log-stress` | `/api/api/debug/log-stress` (double!) | `/debug/log-stress` |

For services WITHOUT RoutePrefix but with `/api/` in routes:

| Service | File | Current Route | Notes |
|---------|------|---------------|-------|
| OnlineMenu | `QrScans/Track.cs` | `/api/qr/{MenuId:guid}` | Manually prefixed |
| OnlineMenu | `QrScans/GetAnalytics.cs` | `/api/menus/{MenuId:guid}/qr-analytics` | Manually prefixed |
| OnlineMenu | `LogStress/LogStressEndpoint.cs` | `/api/debug/log-stress` | Manually prefixed |
| Questioner | `LogStress/LogStressEndpoint.cs` | `/api/debug/log-stress` | Manually prefixed |
| Notification | All endpoints | `/api/notifications/...` | Manually prefixed |
| Notification | `LogStress/LogStressEndpoint.cs` | `/api/debug/log-stress` | Manually prefixed |

### Bug 2: OnlineMenu unit test hardcodes `/api/` routes

`OnlineMenu.UnitTests/Domain/EndpointRequestResponseTests.cs` asserts:
```csharp
GetQrAnalyticsRequest.Route.ShouldBe("/api/menus/{MenuId:guid}/qr-analytics");
TrackQrScanRequest.Route.ShouldBe("/api/qr/{MenuId:guid}");
```

These must be updated when route constants change.

---

## 3. Target State

All services will use `RoutePrefix = "api/v1"` and all endpoint route constants will be relative (no `/api/` prefix).

### Effective URLs After Migration

| Service | Example URL |
|---------|-------------|
| Identity | `http://localhost:5002/api/v1/auth/login` |
| OnlineMenu | `https://localhost:5006/api/v1/TenantMenus` |
| Questioner | `https://localhost:5004/api/v1/questionerTemplates/list` |
| Content | `http://localhost:5009/api/v1/content/upload-url` |
| Notification | `http://localhost:5015/api/v1/notifications` |
| Payment | `http://localhost:5018/api/v1/subscriptions/current` |
| NotificationHub | `http://localhost:5015/hubs/notifications` (unchanged) |

---

## 4. Implementation Plan

### Phase 0: Fix Pre-Existing Route Bugs (Prerequisite)

**Goal**: Normalize all routes so every service uses RoutePrefix and endpoint routes are relative.

#### Step 0.1: Add RoutePrefix to services that lack it

| Service | File to Modify | Change |
|---------|---------------|--------|
| OnlineMenuService | `OnlineMenu.Web/Configurations/MiddlewareConfig.cs:22` | Change `app.UseFastEndpoints()` to `app.UseFastEndpoints(c => { c.Endpoints.RoutePrefix = "api"; })` |
| QuestionerService | `Questioner.Web/Configurations/MiddlewareConfig.cs:22` | Change `app.UseFastEndpoints()` to `app.UseFastEndpoints(c => { c.Endpoints.RoutePrefix = "api"; })` |
| NotificationService | `Notification.Web/Program.cs:283` | Change `app.UseFastEndpoints()` to `app.UseFastEndpoints(c => { c.Endpoints.RoutePrefix = "api"; })` |

#### Step 0.2: Remove `/api/` prefix from endpoint route constants

**OnlineMenuService** -- remove `/api/` from route constants:
- `QrScans/Track.cs`: `/api/qr/{MenuId:guid}` --> `/qr/{MenuId:guid}`
- `QrScans/GetAnalytics.cs`: `/api/menus/{MenuId:guid}/qr-analytics` --> `/menus/{MenuId:guid}/qr-analytics`
- `LogStress/LogStressEndpoint.cs`: `/api/debug/log-stress` --> `/debug/log-stress`

**QuestionerService** -- remove `/api/` from route constants:
- `LogStress/LogStressEndpoint.cs`: `/api/debug/log-stress` --> `/debug/log-stress`

**NotificationService** -- remove `/api/` from ALL route constants:
- `Notifications/List.cs`: `/api/notifications` --> `/notifications`
- `Notifications/GetUnreadCount.cs`: `/api/notifications/unread-count` --> `/notifications/unread-count`
- `Notifications/MarkAllAsRead.cs`: `/api/notifications/read-all` --> `/notifications/read-all`
- `Notifications/MarkAsRead.cs`: `/api/notifications/{Id}/read` --> `/notifications/{Id}/read`
- `Preferences/Get.cs`: `/api/notifications/preferences` --> `/notifications/preferences`
- `Preferences/Update.cs`: `/api/notifications/preferences` --> `/notifications/preferences`
- `Testing/StressTestEndpoints.cs`: remove all `/api/` prefixes from the 4 test routes
- `LogStress/LogStressEndpoint.cs`: `/api/debug/log-stress` --> `/debug/log-stress`

**IdentityService** -- remove `/api/` from hardcoded routes:
- `LogIngestion/LogIngestionEndpoint.cs`: `/api/logs` --> `/logs`
- `LogStress/LogStressEndpoint.cs`: `/api/debug/log-stress` --> `/debug/log-stress`

**ContentService** -- remove `/api/` from hardcoded routes:
- `LogStress/LogStressEndpoint.cs`: `/api/debug/log-stress` --> `/debug/log-stress`

#### Step 0.3: Update unit tests that assert route constants

- `OnlineMenu.UnitTests/Domain/EndpointRequestResponseTests.cs`: Update the two route assertions to match new relative values

#### Step 0.4: Regenerate Swagger JSON, re-run Orval, update E2E tests

After deploying Phase 0 changes:
1. Start each service, fetch its swagger doc from `http://localhost:{port}/swagger/v1/swagger.json`
2. Save to `BaseClient/src/server/swagger/{service}.json`
3. Run `npx orval` to regenerate hooks (the swagger paths will now all include `/api/` from RoutePrefix)
4. Update E2E tests that reference routes directly

**Verification**: All services respond at `/api/{route}` consistently. No double `/api/api/` paths. All E2E and unit tests pass.

---

### Phase 1: Change RoutePrefix to `api/v1` (All Services Simultaneously)

**Goal**: All endpoints move from `/api/{route}` to `/api/v1/{route}`.

#### Step 1.1: Update RoutePrefix in each service

| Service | File | Change |
|---------|------|--------|
| IdentityService | `ProgramExtensions.cs:215` | `config.Endpoints.RoutePrefix = "api/v1";` |
| OnlineMenuService | `MiddlewareConfig.cs` (from Phase 0) | `c.Endpoints.RoutePrefix = "api/v1";` |
| QuestionerService | `MiddlewareConfig.cs` (from Phase 0) | `c.Endpoints.RoutePrefix = "api/v1";` |
| ContentService | `MiddlewareConfig.cs:33` | `c.Endpoints.RoutePrefix = "api/v1";` |
| NotificationService | `Program.cs` (from Phase 0) | `c.Endpoints.RoutePrefix = "api/v1";` |
| PaymentService | `ProgramExtensions.cs:164` | `config.Endpoints.RoutePrefix = "api/v1";` |
| MockServer | `Program.cs:107` | `c.Endpoints.RoutePrefix = "api/v1";` |

#### Step 1.2: Update Swagger document version settings

For services that already set `settings.Version` (Identity, Payment, Notification, MockServer), verify the value is `"v1"`. For services that do not set it (OnlineMenu, Questioner, Content), add it:

```csharp
o.DocumentSettings = settings =>
{
    settings.Title = "{Service} API";
    settings.Version = "v1";
    // ... existing auth config ...
};
```

#### Step 1.3: Add 301 redirect middleware for backward compatibility

Create a shared NuGet package or middleware class (one per service, or a shared package in `NuGetPackages/`):

```csharp
// ApiVersionRedirectMiddleware.cs
// Redirects /api/{path} to /api/v1/{path} with 301 Moved Permanently
public class ApiVersionRedirectMiddleware
{
    private readonly RequestDelegate _next;

    public ApiVersionRedirectMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;

        // Only redirect /api/ paths that are NOT already versioned
        if (path != null
            && path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase)
            && !path.StartsWith("/api/v", StringComparison.OrdinalIgnoreCase))
        {
            var newPath = "/api/v1" + path[4..]; // Replace /api/ with /api/v1/
            var query = context.Request.QueryString.Value;
            context.Response.StatusCode = 301;
            context.Response.Headers.Location = newPath + query;
            return;
        }

        await _next(context);
    }
}
```

Register BEFORE `UseFastEndpoints()` in each service's pipeline:
```csharp
app.UseMiddleware<ApiVersionRedirectMiddleware>();
app.UseFastEndpoints(c => { c.Endpoints.RoutePrefix = "api/v1"; });
```

**Important**: The redirect middleware must be registered BEFORE `UseFastEndpoints()` to catch old-format requests before they 404.

#### Step 1.4: Regenerate Swagger JSON files

After starting all services with the new prefix:
1. Fetch swagger from each service: `http://localhost:{port}/swagger/v1/swagger.json`
2. Save to `BaseClient/src/server/swagger/{service}.json`
3. The paths in the swagger files will now be `/api/v1/auth/login` etc.

#### Step 1.5: Update frontend (no code changes needed in HTTP clients!)

Because Orval generates the full path from swagger (e.g., `/api/v1/auth/login`), and the HTTP client uses `baseURL` (e.g., `http://localhost:5002`), the generated hooks will automatically use the new versioned paths after re-running Orval.

Run: `npx orval` in `BaseClient/`

The mutators, httpClients, and environment config do NOT need changes -- they only provide the base URL, and the full path comes from Orval output.

#### Step 1.6: Update E2E tests

**Pattern**: E2E tests reference API paths in two ways:
1. Via `AuthHelper` which appends `/api` to the base URL
2. Via direct URL strings in test files

**Files to update**:

| File | Current | New |
|------|---------|-----|
| `helpers/auth-helper.ts:31` | `apiBase.endsWith('/api') ? apiBase : \`${apiBase}/api\`` | `apiBase.endsWith('/api/v1') ? apiBase : \`${apiBase}/api/v1\`` |
| `tests/multi-tenant.teardown.ts:68` | `identityApiUrl.endsWith('/api') ? ... : .../api/` | `identityApiUrl.endsWith('/api/v1') ? ... : .../api/v1/` |
| `tests/identity/email-otp.spec.ts:23` | `${IDENTITY_API_URL}/api` | `${IDENTITY_API_URL}/api/v1` |
| `tests/identity/email-otp.spec.ts:40` | `${IDENTITY_API_URL}/api/auth/send-otp` | `${IDENTITY_API_URL}/api/v1/auth/send-otp` |
| `tests/identity/logout.spec.ts:35` | `/api/auth/logout` | `/api/v1/auth/logout` |
| `tests/content/content-api.spec.ts` (multiple) | `/api/content/...` | `/api/v1/content/...` |
| `tests/notifications/health.spec.ts` | `${URL}/api/notifications` | `${URL}/api/v1/notifications` |
| `tests/logging/pii-masking.spec.ts` | `${IDENTITY_URL}/api/auth/login` etc. | `${IDENTITY_URL}/api/v1/auth/login` etc. |
| `tests/logging/correlation-tracking.spec.ts` | `${URL}/api/menus` | `${URL}/api/v1/menus` |
| `tests/logging/log-verification.spec.ts` | `/api/menus` | `/api/v1/menus` |
| `tests/logging/stress-resilience.spec.ts` | `${url}/api/nonexistent...` | `${url}/api/v1/nonexistent...` |
| `tests/online-menus/menu-qr-code.spec.ts` | `${url}/api/qr/${menuId}` | `${url}/api/v1/qr/${menuId}` |
| `helpers/notification.helpers.ts:65` | `baseURL: NOTIFICATION_SERVICE_URL` | Verify paths used with this client include `/api/v1/` |

**Note**: The `AuthHelper` pattern of appending `/api` is particularly important -- if this is not updated, all auth-related E2E tests will fail (the 301 redirect will save them, but POST+redirect loses the body).

#### Step 1.7: Update `httpInterceptor.ts` token refresh URL

`BaseClient/src/lib/httpInterceptor.ts:140`:
```typescript
// Current
url: `${envConfig.API_URL}/auth/refresh`,
// After (matches generated hook path)
url: `${envConfig.API_URL}/api/v1/auth/refresh`,
```

Wait -- this is the **old** interceptor (marked `@deprecated`). Check if the new interceptor system also has hardcoded paths.

**Action**: Search `BaseClient/src/lib/api/` for hardcoded `/auth/refresh` or similar paths and update them too.

#### Step 1.8: Update backend unit/functional tests

| Service | File | Change |
|---------|------|--------|
| OnlineMenu | `EndpointRequestResponseTests.cs` | Update route assertions (already updated in Phase 0 -- verify they still match) |
| Identity | `RequestAccountDeletionHandlerTests.cs` | URL template contains `/api/` -- verify it's a business URL, not an internal route |

#### Step 1.9: Update SyncfusionThemeStudio MockServer

- `MockServer.Web/Program.cs:107`: Change RoutePrefix from `"api"` to `"api/v1"`
- Regenerate any swagger/mock config that references API paths

---

### Phase 2: Deprecation Infrastructure (Future-Proofing)

**Goal**: Build the machinery needed when v2 is eventually introduced.

#### Step 2.1: Create deprecation header middleware

```csharp
public class ApiDeprecationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApiDeprecationOptions _options;

    public ApiDeprecationMiddleware(RequestDelegate next, IOptions<ApiDeprecationOptions> options)
    {
        _next = next;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        var path = context.Request.Path.Value;
        if (path != null && _options.DeprecatedVersions.Any(v =>
            path.StartsWith($"/api/{v}/", StringComparison.OrdinalIgnoreCase)))
        {
            context.Response.Headers["Deprecation"] = "true";
            context.Response.Headers["Sunset"] = _options.SunsetDate.ToString("R");
            context.Response.Headers["Link"] =
                $"<{_options.MigrationDocUrl}>; rel=\"successor-version\"";
        }
    }
}

public class ApiDeprecationOptions
{
    public List<string> DeprecatedVersions { get; set; } = [];
    public DateTimeOffset SunsetDate { get; set; }
    public string MigrationDocUrl { get; set; } = "";
}
```

#### Step 2.2: Create version-retired middleware (410 Gone)

```csharp
public class ApiRetiredMiddleware
{
    private readonly RequestDelegate _next;
    private readonly HashSet<string> _retiredVersions;

    public ApiRetiredMiddleware(RequestDelegate next, IOptions<ApiRetiredOptions> options)
    {
        _next = next;
        _retiredVersions = options.Value.RetiredVersions.ToHashSet();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value;
        if (path != null)
        {
            foreach (var version in _retiredVersions)
            {
                if (path.StartsWith($"/api/{version}/", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.StatusCode = 410; // Gone
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = $"API version {version} has been retired",
                        migrationUrl = "https://docs.example.com/api/migration"
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}
```

#### Step 2.3: Package as shared NuGet library

Create `NuGetPackages/ApiVersioning/` with:
- `ApiVersionRedirectMiddleware.cs`
- `ApiDeprecationMiddleware.cs`
- `ApiRetiredMiddleware.cs`
- Extension methods for `IApplicationBuilder`

This allows all 6 services to share the same versioning infrastructure.

---

### Phase 3: Documentation and Monitoring

#### Step 3.1: API documentation updates

- Update swagger document titles to include version
- Add version lifecycle information to swagger description
- Document versioning policy in a public-facing API docs page

#### Step 3.2: Monitoring

- Add Grafana dashboard panel showing request counts by API version prefix
- Log the API version in request logging middleware for Loki queries
- Create alert for requests hitting the redirect middleware (indicates clients not yet migrated)

---

## 5. Risk Assessment

### Risk 1: POST/PUT/DELETE + 301 Redirect = Body Loss (HIGH)

**Problem**: RFC 7231 says 301 redirects MAY change the method to GET, and most HTTP clients strip the request body on redirect. This means `POST /api/auth/login` redirecting to `/api/v1/auth/login` will fail because the body is lost.

**Mitigation**: Use **308 Permanent Redirect** instead of 301. RFC 7538 specifies that 308 preserves the request method and body. Update the middleware to use 308:
```csharp
context.Response.StatusCode = 308; // Permanent Redirect (preserves method + body)
```

**Caveat**: Very old HTTP clients may not support 308. For this project (modern browsers + axios), 308 is universally supported.

### Risk 2: Swagger UI URL Changes

**Problem**: Developers bookmarking `http://localhost:{port}/swagger` may need to know the swagger doc is now at `v1`.

**Mitigation**: FastEndpoints Swagger UI auto-discovers documents. The swagger UI URL itself does not change -- only the document version label inside it. No action needed.

### Risk 3: SignalR Hub Path Must NOT Be Versioned

**Problem**: The SignalR hub at `/hubs/notifications` is NOT a FastEndpoints endpoint. It uses `app.MapHub()` which is unaffected by `RoutePrefix`. It must stay unversioned.

**Mitigation**: No action needed -- `MapHub` is independent of FastEndpoints. Verify this in testing. Also verify the `OnMessageReceived` event handler still correctly checks `path.StartsWithSegments("/hubs/notifications")`.

### Risk 4: Hardcoded URLs in Frontend (MEDIUM)

**Problem**: The deprecated `httpInterceptor.ts` has a hardcoded URL:
```typescript
url: `${envConfig.API_URL}/auth/refresh`
```
This becomes wrong after versioning (should be `/api/v1/auth/refresh`).

**Mitigation**: Search and update ALL hardcoded API paths in `BaseClient/src/`. Key files:
- `src/lib/httpInterceptor.ts:140` -- token refresh URL
- `src/lib/api/tokenRefresh.ts` -- new token refresh (check for hardcoded paths)
- `src/lib/api/interceptors/authInterceptor.ts` -- check for hardcoded paths

### Risk 5: E2E AuthHelper Appends `/api` (HIGH)

**Problem**: `AuthHelper` in E2E tests does `baseURL: apiBase.endsWith('/api') ? apiBase : \`${apiBase}/api\``. After migration, this must append `/api/v1`. Since the 308 redirect preserves POST body, tests would technically still work via redirect, but this adds latency and fragility.

**Mitigation**: Update `AuthHelper` constructor to use `/api/v1`. Consider making the version configurable via environment variable for future transitions.

### Risk 6: Mobile App / PWA Cached URLs (LOW)

**Problem**: If users have the PWA installed with a cached service worker that hardcodes API paths, the old paths would be used until the service worker updates.

**Mitigation**: The 308 redirect middleware ensures old URLs still work during the transition period. The service worker in this project does not cache API calls (only static assets). Low risk.

### Risk 7: Health Check Endpoints Must NOT Be Versioned (MEDIUM)

**Problem**: Health check endpoints (`/health/live`, `/health/start`, `/health/ready`) are mapped via `app.MapHealthCheckEndpoints()`, NOT via FastEndpoints. They must remain unversioned.

**Mitigation**: Verify `MapHealthCheckEndpoints()` is called after `UseFastEndpoints()` and uses its own route mapping. These endpoints are not affected by FastEndpoints RoutePrefix. Verify in E2E health tests.

### Risk 8: Stripe Webhook URL (HIGH)

**Problem**: If Stripe is configured with a webhook URL like `https://payment-api.example.com/api/webhooks/stripe`, changing to `/api/v1/webhooks/stripe` will break webhook delivery.

**Mitigation**:
1. The 308 redirect will handle this during transition
2. Update the Stripe webhook configuration in the Stripe dashboard
3. Consider keeping webhook endpoints on an unversioned path permanently (webhooks are contractual, not client-facing)

**Recommendation**: Register webhook endpoints outside FastEndpoints (via `app.MapPost("/webhooks/stripe", ...)`) to keep them version-independent. Or add a `[Route("/webhooks/stripe")]` attribute that bypasses the version prefix.

### Risk 9: `isAuthEndpointUrl` Pattern Matching (LOW)

**Problem**: `httpInterceptor.ts:126-128` checks URL patterns:
```typescript
const authPatterns = ['/auth/login', '/auth/refresh', '/auth/verify-otp', '/protocol/openid-connect/token'];
```
These use `url.includes(pattern)`, so `/api/v1/auth/login` still matches `/auth/login`. No issue.

**Mitigation**: No change needed.

---

## 6. Rollout Strategy

### Step-by-step deployment order

1. **Deploy Phase 0** (bug fixes) and verify all services work at `/api/{route}`
2. **Deploy Phase 1 to all services simultaneously** -- this is critical because the frontend and E2E tests must match the backend
3. **Deploy frontend changes** in the same release cycle (regenerated Orval hooks, updated E2E tests)
4. **Monitor redirect middleware** for 30 days to identify any clients still using old URLs
5. **Deploy Phase 2** (deprecation infrastructure) when planning v2

### Rollback plan

If issues arise after Phase 1 deployment:
1. Revert RoutePrefix back to `"api"` in all services
2. Revert swagger JSON files
3. Re-run `npx orval`
4. Revert E2E test changes

The 308 redirect middleware should remain in place even during rollback to protect against partially-deployed states.

### Testing checklist

- [ ] All 6 services respond at `/api/v1/{route}`
- [ ] 308 redirect from `/api/{route}` to `/api/v1/{route}` works for GET, POST, PUT, DELETE
- [ ] Swagger UI loads and shows `v1` in document title
- [ ] Frontend Orval-generated hooks use `/api/v1/` paths
- [ ] Login/logout/refresh flow works end-to-end
- [ ] SignalR hub connects at `/hubs/notifications` (unchanged)
- [ ] Health checks respond at `/health/live`, `/health/start`, `/health/ready` (unchanged)
- [ ] E2E test suites all pass
- [ ] Stripe webhook endpoint accessible (if applicable)
- [ ] All backend unit tests pass
- [ ] Frontend lint, unit tests, and prod build pass

---

## 7. Files to Modify (Complete Inventory)

### Backend Services (Phase 0 + Phase 1 combined)

| Service | File | Phase | Change |
|---------|------|-------|--------|
| **Identity** | `src/IdentityService.API/ProgramExtensions.cs` | 1 | `RoutePrefix = "api/v1"` |
| **Identity** | `src/IdentityService.API/LogIngestion/LogIngestionEndpoint.cs` | 0 | Route: `/api/logs` --> `/logs` |
| **Identity** | `src/IdentityService.API/LogStress/LogStressEndpoint.cs` | 0 | Route: `/api/debug/log-stress` --> `/debug/log-stress` |
| **OnlineMenu** | `src/OnlineMenu.Web/Configurations/MiddlewareConfig.cs` | 0+1 | Add `RoutePrefix = "api/v1"` |
| **OnlineMenu** | `src/OnlineMenu.Web/QrScans/Track.cs` | 0 | Route: `/api/qr/...` --> `/qr/...` |
| **OnlineMenu** | `src/OnlineMenu.Web/QrScans/GetAnalytics.cs` | 0 | Route: `/api/menus/...` --> `/menus/...` |
| **OnlineMenu** | `src/OnlineMenu.Web/LogStress/LogStressEndpoint.cs` | 0 | Route: `/api/debug/log-stress` --> `/debug/log-stress` |
| **Questioner** | `src/Questioner.Web/Configurations/MiddlewareConfig.cs` | 0+1 | Add `RoutePrefix = "api/v1"` |
| **Questioner** | `src/Questioner.Web/LogStress/LogStressEndpoint.cs` | 0 | Route: `/api/debug/log-stress` --> `/debug/log-stress` |
| **Content** | `src/Content.Web/Configurations/MiddlewareConfig.cs` | 1 | `RoutePrefix = "api/v1"` |
| **Content** | `src/Content.Web/LogStress/LogStressEndpoint.cs` | 0 | Route: `/api/debug/log-stress` --> `/debug/log-stress` |
| **Notification** | `src/Notification.Web/Program.cs` | 0+1 | Add `UseFastEndpoints(c => { c.Endpoints.RoutePrefix = "api/v1"; })` |
| **Notification** | `src/Notification.Web/Notifications/List.cs` | 0 | Route: `/api/notifications` --> `/notifications` |
| **Notification** | `src/Notification.Web/Notifications/GetUnreadCount.cs` | 0 | Route: remove `/api/` prefix |
| **Notification** | `src/Notification.Web/Notifications/MarkAllAsRead.cs` | 0 | Route: remove `/api/` prefix |
| **Notification** | `src/Notification.Web/Notifications/MarkAsRead.cs` | 0 | Route: remove `/api/` prefix |
| **Notification** | `src/Notification.Web/Preferences/Get.cs` | 0 | Route: remove `/api/` prefix |
| **Notification** | `src/Notification.Web/Preferences/Update.cs` | 0 | Route: remove `/api/` prefix |
| **Notification** | `src/Notification.Web/Testing/StressTestEndpoints.cs` | 0 | Routes: remove `/api/` prefix from 4 routes |
| **Notification** | `src/Notification.Web/LogStress/LogStressEndpoint.cs` | 0 | Route: remove `/api/` prefix |
| **Payment** | `src/PaymentService.API/ProgramExtensions.cs` | 1 | `RoutePrefix = "api/v1"` |
| **MockServer** | `src/MockServer.Web/Program.cs` | 1 | `RoutePrefix = "api/v1"` |

### Backend Tests

| Service | File | Change |
|---------|------|--------|
| OnlineMenu | `tests/OnlineMenu.UnitTests/Domain/EndpointRequestResponseTests.cs` | Update 2 route assertions |

### New Middleware (Phase 1)

| Location | File | Purpose |
|----------|------|---------|
| NuGetPackages/ApiVersioning/ (or inline per service) | `ApiVersionRedirectMiddleware.cs` | 308 redirect from `/api/` to `/api/v1/` |

### Frontend

| File | Change |
|------|--------|
| `BaseClient/src/server/swagger/identity.json` | Regenerate (paths change to `/api/v1/...`) |
| `BaseClient/src/server/swagger/onlinemenu.json` | Regenerate |
| `BaseClient/src/server/swagger/questioner.json` | Regenerate |
| `BaseClient/src/server/swagger/content.json` | Regenerate |
| `BaseClient/src/server/swagger/notification.json` | Regenerate |
| `BaseClient/src/server/autoGeneratedHooks/**` | Regenerate via `npx orval` (auto) |
| `BaseClient/src/lib/httpInterceptor.ts:140` | Update `/auth/refresh` path (if still in use) |
| `BaseClient/src/lib/api/tokenRefresh.ts` | Check and update hardcoded paths |

### E2E Tests

| File | Change |
|------|--------|
| `E2ETests/helpers/auth-helper.ts:31` | `/api` --> `/api/v1` |
| `E2ETests/tests/multi-tenant.teardown.ts:68` | `/api/` --> `/api/v1/` |
| `E2ETests/tests/identity/email-otp.spec.ts` | `/api` --> `/api/v1` (multiple lines) |
| `E2ETests/tests/identity/logout.spec.ts:35` | `/api/auth/logout` --> `/api/v1/auth/logout` |
| `E2ETests/tests/content/content-api.spec.ts` | `/api/content/...` --> `/api/v1/content/...` (many lines) |
| `E2ETests/tests/notifications/health.spec.ts` | `/api/notifications` --> `/api/v1/notifications` |
| `E2ETests/tests/logging/pii-masking.spec.ts` | `/api/auth/...` --> `/api/v1/auth/...` |
| `E2ETests/tests/logging/correlation-tracking.spec.ts` | `/api/menus` --> `/api/v1/menus` |
| `E2ETests/tests/logging/log-verification.spec.ts` | `/api/menus` --> `/api/v1/menus` |
| `E2ETests/tests/logging/stress-resilience.spec.ts` | `/api/nonexistent...` --> `/api/v1/nonexistent...` |
| `E2ETests/tests/online-menus/menu-qr-code.spec.ts` | `/api/qr/` --> `/api/v1/qr/` |
| `E2ETests/helpers/notification.helpers.ts` | Verify API paths include version |

---

## 8. Effort Estimate (Revised)

| Phase | Effort | Parallelizable |
|-------|--------|----------------|
| Phase 0: Bug fixes | 0.5 days | Yes (1 agent per service) |
| Phase 1: Version prefix + middleware | 1 day | Yes (backend-dev + frontend-dev + regression-tester) |
| Swagger regen + Orval | 0.5 days | Sequential (depends on services running) |
| E2E test updates | 0.5 days | Yes |
| Phase 2: Deprecation infra | 1 day | Backend-only |
| Phase 3: Docs + monitoring | 0.5 days | |
| **Total** | **3-4 days** | |

---

## 9. Decision Record

### Context
All 6 backend services use `/api/` prefix without version segment. Three services have RoutePrefix set, three do not. Multiple endpoints have inconsistent route prefixing.

### Options Considered

1. **URL-based versioning (`/api/v1/`)** -- Chosen
   - Pros: Visible in logs/browser, cache-friendly, FastEndpoints native support, simple for clients
   - Cons: URL proliferation over time

2. **Header-based versioning (`Accept: application/vnd.app.v1+json`)**
   - Pros: Clean URLs, REST-purist approved
   - Cons: Invisible in logs, hard to test in browser, complex client implementation

3. **Query parameter versioning (`?api-version=1`)**
   - Pros: Simple to add
   - Cons: Not cache-friendly (same URL, different content), feels hacky

### Decision
URL-based versioning with `RoutePrefix = "api/v1"`. The single-line change per service makes this the lowest-risk approach. FastEndpoints' built-in RoutePrefix support means no custom framework needed.

### Consequences
- All swagger JSON files must be regenerated
- All Orval-generated hooks must be regenerated
- E2E tests need path updates
- 308 redirect middleware needed for backward compatibility
- Future versions (v2, v3) will require separate endpoint registrations or version-specific groups
