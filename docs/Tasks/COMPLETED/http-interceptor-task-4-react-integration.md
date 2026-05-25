# Task 4: React Integration (Hook, TanStack Query, UI Components)

> **Reference**: `http-interceptor-architecture.md`
> **Agent**: `frontend-dev`
> **Status**: TODO
> **Estimated Scope**: ~6 files, ~400 lines
> **Dependencies**: Task 1 (event bus), Task 3 (error actions)
> **Blocks**: Task 5 (migration)

## Problem Statement

The Axios interceptor layer emits events via the API event bus, but we need React components to consume these events and render appropriate UI (toasts, modals, redirects). We also need to enhance the TanStack Query client with proper global error handling.

## Implementation Plan

### 1. API Events React Hook

**Create**: `src/lib/api/events/useApiEvents.ts`

A React hook that subscribes to the API event bus and dispatches UI actions:

```typescript
/**
 * Hook that subscribes to API events and handles them in React context.
 * Must be mounted once at the app root level (e.g., in App.tsx or a provider).
 */
export function useApiEvents(): void {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth(); // or however auth is accessed

  useEffect(() => {
    const unsubscribe = apiEventBus.subscribe((event) => {
      switch (event.type) {
        case 'toast':
          showToast(event.severity, event.message);
          break;
        case 'modal':
          // Dispatch to modal manager
          break;
        case 'redirect':
          navigate(event.target);
          break;
        case 'session-expired':
          logout();
          navigate('/login');
          break;
        case 'maintenance-mode':
          // Show maintenance page or modal
          break;
      }
    });

    return unsubscribe;
  }, [navigate, t, logout]);
}
```

### 2. API Events Provider Component

**Create**: `src/lib/api/events/ApiEventsProvider.tsx`

A component wrapper that mounts the hook and provides modal context:

```typescript
/**
 * Provider component that handles API events (toasts, modals, redirects).
 * Must wrap the app inside Router and AuthProvider.
 */
export const ApiEventsProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  useApiEvents();

  return (
    <>
      {children}
      <ApiErrorModal />      {/* Renders modals triggered by API events */}
    </>
  );
};
```

### 3. API Error Modal Component

**Create**: `src/components/feedback/ApiErrorModal.tsx`

A generic modal component that renders different modal types based on API events:

- Listen to modal events from the event bus
- Render different modal content based on `modalComponent`:
  - `ErrorModal` - Generic error with retry option
  - `MaintenanceModal` - Server maintenance message
  - `UpgradePrompt` - Subscription/payment required
  - `FeatureGateModal` - Feature not available on current plan
- Include close button and optional action buttons
- Use existing `DialogNative` or modal primitives if available in the project

### 4. Enhanced TanStack Query Client

**Update**: `src/lib/api/queryClient.ts` (new location, enhanced from existing)

```typescript
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

const STALE_TIME_MS = 60_000;
const GC_TIME_MS = 600_000;
const MAX_QUERY_RETRIES = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx)
        if (isClientError(error)) return false;
        return failureCount < MAX_QUERY_RETRIES;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // For queries that had previous data (background refetch failed),
      // show a toast so the user knows data might be stale.
      // Fresh query errors are handled by the component/error boundary.
      if (query.state.data !== undefined) {
        const message = extractQueryErrorMessage(error);
        apiEventBus.emit({ type: 'toast', severity: 'error', message });
      }
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // Auto-invalidate related queries after successful mutations
      // This is a hook point for mutation-specific logic
    },
    onError: (error, _variables, _context, mutation) => {
      // Fallback for mutations that don't handle errors themselves
      // The interceptor already handles most errors via the registry
      // This catches edge cases where the interceptor's suppressError was true
    },
  }),
});
```

### 5. Toast Integration

Check what toast system exists in the project. If there's an existing toast/notification system:
- Wire the `toast` event to it
- Ensure it supports severity levels (info, warning, error)
- Ensure it supports i18n message keys

If no toast system exists, create a simple one:

**Create**: `src/components/feedback/ToastProvider.tsx` (only if needed)

Use the existing notification system in `src/lib/notifications.ts` if possible.

### 6. Localization Strings

**Update**: `src/localization/` (whichever locale files exist)

Add error message keys:
```json
{
  "errors": {
    "sessionExpired": "Your session has expired. Please log in again.",
    "forbidden": "You don't have permission to perform this action.",
    "featureNotAvailable": "This feature is not available on your current plan.",
    "subscriptionRequired": "A subscription is required to access this feature.",
    "validationFailed": "Please check your input and try again.",
    "conflict": "This resource has been modified. Please refresh and try again.",
    "tooManyRequests": "Too many requests. Please wait a moment and try again.",
    "maintenance": "The system is under maintenance. Please try again later.",
    "serverError": "An unexpected error occurred. Please try again later.",
    "badGateway": "The server is temporarily unavailable. Please try again.",
    "networkOffline": "You appear to be offline. Please check your connection.",
    "requestTimeout": "The request took too long. Please try again.",
    "unknownError": "An unexpected error occurred."
  }
}
```

## Files to Create/Modify

1. `src/lib/api/events/useApiEvents.ts` (create)
2. `src/lib/api/events/ApiEventsProvider.tsx` (create)
3. `src/components/feedback/ApiErrorModal.tsx` (create)
4. `src/lib/api/queryClient.ts` (create - enhanced version)
5. Localization files (modify - add error strings)
6. `src/App.tsx` or root layout (modify - mount ApiEventsProvider)

## Success Criteria

- [ ] API events hook subscribes/unsubscribes correctly (no memory leaks)
- [ ] Toast events display visible notifications with correct severity
- [ ] Modal events open appropriate modal dialogs
- [ ] Redirect events navigate to correct routes
- [ ] Session expired triggers full logout flow
- [ ] TanStack Query retries only on server errors (not client errors)
- [ ] Background refetch failures show toast (stale data scenario)
- [ ] All error messages are localized via i18n
- [ ] ApiEventsProvider is mounted once at app root
- [ ] All files under 200 lines, all functions under 50 lines
- [ ] Lint passes, build succeeds
