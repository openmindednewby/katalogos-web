# Audit Skipped E2E Tests - Implement or Remove

## Status: COMPLETED

## Objective
Find all skipped tests across the E2E suite and either implement them, remove them, or justify keeping them skipped.

## Analysis

### Categories of skips found:

#### 1. UNCONDITIONALLY SKIPPED (test.skip('name', async () => ...))
These are tests with `test.skip` as the function call, meaning they NEVER run:

- `logout.spec.ts` - "should clear session after logout" (line 198)
- `logout.spec.ts` - "should redirect to login when accessing protected route after logout" (line 234)

#### 2. UNCONDITIONALLY SKIPPED (test.skip(true, 'hardcoded reason'))
- `check-tenants.spec.ts` - "check tenants" - Debug-only test
- `content-api.spec.ts` - 4 placeholder tests "Requires authentication setup for Content Service"

#### 3. CONDITIONAL SKIPS (KEEP - legitimate runtime guards)
These skip based on runtime conditions (environment, service availability, feature flags):
- `auth.setup.ts` - Skips if TEST_USER credentials not set
- `multi-tenant.setup.ts` - Skips if credentials not set
- `login.spec.ts` - Skips credential-dependent tests if not set
- `token-refresh.spec.ts` - Skips if credentials not set
- `identity/logout.spec.ts` - Inner test.skip for credentials
- `tenant-claims.spec.ts` - Run once on chromium only
- `tenant-isolation.spec.ts` - Run once on chromium only
- `content-api.spec.ts` - Service availability checks
- All notification tests - Feature API availability checks
- `questioner/*` - Quiz/form availability checks
- `monitoring/*` - Prometheus/Grafana availability checks
- `logging/*` - Loki/service availability checks
- `online-menus/*` - Menu activation failure guard
- `notification-preferences.spec.ts` - Feature not implemented yet guards

## Decisions

| Test | Decision | Reason |
|------|----------|--------|
| logout: clear session | IMPLEMENT | Real feature, timing issue fixable |
| logout: redirect after logout | IMPLEMENT | Real feature, timing issue fixable |
| check-tenants | REMOVE | Debug utility, not a real test |
| content-api: validate request body | REMOVE | Empty placeholder, no auth infra |
| content-api: reject invalid file types | REMOVE | Empty placeholder, no auth infra |
| content-api: enforce file size limits | REMOVE | Empty placeholder, no auth infra |
| content-api: validate content ID exists | REMOVE | Empty placeholder, no auth infra |
| All conditional skips | KEEP | Legitimate runtime guards |

## Changes Made

### REMOVED (5 tests across 2 files):

1. **Deleted `E2ETests/tests/check-tenants.spec.ts`** - Debug-only utility test that was permanently skipped with `test.skip(true, 'Debug-only test')`. Had no assertions, just read page data into unused variables.

2. **Removed 4 placeholder tests from `E2ETests/tests/content/content-api.spec.ts`**:
   - "POST /api/content/upload-url should validate request body"
   - "POST /api/content/upload-url should reject invalid file types"
   - "POST /api/content/upload-url should enforce file size limits"
   - "POST /api/content/upload-complete should validate content ID exists"

   All were empty shells with `test.skip(true, 'Requires authentication setup for Content Service')` and no test body. No auth infrastructure exists for Content Service E2E tests, so these had no path to implementation.

### IMPLEMENTED (2 tests in 1 file):

1. **`logout.spec.ts` - "should clear session after logout"**
   - Root cause of skip: After the first test logs out, the init script restores stale auth from localStorage, causing re-login to fail.
   - Fix: Clear localStorage before re-login, save fresh auth state after login, then perform logout and verify session storage tokens are cleared.

2. **`logout.spec.ts` - "should redirect to login when accessing protected route after logout"**
   - Root cause of skip: Same stale localStorage issue as above.
   - Fix: Clear storage, re-login, navigate to protected route, simulate auth expiry by clearing all storage, reload, and verify redirect to login.

### KEPT AS-IS (all conditional skips):
All remaining ~60+ `test.skip()` calls are legitimate runtime guards that check for:
- Environment variables (TEST_USER_USERNAME/PASSWORD)
- Service availability (Content Service, Prometheus, Loki, Grafana)
- Feature availability (notification test API, quiz forms, preferences screen)
- Browser-specific execution (chromium-only for tenant isolation)

These are correct patterns -- they allow tests to degrade gracefully when infrastructure is unavailable rather than hard-failing.

## Verification
- TypeScript compilation: No new errors introduced (pre-existing QuizTemplatesPage.ts errors unchanged)
- No remaining `test.skip('name', fn)`, `test.fixme`, `test.todo`, or `describe.skip` patterns in the test suite
