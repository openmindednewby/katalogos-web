# API Versioning Strategy

> **Status**: TODO
> **Priority**: P2 - Required Before Public API
> **Estimated Scope**: Medium (All Backend Services)
> **Estimated Effort**: 1 week

---

## 1. Problem

All endpoints use `/api/` without version prefix. Once external clients (mobile apps, third-party integrations, public menu consumers) depend on the API, any breaking change breaks all clients simultaneously with no migration path.

---

## 2. Versioning Strategy

### 2.1 URL-Based Versioning (Recommended)

```
/api/v1/menus          (current endpoints)
/api/v2/menus          (future breaking changes)
```

**Why URL-based over header-based:**
- Visible in browser, logs, and documentation
- Cache-friendly (different URLs = different cache entries)
- Simplest for clients to implement
- FastEndpoints supports route prefixes natively

### 2.2 Version Lifecycle

| Stage | Duration | Description |
|-------|----------|-------------|
| Current | Indefinite | Active development, fully supported |
| Deprecated | 6 months | Supported but no new features, sunset header |
| Retired | N/A | Removed, returns 410 Gone |

---

## 3. Implementation

### 3.1 FastEndpoints Route Groups

```csharp
// All existing endpoints move under /api/v1/
app.MapFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api/v1";
});
```

### 3.2 Swagger Per Version

Each version gets its own Swagger document:
```csharp
.SwaggerDocument(o =>
{
    o.DocumentSettings = s =>
    {
        s.Title = "OnlineMenu API";
        s.Version = "v1";
    };
});
```

### 3.3 Deprecation Headers

For deprecated versions:
```
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Deprecation: true
Link: <https://docs.example.com/api/v2/migration>; rel="successor-version"
```

---

## 4. Implementation Steps

1. Add `v1` route prefix to all existing endpoints in all 5 services
2. Update Swagger documentation to include version
3. Update frontend API client base URLs to include `/v1/`
4. Update Orval codegen config for versioned URLs
5. Update E2E test base URLs
6. Document versioning policy in API docs
7. Add deprecation middleware for future use

---

## 5. Verification

- [ ] All endpoints accessible at `/api/v1/...`
- [ ] Swagger shows version in title
- [ ] Frontend API hooks use versioned URLs
- [ ] E2E tests pass with versioned URLs
- [ ] Old `/api/...` routes return 301 redirect to `/api/v1/...`
