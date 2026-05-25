# Production Environment Configuration

> **Status**: TODO
> **Priority**: P0 - Critical (Deployment Blocker)
> **Estimated Scope**: Small-Medium (All Services)
> **Estimated Effort**: 2-3 days

---

## 1. Problem

Only `appsettings.Development.json` exists for all services. No staging or production configurations. CORS allows only localhost origins. HTTPS metadata validation is disabled. Auto-migration runs on every startup.

---

## 2. Required Files Per Service

### 2.1 appsettings.Staging.json

- Connection strings pointing to staging databases
- Keycloak staging realm/authority
- CORS: staging domain origins
- Logging: Warning level minimum
- RequireHttpsMetadata: true
- No auto-migration on startup

### 2.2 appsettings.Production.json

- Connection strings via environment variables / vault references
- Keycloak production realm/authority
- CORS: production domain origins only (no localhost)
- Logging: Warning level, structured JSON format
- RequireHttpsMetadata: true
- No auto-migration on startup
- HSTS headers enabled
- Request size limits configured

---

## 3. Changes Per Service

### 3.1 Program.cs Updates (All 5 Services)

```csharp
// Only auto-migrate in Development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<DbContext>();
    await db.Database.MigrateAsync();
}

// HSTS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}
```

### 3.2 CORS Configuration

```csharp
// Environment-specific origins from config
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();
```

### 3.3 Kestrel/HTTPS

- Production: TLS termination at load balancer or Kestrel with proper certs
- RequireHttpsMetadata: true (validate Keycloak HTTPS)
- HSTS with 1-year max-age

---

## 4. Affected Services

All 5 backend services:
- IdentityService
- OnlineMenuSaaS
- QuestionerService
- ContentService
- NotificationService

Plus frontend:
- BaseClient needs environment-specific `envConfig` for API URLs

---

## 5. Implementation Steps

1. Create `appsettings.Staging.json` for each service
2. Create `appsettings.Production.json` for each service
3. Update CORS to read origins from configuration
4. Guard auto-migration behind `IsDevelopment()` check
5. Add HSTS and HTTPS redirection for non-dev environments
6. Set `RequireHttpsMetadata = true` for non-dev
7. Add request body size limits (e.g., 10MB default, 500MB for content uploads)
8. Update frontend `environment.ts` with staging/prod API URLs
9. Document environment variable overrides for cloud deployment

---

## 6. Verification

- [ ] Each service has Development, Staging, Production appsettings
- [ ] CORS rejects non-whitelisted origins in staging/prod
- [ ] HTTPS is enforced in staging/prod
- [ ] Auto-migration only runs in Development
- [ ] No localhost URLs in staging/prod configs
