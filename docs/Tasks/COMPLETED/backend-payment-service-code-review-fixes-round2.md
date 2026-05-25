# PaymentService Code Review Fixes (Round 2)

## Status: COMPLETED

## Problem Statement
10 code review issues identified in the PaymentService, ranging from CQRS violations to silent exception swallowing, incorrect DI lifetime, dead code, and missing BOM encoding.

## Issues Fixed

### Issue 1 (HIGH): CheckFeatureAccess bypasses CQRS - FIXED
- Created `CheckFeatureAccessQuery(Guid TenantId, string FeatureCode)` in UseCases/Queries
- Handler delegates to `IFeatureGateService.CheckFeatureAccessAsync`
- Endpoint now injects only `IMediator`

### Issue 2 (HIGH): CreatePortalSession bypasses CQRS - FIXED
- Created `CreatePortalSessionCommand(Guid TenantId, string ReturnUrl)` in UseCases/Commands
- Handler performs subscription lookup + Stripe portal session creation
- Endpoint now injects only `IMediator`

### Issue 3 (MEDIUM): StripePaymentProvider registered as Singleton - FIXED
- Changed `AddSingleton` to `AddScoped` in ProgramExtensions.cs

### Issue 4 (HIGH): Empty string instead of null for StripeSubscriptionId - FIXED
- Changed `trialSub.SetStripeIds(customerId, "")` to `trialSub.SetStripeIds(customerId, null)`
- Updated `SetStripeIds` to accept `string? subscriptionId`

### Issue 5 (HIGH): Silent exception swallowing in webhook handler - FIXED
- Changed `catch (Exception)` to `catch (JsonException ex)` and `catch (KeyNotFoundException ex)`
- Added `logger.LogWarning(ex, ...)` in both extraction methods
- Changed extraction methods from static to instance for logger access

### Issue 6 (MEDIUM): GetBillingHistoryQuery pagination bug - FIXED
- Added `GetPaymentHistoryAsync` to `ISubscriptionRepository`
- Implemented server-side pagination in `SubscriptionRepository` querying `Payments` table directly
- Updated handler to use new method; updated all 5 tests

### Issue 7 (MEDIUM): ChangePlanCommand silent failure - FIXED
- Returns `Result.Error("Stripe price ID not configured for this plan and billing cycle")` when price ID missing
- Added test `Handle_ReturnsError_WhenStripePriceIdNotConfigured`

### Issue 8 (MEDIUM): Dead/duplicate DTOs - FIXED
- Removed unused `CreateSubscriptionRequest` and `ChangePlanRequest` from UseCases DTOs
- API layer defines its own request DTOs; only `CreateSubscriptionResponse` retained

### Issue 9 (LOW): Missing UTF-8 BOM - FIXED
- Re-saved `CancelSubscriptionHandlerTests.cs` and 9 other test files with UTF-8 BOM

### Issue 10 (LOW): Unguarded index access in StripePaymentProvider - FIXED
- Added guard: `if (subscription.Items?.Data is not { Count: > 0 }) throw new InvalidOperationException(...)`

## Verification
- payment-lint: PASS
- payment-yagni: PASS
- payment-unit-tests-coverage: PASS (coverage > 40%)
