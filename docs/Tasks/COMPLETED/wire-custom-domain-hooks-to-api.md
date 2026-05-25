# Wire Custom Domains Frontend to Backend API

## Status: COMPLETED

## Problem Statement
The `useCustomDomain` hook was a placeholder with mock data and TODO comments. It needed to be
replaced with real API calls using TanStack Query to communicate with the OnlineMenu service's
CustomDomain endpoints.

## What Was Done

### Discovery
- Ran Orval hook generation (`generate-hooks`). The OnlineMenu swagger spec does not yet include
  CustomDomain endpoints, so no auto-generated hooks were produced.
- Since no Orval-generated hooks exist, manual TanStack Query hooks were written using
  `customInstance` from `httpClient.ts`, following the same pattern as the billing hooks
  (e.g., `useCreateSubscription`, `useCancelSubscription`, `useGetCurrentSubscription`).

### Implementation

1. **Created `src/lib/hooks/customDomain/constants.ts`**
   - `CUSTOM_DOMAIN_QUERY_KEYS` for React Query cache keys
   - `VERIFICATION_POLL_INTERVAL_MS` (30s) and `VERIFICATION_POLL_INTERVAL_ACTIVE_MS` (0)
   - Moved polling constants from the component constants file to the hook layer

2. **Rewrote `useCustomDomain` hook** (moved to `hooks/useCustomDomain.ts` per module structure rules)
   - `useQuery` for GET `/CustomDomains` with dynamic `refetchInterval` based on domain status
   - `useMutation` for POST `/CustomDomains` (add domain)
   - `useMutation` for DELETE `/CustomDomains/{externalId}` (remove domain)
   - `useMutation` for POST `/CustomDomains/{externalId}/verify` (request verification)
   - All mutations invalidate the GET query on success
   - Extracted `useInvalidateDomain` and `useDomainMutations` helper hooks to stay under 50-line limit

3. **Updated barrel export** in `index.ts` to point to new `hooks/` subdirectory

4. **Removed duplicate polling constants** from `components/Settings/CustomDomainSettings/constants.ts`

5. **Types unchanged** -- `CustomDomainDto` and `UseCustomDomainReturn` remain as-is since they
   already match the expected API contract

### Design Decisions
- Notifications stay in the screen component (existing pattern) -- the hook just provides async
  functions that throw on error, letting the component's try/catch handle success/error toasts
- Used `mutateAsync` (not `mutate`) so the component can `await` and catch errors
- No circular dependency: hook imports from its own `constants.ts`, not from `components/`

## Files Modified
- `src/lib/hooks/customDomain/hooks/useCustomDomain.ts` -- NEW (moved from root)
- `src/lib/hooks/customDomain/constants.ts` -- NEW
- `src/lib/hooks/customDomain/index.ts` -- Updated barrel export path
- `src/components/Settings/CustomDomainSettings/constants.ts` -- Removed duplicate polling constants
- `src/lib/hooks/customDomain/useCustomDomain.ts` -- DELETED (moved to hooks/ subdirectory)

## Verification Results
- [x] `frontend-lint-fix` -- 0 errors (13 pre-existing warnings in other files)
- [x] `frontend-yagni` -- OK
- [x] `frontend-unit-tests` -- OK
- [x] `frontend-prod-build` -- OK
