# Task 1: Core Types, Error Registry Structure & API Event Bus

> **Reference**: `http-interceptor-architecture.md`
> **Agent**: `backend-dev` or `frontend-dev`
> **Status**: TODO
> **Estimated Scope**: ~8 files, ~500 lines
> **Dependencies**: None (this is the foundation task)
> **Blocks**: Tasks 2, 3, 4

## Problem Statement

We need the foundational types, the error registry data structure, and the event bus that bridges Axios interceptors to React UI. This is the foundation that all other tasks depend on.

## Implementation Plan

### 1. Create Error Type Definitions

**Create**: `src/lib/api/errors/errorTypes.ts`

Define all interfaces and types for the error handling system:

```typescript
/** HTTP methods supported */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** A classified error with all context extracted from AxiosError */
interface ClassifiedError {
  status: number;               // HTTP status (0 for network errors)
  url: string;                  // Request URL
  method: HttpMethod;           // Request method
  errorCode?: string;           // API-specific error code from response body
  message: string;              // Extracted error message
  body?: unknown;               // Raw response body
  originalError: unknown;       // Original AxiosError
  timestamp: number;            // When the error occurred
  requestId?: string;           // Correlation ID if available
}

/** Conditions to match against an error */
interface ErrorMatcher {
  status?: number | number[] | { min: number; max: number };
  path?: string | RegExp;
  method?: HttpMethod | HttpMethod[];
  errorCode?: string | string[];
  bodyField?: { key: string; value: unknown };
}

/** Action types the system can take */
type ErrorActionType = 'toast' | 'modal' | 'redirect' | 'silent' | 'retry' | 'custom';

/** Severity levels for UI feedback */
type ErrorSeverity = 'info' | 'warning' | 'error';

/** What to do when an error matches */
interface ErrorAction {
  type: ErrorActionType;
  severity?: ErrorSeverity;
  target?: string;               // For redirect
  modalComponent?: string;       // For modal
  maxRetries?: number;           // For retry
  handler?: string;              // For custom
  reportToMonitoring?: boolean;  // Log to Sentry/etc
  suppressError?: boolean;       // Don't propagate to React Query
}

/** A single rule in the error registry */
interface ErrorRule {
  name: string;
  match: ErrorMatcher;
  action: ErrorAction;
  messageKey?: string;           // i18n key
  fallbackMessage?: string;
  priority?: number;             // Higher = checked first (default: 0)
  skipIf?: (error: ClassifiedError) => boolean;
}

/** Result of matching an error against the registry */
interface ErrorMatchResult {
  matched: boolean;
  rule?: ErrorRule;
  error: ClassifiedError;
}
```

Export all types. Use `const enum` where appropriate per project standards.

### 2. Create API Event Bus

**Create**: `src/lib/api/events/apiEventTypes.ts`

```typescript
/** Events emitted from interceptor layer to React UI */
type ApiEventType = 'toast' | 'modal' | 'redirect' | 'session-expired' | 'maintenance-mode';

interface ToastEvent {
  type: 'toast';
  severity: ErrorSeverity;
  message: string;
  duration?: number;
}

interface ModalEvent {
  type: 'modal';
  modalComponent: string;
  message: string;
  severity: ErrorSeverity;
  data?: Record<string, unknown>;
}

interface RedirectEvent {
  type: 'redirect';
  target: string;
  message?: string;
}

interface SessionExpiredEvent {
  type: 'session-expired';
}

interface MaintenanceModeEvent {
  type: 'maintenance-mode';
  estimatedEnd?: string;
}

type ApiEvent = ToastEvent | ModalEvent | RedirectEvent | SessionExpiredEvent | MaintenanceModeEvent;
```

**Create**: `src/lib/api/events/apiEventBus.ts`

A typed, lightweight event emitter:

```typescript
type ApiEventListener = (event: ApiEvent) => void;

class ApiEventBus {
  private listeners: Set<ApiEventListener> = new Set();

  subscribe(listener: ApiEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: ApiEvent): void {
    this.listeners.forEach((listener) => {
      try { listener(event); } catch { /* swallow listener errors */ }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}

/** Singleton event bus instance */
export const apiEventBus = new ApiEventBus();
```

### 3. Create Error Registry

**Create**: `src/lib/api/errors/errorRegistry.ts`

The declarative error → action mapping table. Start with these rules:

| Name | Match | Action | Message Key |
|------|-------|--------|-------------|
| session-expired | 401 (not auth endpoints) | redirect → /login | errors.sessionExpired |
| forbidden | 403 | toast error | errors.forbidden |
| feature-gated | 403 + errorCode FEATURE_GATED | modal FeatureGateModal | errors.featureNotAvailable |
| subscription-required | 402 | modal UpgradePrompt | errors.subscriptionRequired |
| validation-error | 400, 422 | toast warning | errors.validationFailed |
| conflict | 409 | toast warning | errors.conflict |
| rate-limited | 429 | toast warning | errors.tooManyRequests |
| maintenance-mode | 503 | modal MaintenanceModal | errors.maintenance |
| server-error | 500-599 | toast error + report | errors.serverError |
| bad-gateway | 502, 504 | toast error | errors.badGateway |
| network-offline | status 0 | toast warning | errors.networkOffline |
| request-timeout | errorCode ECONNABORTED | toast warning | errors.requestTimeout |

The registry should be an exported array, sorted by priority (highest first). Provide a `getErrorRules()` function that returns the sorted rules.

Also provide `registerErrorRule(rule: ErrorRule)` for runtime extensibility (e.g., feature modules can add their own rules).

### 4. Create Barrel Exports

**Create**: `src/lib/api/errors/index.ts` - export all error types, registry, matcher
**Create**: `src/lib/api/events/index.ts` - export event bus, types, hook placeholder
**Create**: `src/lib/api/index.ts` - top-level barrel (will be expanded by other tasks)

## Files to Create

1. `src/lib/api/errors/errorTypes.ts`
2. `src/lib/api/errors/errorRegistry.ts`
3. `src/lib/api/errors/index.ts`
4. `src/lib/api/events/apiEventTypes.ts`
5. `src/lib/api/events/apiEventBus.ts`
6. `src/lib/api/events/index.ts`
7. `src/lib/api/index.ts`

## Success Criteria

- [ ] All error types are fully typed with TypeScript (no `any`)
- [ ] Error registry contains 12+ rules covering all common HTTP errors
- [ ] Event bus supports subscribe/emit/clear with typed events
- [ ] Registry supports runtime rule registration
- [ ] Rules are sorted by priority
- [ ] All files under 200 lines
- [ ] All functions under 50 lines
- [ ] Lint passes
- [ ] Build succeeds
