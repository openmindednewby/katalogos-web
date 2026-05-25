# Task 3: Error Matching Engine & Action Executor

> **Reference**: `http-interceptor-architecture.md`
> **Agent**: `frontend-dev`
> **Status**: TODO
> **Estimated Scope**: ~8 files, ~600 lines
> **Dependencies**: Task 1 (core types and event bus)
> **Blocks**: Task 4 (React integration), Task 5 (migration)

## Problem Statement

We need the engine that takes a classified error, matches it against the error registry rules, and executes the appropriate action (show toast, open modal, redirect, etc.).

## Implementation Plan

### 1. Error Matcher

**Create**: `src/lib/api/errors/errorMatcher.ts`

The matching engine that checks a `ClassifiedError` against all `ErrorRule` entries:

```typescript
/**
 * Match a classified error against the error registry.
 * Rules are checked in priority order (highest first).
 * First matching rule wins.
 */
export function matchError(error: ClassifiedError): ErrorMatchResult {
  const rules = getErrorRules(); // From errorRegistry.ts

  for (const rule of rules) {
    if (rule.skipIf?.(error)) continue;
    if (matchesRule(error, rule.match)) {
      return { matched: true, rule, error };
    }
  }

  return { matched: false, error };
}
```

Implement matching logic for each `ErrorMatcher` field:

| Field | Matching Logic |
|-------|---------------|
| `status: number` | Exact match |
| `status: number[]` | Any match in array |
| `status: { min, max }` | Range inclusive |
| `path: string` | URL includes string |
| `path: RegExp` | URL matches regex |
| `method: string` | Exact match (case-insensitive) |
| `method: string[]` | Any match in array |
| `errorCode: string` | Exact match on response body error code |
| `errorCode: string[]` | Any match in array |
| `bodyField: { key, value }` | Deep equality check on response body field |

All fields in a matcher are AND conditions (all must match). Unspecified fields are ignored (match anything).

### 2. Error Action Executor

**Create**: `src/lib/api/errors/errorActions.ts`

Executes the action defined by the matched rule:

```typescript
export function executeErrorAction(rule: ErrorRule, error: ClassifiedError): void {
  const message = resolveMessage(rule, error);

  switch (rule.action.type) {
    case 'toast':
      apiEventBus.emit({
        type: 'toast',
        severity: rule.action.severity ?? 'error',
        message,
      });
      break;

    case 'modal':
      apiEventBus.emit({
        type: 'modal',
        modalComponent: rule.action.modalComponent ?? 'ErrorModal',
        message,
        severity: rule.action.severity ?? 'error',
      });
      break;

    case 'redirect':
      apiEventBus.emit({
        type: 'redirect',
        target: rule.action.target ?? '/login',
        message,
      });
      break;

    case 'silent':
      // Log but don't show UI
      break;

    case 'retry':
      // Handled by TanStack Query retry logic
      break;

    case 'custom':
      executeCustomHandler(rule.action.handler, error);
      break;
  }

  if (rule.action.reportToMonitoring)
    reportToMonitoring(error);
}
```

The `resolveMessage` function should:
1. Try `rule.messageKey` with i18n (use i18next directly, not React hook)
2. Fall back to `rule.fallbackMessage`
3. Fall back to `error.message`
4. Fall back to generic "An error occurred"

### 3. Specialized Error Handlers

Create handler files for complex error scenarios that need more than a simple registry rule:

**Create**: `src/lib/api/errors/handlers/authErrorHandler.ts`
- 401 with token refresh logic (delegates to `tokenRefresh.ts` from Task 2)
- 403 with role-based messaging
- Helper: `isAuthEndpoint(url)` to skip refresh on login/register pages

**Create**: `src/lib/api/errors/handlers/validationErrorHandler.ts`
- 400/422 with field-level error extraction
- Extract field errors from response body (e.g., `{ errors: { email: ['Invalid format'] } }`)
- Emit structured validation errors that forms can consume

**Create**: `src/lib/api/errors/handlers/serverErrorHandler.ts`
- 500-599 with structured logging
- 503 maintenance mode detection (check for `Retry-After` header)
- 502/504 gateway error handling

**Create**: `src/lib/api/errors/handlers/networkErrorHandler.ts`
- No response (offline detection)
- Timeout (ECONNABORTED)
- DNS resolution failures
- Check `navigator.onLine` for offline status

**Create**: `src/lib/api/errors/handlers/subscriptionErrorHandler.ts`
- 402 Payment Required
- Feature gating (403 with specific error codes)
- Trial expiry handling
- Extract plan/feature info from response body for upgrade modal

### 4. Error Classification Utility

**Create**: `src/lib/api/errors/errorClassifier.ts`

(Note: this is the pure classification logic, separate from the interceptor that calls it)

```typescript
/**
 * Convert an AxiosError into a ClassifiedError with all context extracted.
 */
export function classifyError(error: AxiosError): ClassifiedError {
  return {
    status: error.response?.status ?? 0,
    url: error.config?.url ?? '',
    method: (error.config?.method?.toUpperCase() ?? 'GET') as HttpMethod,
    errorCode: extractErrorCode(error.response?.data),
    message: extractErrorMessage(error),
    body: error.response?.data,
    originalError: error,
    timestamp: Date.now(),
    requestId: extractRequestId(error.response),
  };
}
```

Helper functions:
- `extractErrorCode(data)` - Look for `data.code`, `data.errorCode`, `data.error`
- `extractErrorMessage(error)` - Look for `data.message`, `data.detail`, `data.error`, error.message
- `extractRequestId(response)` - Look for `X-Request-Id` or `X-Correlation-Id` header

### 5. Monitoring Reporter

**Create**: `src/lib/api/errors/errorReporter.ts`

Stub for external error reporting (Sentry, etc.):

```typescript
export function reportToMonitoring(error: ClassifiedError): void {
  // TODO: Integrate with Sentry or similar
  // For now, just log to console in development
  logger.error('errorReporter', 'Reported to monitoring', {
    status: error.status,
    url: error.url,
    errorCode: error.errorCode,
    message: error.message,
  });
}
```

## Files to Create

1. `src/lib/api/errors/errorMatcher.ts`
2. `src/lib/api/errors/errorActions.ts`
3. `src/lib/api/errors/errorClassifier.ts`
4. `src/lib/api/errors/errorReporter.ts`
5. `src/lib/api/errors/handlers/authErrorHandler.ts`
6. `src/lib/api/errors/handlers/validationErrorHandler.ts`
7. `src/lib/api/errors/handlers/serverErrorHandler.ts`
8. `src/lib/api/errors/handlers/networkErrorHandler.ts`
9. `src/lib/api/errors/handlers/subscriptionErrorHandler.ts`

## Success Criteria

- [ ] Error matcher correctly handles all matcher field types (status, path, method, errorCode, bodyField)
- [ ] AND logic works: all specified fields must match
- [ ] Priority ordering works: higher priority rules checked first
- [ ] `skipIf` callbacks are respected
- [ ] Action executor emits correct events for each action type
- [ ] Message resolution follows fallback chain (i18n → fallback → error → generic)
- [ ] Validation errors extract field-level errors from response body
- [ ] Network errors distinguish offline vs timeout
- [ ] Monitoring reporter logs in dev, ready for Sentry integration
- [ ] All files under 200 lines, all functions under 50 lines
- [ ] Lint passes, build succeeds
