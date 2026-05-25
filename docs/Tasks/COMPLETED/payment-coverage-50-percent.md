# Task: Increase PaymentService Unit Test Coverage to 50%+

## Status: COMPLETED

## Problem Statement
PaymentService had 41.88% overall unit test coverage (630 of 1504 lines). The breakdown by assembly:
- PaymentService.Core: 96.89% (excellent)
- PaymentService.UseCases: 86.05% (good, some handlers missing)
- PaymentService.Infrastructure: 11.22% (FeatureGateService tested, repositories and Stripe provider untested)
- PaymentService.API: 0% (no endpoint or middleware tests)

## Solution
Added 62 new unit tests across 6 new test files, targeting the Infrastructure layer (biggest gap), untested UseCases handlers, and API middleware.

## Results

### Coverage After Changes
| Module | Line (Before) | Line (After) | Change |
|--------|--------------|--------------|--------|
| PaymentService.Core | 96.89% | 96.89% | -- |
| PaymentService.UseCases | 86.05% | 91.16% | +5.11% |
| PaymentService.Infrastructure | 11.22% | 79.44% | +68.22% |
| PaymentService.API | 0% | 10.76% | +10.76% |
| **Total** | **41.88%** | **65.59%** | **+23.71%** |

### Test Count
- Before: 114 tests across 17 test files
- After: 176 tests across 23 test files (62 new tests)

## New Test Files Created

### Infrastructure Layer Tests
1. `PaymentService/tests/PaymentService.Tests/Infrastructure/SubscriptionRepositoryTests.cs`
   - 14 tests using in-memory EF Core DbContext
   - Tests: GetByTenantIdAsync, GetByStripeSubscriptionIdAsync, GetByIdAsync, GetByExternalIdAsync, GetByStatusAsync, GetExpiredTrialsAsync, GetExpiredGracePeriodsAsync, GetDueForRenewalAsync, GetPaymentHistoryAsync, AddAsync, SaveChangesAsync

2. `PaymentService/tests/PaymentService.Tests/Infrastructure/PricingPlanRepositoryTests.cs`
   - 14 tests using in-memory EF Core DbContext
   - Tests: GetAllActiveAsync (empty, active-only filter, ordering, includes), GetByIdAsync, GetByExternalIdAsync, GetByTierAsync (not found, exists, active-only), AddAsync, SaveChangesAsync

3. `PaymentService/tests/PaymentService.Tests/Infrastructure/PaymentDbContextTests.cs`
   - 9 tests validating DbContext configuration
   - Tests: DbSet configuration, persistence of PricingPlan+FeatureLimits, Subscription+Events, Payment, multi-tenant filtering (bypass and filter modes), cascade delete, SubscriptionEvent persistence

4. `PaymentService/tests/PaymentService.Tests/Infrastructure/StripePaymentProviderTests.cs`
   - 6 tests for constructor behavior and StripeOptions configuration
   - Tests: API key setting, empty key handling, section name, default values, property setters, interface implementation

### UseCases Handler Tests
5. `PaymentService/tests/PaymentService.Tests/Subscriptions/CreatePortalSessionHandlerTests.cs`
   - 5 tests for the CreatePortalSession command handler
   - Tests: not found (no subscription), not found (no Stripe customer), success, return URL passthrough, Stripe customer ID usage

6. `PaymentService/tests/PaymentService.Tests/Subscriptions/CheckFeatureAccessHandlerTests.cs`
   - 4 tests for the CheckFeatureAccess query handler
   - Tests: success with access, success without access, parameter passthrough, count-limited feature

### API Layer Tests
7. `PaymentService/tests/PaymentService.Tests/API/ApiVersionRedirectMiddlewareTests.cs`
   - 8 tests for the API version redirect middleware
   - Tests: unversioned redirect (308), versioned passthrough, non-API passthrough, query string preservation, root API path, v2 passthrough, case insensitivity, null path

## Additional Fixes
- Fixed pre-existing build error: `UseSentryUserContext()` call in Program.cs referenced method from unpublished Logging.Client 1.2.0; built and published 1.2.0 to local NuGet feed
- Added `Metrics.Client` version 1.0.0 to Directory.Packages.props (package reference was added by another task but version was missing from central package management)
- Fixed import ordering in ProgramExtensions.cs (Metrics.Client.Extensions was out of alphabetical order)

## Verification
- [x] payment-lint: PASS
- [x] payment-yagni: PASS
- [x] payment-unit-tests: PASS (176 tests, 0 failures)
- [x] payment-unit-tests-coverage: PASS (65.59% line coverage)

---

## Round 2: API Endpoint Tests (2026-03-20)

### Problem
API layer was still at 10.76% line / 6.97% branch / 6% method coverage despite having 176 tests. Endpoint HandleAsync methods were untested.

### Approach
Used FastEndpoints `Factory.Create<TEndpoint>()` pattern to unit-test endpoint HandleAsync methods directly:
- Mocked IMediator via Moq to control command/query results
- Set up HttpContext claims via ClaimsPrincipal for tenant authentication testing
- Tested all result paths: success, not-found, error, conflict, validation failures

### New Test Files (8 endpoint test classes)
1. `tests/PaymentService.Tests/API/Billing/CreatePortalSessionTests.cs` -- 6 tests (401, success, 404, 400, correct params, default return URL)
2. `tests/PaymentService.Tests/API/Billing/GetBillingHistoryTests.cs` -- 5 tests (401, success, 404, pagination params, empty history)
3. `tests/PaymentService.Tests/API/PricingPlans/GetPricingPlansEndpointTests.cs` -- 5 tests (success, 404, empty, features, mediator dispatch)
4. `tests/PaymentService.Tests/API/Subscriptions/CancelSubscriptionTests.cs` -- 5 tests (401, 204, 404, 400, correct tenant)
5. `tests/PaymentService.Tests/API/Subscriptions/ChangePlanTests.cs` -- 6 tests (401, invalid cycle, 204, 404, 400, case-insensitive parse)
6. `tests/PaymentService.Tests/API/Subscriptions/CheckFeatureAccessTests.cs` -- 5 tests (401, access granted, restricted, feature code, error)
7. `tests/PaymentService.Tests/API/Subscriptions/CreateSubscriptionTests.cs` -- 9 tests (null tenant, null subject, invalid guid, invalid cycle, 201, 404, 409, 400, correct command)
8. `tests/PaymentService.Tests/API/Subscriptions/GetCurrentSubscriptionTests.cs` -- 4 tests (401, success, 404, correct tenant)
9. `tests/PaymentService.Tests/API/Webhooks/StripeWebhookTests.cs` -- 5 tests (invalid sig, empty body, no sig, options section name, defaults)

### Pre-Existing Issues Fixed
- `ProcessExpiredTrialsHandlerExtendedTests.cs` -- File was corrupted (entire file on 3 lines with `n` instead of newlines). Reconstructed properly.
- `HandleStripeWebhookHandlerExtendedTests.cs` -- Fixed Unix line endings to Windows CRLF via `dotnet format`.

### Results After Round 2
| Module | Line (Before R2) | Line (After R2) | Change |
|--------|-----------------|-----------------|--------|
| PaymentService.API | 10.76% | 66.36% | +55.6% |
| PaymentService.Core | 96.89% | 96.89% | -- |
| PaymentService.Infrastructure | 79.44% | 79.66% | +0.22% |
| PaymentService.UseCases | 91.16% | 98.96% | +7.8% |
| **Total** | **65.59%** | **83.47%** | **+17.88%** |

- Tests: 176 -> 301 (125 new)
- Branch coverage: 79.16%
- Method coverage: 91.48%

### Round 2 Verification
- [x] payment-unit-tests: PASS (301 tests, 0 failures)
- [x] payment-unit-tests-coverage: PASS (83.47% line coverage)
- [x] payment-lint: PASS
- [x] payment-yagni: PASS
