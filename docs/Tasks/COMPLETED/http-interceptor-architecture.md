# HTTP Interceptor & Error Handling Architecture

> **Type**: Architecture Plan
> **Status**: TODO
> **Priority**: High
> **Dependencies**: None

## Problem Statement

The current HTTP interceptor logic is scattered across multiple files with no declarative way to map errors to UI actions. We need a clean, centralized system where:
- Error X → show toast notification
- Error Y → show modal dialog
- Error Z → redirect to login
- Error W → show upgrade prompt

Currently:
- `src/lib/axios.ts` handles auth token injection
- `src/lib/httpInterceptor.ts` handles 401 refresh + success toasts
- `src/lib/notifications.ts` provides event-based notifications
- `src/lib/apiNotifications.ts` has route-specific notification handlers
- No declarative error → action mapping exists
- No centralized error classification

## Architecture Overview

### Hybrid Approach: Axios + TanStack Query

```
Request Flow:
  Component → TanStack Query → Axios → [Request Interceptors] → Server

Response Flow:
  Server → [Response Interceptors] → [Error Registry] → [Action Dispatch] → UI
```

| Layer | Responsibility |
|-------|---------------|
| Axios Request Interceptors | Auth token, tenant header, request logging |
| Axios Response Interceptors | Response normalization, error classification, token refresh |
| Error Registry | Declarative error → action mapping (the "routing table") |
| Action Dispatch | Execute UI actions (toast, modal, redirect, block) |
| API Event Bus | Bridge between interceptor layer and React UI |
| TanStack Query | Retry logic, cache management, per-query error overrides |

### New Directory Structure

```
src/lib/api/
├── index.ts                         # Public API - exports configured instance + helpers
├── axiosInstance.ts                  # Clean axios instance creation + interceptor registration
├── queryClient.ts                    # TanStack QueryClient with global error callbacks
│
├── interceptors/
│   ├── index.ts                     # Register all interceptors on axios instance
│   ├── authInterceptor.ts           # Request: inject Bearer token from Redux
│   ├── tenantInterceptor.ts         # Request: inject X-Tenant-Id header
│   ├── responseNormalizer.ts        # Response: unwrap/normalize API response shape
│   ├── errorClassifier.ts           # Response error: classify and dispatch to registry
│   └── loggingInterceptor.ts        # Request+Response: structured debug logging
│
├── errors/
│   ├── index.ts                     # Public error API
│   ├── errorTypes.ts                # Error type definitions and interfaces
│   ├── errorRegistry.ts             # THE declarative error → action mapping table
│   ├── errorMatcher.ts              # Matching engine: checks error against registry rules
│   ├── errorActions.ts              # Action executor: toast(), modal(), redirect(), block()
│   └── handlers/
│       ├── authErrorHandler.ts      # 401 token refresh + 403 forbidden logic
│       ├── validationErrorHandler.ts # 400/422 field-level validation errors
│       ├── serverErrorHandler.ts    # 500/502/503/504 server errors
│       ├── networkErrorHandler.ts   # Timeout, connection refused, offline
│       └── subscriptionErrorHandler.ts # 402 payment required, feature gating
│
├── events/
│   ├── apiEventBus.ts               # Typed event emitter (interceptor → React bridge)
│   ├── apiEventTypes.ts             # Event type definitions
│   └── useApiEvents.ts              # React hook to subscribe to API events
│
└── tokenRefresh.ts                  # Dedicated token refresh logic with deduplication
```

### The Error Registry (Core Innovation)

The error registry is a declarative "routing table" that maps error conditions to UI actions:

```typescript
// src/lib/api/errors/errorRegistry.ts

interface ErrorRule {
  /** Human-readable name for debugging */
  name: string;
  /** Conditions to match against the error */
  match: ErrorMatcher;
  /** UI action to take when matched */
  action: ErrorAction;
  /** i18n key for the message (supports interpolation) */
  messageKey?: string;
  /** Fallback message if i18n key not found */
  fallbackMessage?: string;
  /** Priority (higher = checked first). Default: 0 */
  priority?: number;
  /** Skip this rule if handler returns true */
  skipIf?: (error: ClassifiedError) => boolean;
}

interface ErrorMatcher {
  /** HTTP status code or range */
  status?: number | number[] | { min: number; max: number };
  /** URL path pattern (string prefix or RegExp) */
  path?: string | RegExp;
  /** HTTP method filter */
  method?: HttpMethod | HttpMethod[];
  /** Match on error response body code (API-specific error codes) */
  errorCode?: string | string[];
  /** Match on error response body field */
  bodyField?: { key: string; value: unknown };
}

type ErrorActionType = 'toast' | 'modal' | 'redirect' | 'silent' | 'retry' | 'custom';

interface ErrorAction {
  type: ErrorActionType;
  /** For toast/modal: severity level */
  severity?: 'info' | 'warning' | 'error';
  /** For redirect: target path */
  target?: string;
  /** For modal: specific modal component to render */
  modalComponent?: string;
  /** For retry: max retry count */
  maxRetries?: number;
  /** For custom: handler function name */
  handler?: string;
  /** Whether to also log to external service (Sentry, etc.) */
  reportToMonitoring?: boolean;
  /** Whether to suppress the default error propagation to React Query */
  suppressError?: boolean;
}
```

### Example Error Registry Rules

```typescript
const ERROR_RULES: ErrorRule[] = [
  // --- Auth Errors ---
  {
    name: 'session-expired',
    match: { status: 401 },
    action: { type: 'redirect', target: '/login', suppressError: true },
    messageKey: 'errors.sessionExpired',
    skipIf: (error) => isAuthEndpoint(error.url), // Don't redirect on login page
  },
  {
    name: 'forbidden',
    match: { status: 403 },
    action: { type: 'toast', severity: 'error' },
    messageKey: 'errors.forbidden',
  },

  // --- Subscription/Payment ---
  {
    name: 'subscription-expired',
    match: { status: 402 },
    action: { type: 'modal', severity: 'warning', modalComponent: 'UpgradePrompt' },
    messageKey: 'errors.subscriptionRequired',
  },
  {
    name: 'feature-not-available',
    match: { status: 403, errorCode: 'FEATURE_GATED' },
    action: { type: 'modal', severity: 'info', modalComponent: 'FeatureGateModal' },
    messageKey: 'errors.featureNotAvailable',
    priority: 10, // Higher priority than generic 403
  },

  // --- Validation Errors ---
  {
    name: 'validation-error',
    match: { status: [400, 422] },
    action: { type: 'toast', severity: 'warning' },
    messageKey: 'errors.validationFailed',
  },

  // --- Rate Limiting ---
  {
    name: 'rate-limited',
    match: { status: 429 },
    action: { type: 'toast', severity: 'warning' },
    messageKey: 'errors.tooManyRequests',
  },

  // --- Server Errors ---
  {
    name: 'maintenance-mode',
    match: { status: 503 },
    action: { type: 'modal', severity: 'warning', modalComponent: 'MaintenanceModal' },
    messageKey: 'errors.maintenance',
    priority: 5,
  },
  {
    name: 'server-error',
    match: { status: { min: 500, max: 599 } },
    action: { type: 'toast', severity: 'error', reportToMonitoring: true },
    messageKey: 'errors.serverError',
  },

  // --- Network Errors ---
  {
    name: 'network-offline',
    match: { status: 0 }, // No response = network error
    action: { type: 'toast', severity: 'warning' },
    messageKey: 'errors.networkOffline',
  },
  {
    name: 'request-timeout',
    match: { errorCode: 'ECONNABORTED' },
    action: { type: 'toast', severity: 'warning' },
    messageKey: 'errors.requestTimeout',
  },

  // --- Route-Specific Overrides ---
  {
    name: 'delete-inactive-templates',
    match: { path: /\/questionerTemplates\/delete\/inactive/, method: 'DELETE' },
    action: { type: 'toast', severity: 'info' },
    messageKey: 'questioner.deletedInactiveTemplates',
    priority: 20, // Route-specific rules checked first
  },
];
```

### API Event Bus (Interceptor → React Bridge)

Since Axios interceptors can't use React hooks, we use a typed event bus:

```typescript
// src/lib/api/events/apiEventTypes.ts
type ApiEvent =
  | { type: 'toast'; severity: 'info' | 'warning' | 'error'; message: string }
  | { type: 'modal'; modalComponent: string; message: string; severity: string }
  | { type: 'redirect'; target: string }
  | { type: 'session-expired' }
  | { type: 'subscription-required' }
  | { type: 'maintenance-mode' };

// src/lib/api/events/useApiEvents.ts
function useApiEvents(): void {
  // Subscribe to apiEventBus in useEffect
  // On 'toast' event → call useToast()
  // On 'modal' event → open appropriate modal
  // On 'redirect' event → call navigate()
  // On 'session-expired' → trigger logout flow
}
```

### TanStack Query Integration

```typescript
// src/lib/api/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth errors or client errors
        if (isAxiosError(error) && error.response?.status < 500) return false;
        return failureCount < 1;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show error toast for queries that have already succeeded before
      // (stale data scenario) - fresh query errors handled by component
      if (query.state.data !== undefined) {
        apiEventBus.emit({ type: 'toast', severity: 'error', message: '...' });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Global mutation error handling - already handled by error registry
      // This is a fallback for unhandled errors
    },
  }),
});
```

### Migration Path

The new system should be a **drop-in replacement** for existing code:

1. Keep `deffHttp` export name for backward compatibility
2. Old `src/lib/axios.ts` → new `src/lib/api/axiosInstance.ts`
3. Old `src/lib/httpInterceptor.ts` → split into interceptors/ + errors/
4. Old `src/lib/notifications.ts` → enhanced as `events/apiEventBus.ts`
5. Old `src/lib/apiNotifications.ts` → migrated to error registry rules
6. Old `src/lib/queryClient.ts` → enhanced `src/lib/api/queryClient.ts`

## Task Breakdown

See individual task files:
1. `http-interceptor-task-1-core-types-and-event-bus.md` - Types, event bus, error registry structure
2. `http-interceptor-task-2-interceptors.md` - Axios interceptors (auth, tenant, logging, normalizer)
3. `http-interceptor-task-3-error-handling.md` - Error classifier, matcher, action executor, handlers
4. `http-interceptor-task-4-react-integration.md` - React hook, TanStack Query, UI components
5. `http-interceptor-task-5-migration.md` - Migrate existing code, backward compat, cleanup
6. `http-interceptor-task-6-testing.md` - Unit tests for all new modules

## Success Criteria

- [ ] All HTTP errors are handled declaratively via the error registry
- [ ] Adding a new error rule requires only adding an entry to the registry (no code changes)
- [ ] Toast and modal notifications display correctly for each error type
- [ ] 401 token refresh works with request deduplication
- [ ] Session expiry redirects to login
- [ ] Network errors (offline, timeout) show appropriate messages
- [ ] All existing functionality preserved (no regressions)
- [ ] Unit test coverage > 80% for new modules
- [ ] No circular dependencies between modules
- [ ] Clean separation: Axios handles transport, React handles UI
