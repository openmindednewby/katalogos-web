# Task: PaymentService Code Review Fixes

## Status: COMPLETED

## Problem Statement
8 code review issues found in PaymentService ranging from HIGH (security/architecture) to MEDIUM (code quality).

## Changes Made

### Issue 1 (HIGH): Multi-Tenancy Query Filter - FIXED
- Added `ICurrentTenantService` injection to `PaymentDbContext` constructor
- Added `SetTenantFilter<Subscription>()` and `SetTenantFilter<Payment>()` in `OnModelCreating`
- Implemented `SetTenantFilter<TEntity>` method matching the QuestionerService pattern

### Issue 2 (HIGH): Endpoint Folder Structure - FIXED
- Moved all endpoints from `Endpoints/Billing/`, `Endpoints/Subscriptions/`, etc. to domain folders at project root: `Billing/`, `Subscriptions/`, `PricingPlans/`, `Webhooks/`
- Updated all namespaces from `PaymentService.API.Endpoints.X` to `PaymentService.API.X`
- Deleted the entire `Endpoints/` directory

### Issue 3 (HIGH): Infrastructure Depends on UseCases - FIXED
- Moved `BillingSchedulerService.cs` from `PaymentService.Infrastructure/BackgroundServices/` to `PaymentService.API/BackgroundServices/`
- Removed the `PaymentService.UseCases` ProjectReference from `Infrastructure.csproj`
- Removed unused `MediatR` PackageReference from `Infrastructure.csproj`
- Updated `ProgramExtensions.cs` to reference the new namespace

### Issue 4 (MEDIUM): IConfiguration in StripePaymentProvider - FIXED
- Created `StripeOptions` class in `Infrastructure/PaymentProviders/` with `SecretKey`, `PublishableKey`, `WebhookSecret` properties
- Changed `StripePaymentProvider` to inject `IOptions<StripeOptions>` instead of `IConfiguration`
- Changed `StripeWebhook` endpoint to inject `IOptions<StripeOptions>` instead of `IConfiguration`
- Added `builder.Services.Configure<StripeOptions>(...)` in `ProgramExtensions.cs`

### Issue 5 (MEDIUM): Redundant Condition - FIXED
- Removed `|| subscription.StripeSubscriptionId == ""` from `ProcessExpiredTrialsCommand.cs`
- Kept just `string.IsNullOrEmpty(subscription.StripeSubscriptionId)`

### Issue 6 (MEDIUM): EF Core Reference in UseCases - FIXED
- Removed `using Microsoft.EntityFrameworkCore;` from `GetBillingHistoryQuery.cs`
- Removed `<PackageReference Include="Microsoft.EntityFrameworkCore" />` from `UseCases.csproj`

### Issue 7 (MEDIUM): Missing Role Authorization - FIXED
- Added `Roles("User")` to all 7 authenticated endpoints:
  - CreateSubscription, GetCurrentSubscription, CancelSubscription
  - ChangePlan, CheckFeatureAccess, GetBillingHistory, CreatePortalSession
- GetPricingPlans and StripeWebhook correctly remain AllowAnonymous

### Issue 8 (MEDIUM/Critical Bug): Webhook Bulk Mutation - FIXED
- Rewrote `HandleStripeWebhookHandler` to parse JSON payload and extract specific Stripe subscription ID
- `HandlePaymentSucceeded` and `HandlePaymentFailed` extract subscription ID from `data.object.subscription` (invoice events)
- `HandleSubscriptionDeleted` extracts subscription ID from `data.object.id` (subscription event)
- Each handler now uses `GetByStripeSubscriptionIdAsync()` to find and mutate only the specific subscription
- Added null-safety with logging for missing/unparseable subscription IDs

## Verification
- Build: 0 errors (pre-existing MSB3277 warning in test project unrelated to changes)
- Tests: 24 passed, 0 failed
- dotnet format: ran successfully
- All new .cs files have UTF-8 BOM encoding
