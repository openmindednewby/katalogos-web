# Task: Show Session Expired Notification on Login Page

## Status: IN_PROGRESS

## Problem
Both the old (`httpInterceptor.ts`) and new (`useApiEvents.ts`) 401 handlers call `notify('signout', ...)` before redirecting to login. However, the redirect (`window.location.href` or `redirectTo`) triggers a full page reload that destroys the React tree, so the toast is lost before the user can see it.

## Solution
Store a `sessionExpired` flag in `sessionStorage` before redirecting. The login page checks for this flag on mount and fires the toast notification after the page is fully rendered.

## Files Modified
1. `BaseClient/src/shared/constants/index.ts` — Added `SESSION_EXPIRED: 'sessionExpired'` to `STORAGE_KEYS`
2. `BaseClient/src/lib/httpInterceptor.ts` — Set sessionStorage flag before redirect in `clearSessionAndRedirect()`
3. `BaseClient/src/lib/api/events/useApiEvents.ts` — Set sessionStorage flag before redirect in `handleSessionExpired()`
4. `BaseClient/app/(auth)/login.tsx` — Added useEffect to check flag on mount, show toast via `notifySignOut()`, and clear the flag

## Testing
- Existing unit tests for useApiEvents and httpInterceptor should still pass
- Manual test: trigger a 401 → verify toast appears on login page
- lint and test:coverage should pass
