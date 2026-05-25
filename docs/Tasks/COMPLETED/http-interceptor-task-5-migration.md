# Task 5: Migration from Current System

> **Reference**: `http-interceptor-architecture.md`
> **Agent**: `frontend-dev`
> **Status**: TODO
> **Estimated Scope**: ~10 files modified, ~200 lines changed
> **Dependencies**: Tasks 1-4 (all implementation tasks)
> **Blocks**: Task 6 (testing)

## Problem Statement

We need to migrate from the current scattered interceptor system to the new modular architecture without breaking existing functionality. This must be a careful, backward-compatible migration.

## Current Files to Migrate

| Current File | New Location | Action |
|-------------|-------------|--------|
| `src/lib/axios.ts` | `src/lib/api/axiosInstance.ts` + `interceptors/authInterceptor.ts` | Split & deprecate |
| `src/lib/httpInterceptor.ts` | `src/lib/api/interceptors/` + `errors/` + `tokenRefresh.ts` | Split & deprecate |
| `src/lib/notifications.ts` | `src/lib/api/events/apiEventBus.ts` (enhanced) | Enhance & keep |
| `src/lib/apiNotifications.ts` | `src/lib/api/errors/errorRegistry.ts` (rules) | Migrate rules & deprecate |
| `src/lib/queryClient.ts` | `src/lib/api/queryClient.ts` (enhanced) | Enhance & redirect |

## Implementation Plan

### Phase 1: Create Backward-Compatible Re-exports

Keep the old file paths working by turning them into re-export wrappers:

**Modify**: `src/lib/axios.ts`
```typescript
// DEPRECATED: Import from 'src/lib/api' instead
// Kept for backward compatibility during migration
export { apiClient as deffHttp } from './api';
export type { RequestOptions } from './api';
```

**Modify**: `src/lib/queryClient.ts`
```typescript
// DEPRECATED: Import from 'src/lib/api' instead
export { queryClient, invalidateQueries, queryKeys } from './api';
```

### Phase 2: Update Service HTTP Clients

Update each service-specific HTTP client to use the new `apiClient`:

- `src/lib/httpClientIdentity.ts`
- `src/lib/httpClientQuestioner.ts`
- `src/lib/httpClientOnlineMenu.ts`
- `src/lib/httpClientContent.ts`
- `src/lib/httpClientNotification.ts`

Each should import from `src/lib/api` and register interceptors if not already done globally.

### Phase 3: Update Auth Provider

**Modify**: `src/auth/AuthProvider.tsx`
- Import token refresh utilities from new location
- Update logout to use event bus pattern
- Remove direct interceptor registration if present

### Phase 4: Mount API Events Provider

**Modify**: `src/App.tsx` (or root layout)
- Add `<ApiEventsProvider>` inside Router and AuthProvider
- This enables the event bus → React UI bridge

### Phase 5: Migrate Route-Specific Notifications

Move the route-specific notification handlers from `apiNotifications.ts` into error registry rules:

Current `registerApiNotification()` calls → new `ErrorRule` entries with `path` matchers.

### Phase 6: Update HTTP Method Layers

**Modify**: `src/lib/http/methods.ts` and `src/lib/http/endpoints.ts`
- Update to use `apiClient` from new location
- Ensure `RequestOptions` interface is preserved

### Phase 7: Clean Up

After verifying everything works:
- Add deprecation comments to old files (don't delete yet)
- Update imports in any files that directly imported from old locations
- Run full test suite to verify no regressions

## Migration Checklist

- [ ] `deffHttp` export still works from old path
- [ ] All service HTTP clients work with new interceptors
- [ ] Auth token injection works for all services
- [ ] 401 token refresh works (test by manually expiring token)
- [ ] Success notifications display after mutations
- [ ] Error notifications display for various error codes
- [ ] Login/logout flow works end-to-end
- [ ] All existing hooks (Orval-generated) continue to work
- [ ] No circular dependencies introduced
- [ ] No duplicate interceptor registration

## Files to Modify

1. `src/lib/axios.ts` (re-export wrapper)
2. `src/lib/queryClient.ts` (re-export wrapper)
3. `src/lib/httpClientIdentity.ts` (update imports)
4. `src/lib/httpClientQuestioner.ts` (update imports)
5. `src/lib/httpClientOnlineMenu.ts` (update imports)
6. `src/lib/httpClientContent.ts` (update imports)
7. `src/lib/httpClientNotification.ts` (update imports)
8. `src/auth/AuthProvider.tsx` (update token refresh)
9. `src/App.tsx` (mount ApiEventsProvider)
10. `src/lib/http/methods.ts` (update axios import)

## Success Criteria

- [ ] Zero breaking changes to existing functionality
- [ ] All existing API hooks continue to work
- [ ] Auth flow works end-to-end
- [ ] Old import paths still work (backward compat re-exports)
- [ ] No duplicate interceptor registrations
- [ ] Lint passes, build succeeds
- [ ] All existing tests pass
