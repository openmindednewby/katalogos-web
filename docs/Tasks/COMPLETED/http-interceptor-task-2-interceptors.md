# Task 2: Axios Interceptors

> **Reference**: `http-interceptor-architecture.md`
> **Agent**: `frontend-dev`
> **Status**: TODO
> **Estimated Scope**: ~6 files, ~400 lines
> **Dependencies**: Task 1 (core types and event bus)
> **Blocks**: Task 5 (migration)

## Problem Statement

Move and improve the Axios interceptor logic from the current scattered files into a clean, modular structure. Each interceptor should have a single responsibility.

## Current State

- `src/lib/axios.ts` - Axios instance + auth token request interceptor (mixed concerns)
- `src/lib/httpInterceptor.ts` - Response interceptor with 401 refresh + success notifications (too many concerns)

## Implementation Plan

### 1. Create Clean Axios Instance

**Create**: `src/lib/api/axiosInstance.ts`

A clean axios instance with NO interceptors (interceptors are registered separately):

```typescript
import axios from 'axios';

const HTTP_TIMEOUT_MS = 30_000;

export const apiClient = axios.create({
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});
```

Note: The base URL should NOT be set here - it varies per service. The service-specific HTTP clients (`httpClientIdentity.ts`, etc.) already handle this.

### 2. Auth Request Interceptor

**Create**: `src/lib/api/interceptors/authInterceptor.ts`

Extracts the auth token logic from current `src/lib/axios.ts`:
- Read `accessToken` from Redux store
- Attach `Authorization: Bearer <token>` header
- Configurable: respect `RequestOptions.withToken` flag
- Do NOT attach token to external URLs (only same-origin or configured API URLs)

```typescript
export function registerAuthInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.request.use((config) => {
    // Get token from Redux store
    // Attach if withToken !== false
    // Return modified config
  });
}
```

### 3. Tenant Request Interceptor

**Create**: `src/lib/api/interceptors/tenantInterceptor.ts`

Inject tenant context into every request:
- Read current tenant ID from Redux store (or auth context)
- Attach `X-Tenant-Id` header
- Skip for auth endpoints (login, refresh) where tenant isn't known yet

### 4. Response Normalizer

**Create**: `src/lib/api/interceptors/responseNormalizer.ts`

Normalize successful API responses:
- Extract `data` from axios response wrapper
- Handle success notifications for mutations (POST/PUT/PATCH/DELETE)
- Extract success message from `response.data.message` or `response.data.detail`
- Emit toast events via `apiEventBus` for successful mutations

### 5. Error Classifier

**Create**: `src/lib/api/interceptors/errorClassifier.ts`

This is the bridge between raw Axios errors and the error registry:
- Convert `AxiosError` into a `ClassifiedError` object
- Extract: status, url, method, errorCode, message, body
- Handle network errors (no response) → status = 0
- Handle timeout errors → errorCode = 'ECONNABORTED'
- Pass the classified error to the error matcher (from Task 3)
- Let the error registry determine the action

```typescript
export function registerErrorClassifier(instance: AxiosInstance): number {
  return instance.interceptors.response.use(
    (response) => response, // Pass through success
    (error: AxiosError) => {
      const classified = classifyError(error);
      const result = matchError(classified); // From error matcher (Task 3)

      if (result.matched && result.rule) {
        executeErrorAction(result.rule, classified); // From error actions (Task 3)
      }

      return Promise.reject(error); // Still reject so React Query sees it
    }
  );
}
```

### 6. Logging Interceptor

**Create**: `src/lib/api/interceptors/loggingInterceptor.ts`

Structured logging for debugging:
- Log request: method, url, params (NOT body for security)
- Log response: status, url, duration
- Log errors: status, url, error message
- Use the existing `logger` utility from `src/utils/logger.ts`
- Only active in non-production environments

### 7. Token Refresh Logic

**Create**: `src/lib/api/tokenRefresh.ts`

Extract and improve the token refresh logic from `httpInterceptor.ts`:
- Shared promise for deduplicating concurrent refresh attempts
- On 401: attempt refresh, retry original request on success
- On refresh failure: emit `session-expired` event via event bus
- Skip refresh for auth endpoints (login, refresh, verify-otp)
- Clear the shared promise after resolution (success or failure)

This is used by the error classifier when it encounters a 401.

### 8. Interceptor Registration

**Create**: `src/lib/api/interceptors/index.ts`

Register all interceptors in the correct order:

```typescript
export function registerInterceptors(instance: AxiosInstance): void {
  // Request interceptors (run in reverse order of registration)
  registerLoggingInterceptor(instance);    // Logs first
  registerTenantInterceptor(instance);     // Then adds tenant
  registerAuthInterceptor(instance);       // Then adds auth

  // Response interceptors (run in order of registration)
  registerResponseNormalizer(instance);    // Normalize first
  registerErrorClassifier(instance);       // Then classify errors
}
```

## Files to Create

1. `src/lib/api/axiosInstance.ts`
2. `src/lib/api/interceptors/authInterceptor.ts`
3. `src/lib/api/interceptors/tenantInterceptor.ts`
4. `src/lib/api/interceptors/responseNormalizer.ts`
5. `src/lib/api/interceptors/errorClassifier.ts`
6. `src/lib/api/interceptors/loggingInterceptor.ts`
7. `src/lib/api/interceptors/index.ts`
8. `src/lib/api/tokenRefresh.ts`

## Success Criteria

- [ ] Each interceptor has a single responsibility
- [ ] Auth token injection works for all service clients
- [ ] Tenant header is injected on every request (except auth endpoints)
- [ ] Successful mutations emit toast events
- [ ] Errors are classified with full context (status, url, method, etc.)
- [ ] Token refresh deduplication works under concurrent requests
- [ ] Logging only active in non-production
- [ ] All files under 200 lines, all functions under 50 lines
- [ ] Lint passes, build succeeds
