# Task: Increase PaymentService Unit Test Coverage to 50%+

## Status: COMPLETED

## Problem Statement
PaymentService had 43.1% line coverage, 49.0% branch coverage, with 114 tests.
Core entities had 96.9% coverage, UseCases had 90.9%.
The coverage gap was in the Web layer (FastEndpoints) and Infrastructure layer.
Target: 50%+ line coverage. Floor threshold: 40%.

## Results
- **Line coverage: 83.47%** (from 43.1% -- 40+ percentage point increase)
- **Branch coverage: 79.16%** (from 49.0%)
- **Method coverage: 91.48%**
- **Total tests: 301** (from 114 -- 187 new tests)
- **All tests pass, lint clean**

### Coverage by Module
| Module | Line | Branch | Method |
|--------|------|--------|--------|
| PaymentService.API | 66.36% | 68.6% | 88% |
| PaymentService.Core | 96.89% | 80% | 91.3% |
| PaymentService.Infrastructure | 79.66% | 60.52% | 88% |
| PaymentService.UseCases | 98.96% | 98.78% | 95.55% |

## Files Created
- `tests/PaymentService.Tests/API/BillingSchedulerServiceTests.cs` - Background service tests
- `tests/PaymentService.Tests/Subscriptions/CreateSubscriptionHandlerExtendedTests.cs` - Trial creation paths
- `tests/PaymentService.Tests/Subscriptions/HandleStripeWebhookHandlerExtendedTests.cs` - JSON edge cases
- `tests/PaymentService.Tests/Subscriptions/GetCurrentSubscriptionHandlerExtendedTests.cs` - DTO mapping
- `tests/PaymentService.Tests/Subscriptions/CancelSubscriptionHandlerExtendedTests.cs` - Status edge cases
- `tests/PaymentService.Tests/Subscriptions/ChangePlanHandlerExtendedTests.cs` - Plan change branches
- `tests/PaymentService.Tests/Subscriptions/GetBillingHistoryHandlerExtendedTests.cs` - Payment DTO mapping
- `tests/PaymentService.Tests/Subscriptions/ProcessExpiredTrialsHandlerExtendedTests.cs` - Multiple trial handling
- `tests/PaymentService.Tests/PricingPlans/GetPricingPlansHandlerExtendedTests.cs` - Feature limit mapping
- `tests/PaymentService.Tests/Infrastructure/SubscriptionRepositoryExtendedTests.cs` - Complex queries
- `tests/PaymentService.Tests/FeatureGating/FeatureGateServiceEdgeCaseTests.cs` - Expired/suspended paths

## Files Fixed
- `tests/PaymentService.Tests/API/Webhooks/StripeWebhookTests.cs` - Fixed pre-existing NullReferenceException in no-signature-header test

## What Was Tested
1. **BillingSchedulerService** - Background scheduling, error handling, cancellation
2. **CreateSubscriptionHandler** - Trial without Stripe price, annual billing, email passthrough
3. **HandleStripeWebhookHandler** - Missing JSON properties, invalid payloads, all event types
4. **GetCurrentSubscriptionHandler** - Trial dates, cancellation, annual billing, feature mapping
5. **CancelSubscriptionHandler** - PastDue, Suspended, Trial with/without Stripe
6. **ChangePlanHandler** - Cancelled/PastDue rejection, free-to-paid without Stripe
7. **GetBillingHistoryHandler** - Failed/Pending/Refunded payment mapping
8. **ProcessExpiredTrialsHandler** - Multiple trials, billing cycle after downgrade
9. **GetPricingPlansHandler** - Feature limit type mapping, empty features
10. **SubscriptionRepository** - Expired trials/grace periods with data, payment history paging
11. **FeatureGateService** - Expired/cancelled fallback, null free plan, Enterprise upgrade
