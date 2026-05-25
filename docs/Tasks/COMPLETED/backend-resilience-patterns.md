# Backend Resilience Patterns Implementation

## Status: COMPLETED

## Problem Statement

The 5+ microservices (Identity, Questioner, OnlineMenu, Content, Notification) communicate via RabbitMQ (MassTransit) and HTTP (Keycloak). Without resilience patterns, failures cascade across services. This is a Phase 0 launch blocker.

## Current State Analysis (Before Changes)

### MassTransit (RabbitMQ)
- **Shared package**: `Messaging.RabbitMq` NuGet package provides `AddRabbitMqMessaging()` extension
- **Existing retry**: Uses `UseMessageRetry` with intervals 1s/5s/15s/30s (good)
- **Existing health**: Reports `Degraded` instead of `Unhealthy` when RabbitMQ is down (good)
- **MISSING**: Circuit breaker on consumers
- **MISSING**: Dead-letter/error queue configuration
- **MISSING**: Consumer-level exception filters
- **NotificationService**: Had its OWN inline MassTransit config (did NOT use shared package) -- no retry, no circuit breaker, no outbox

### HTTP Clients
- **ServiceDefaults**: Already uses `AddStandardResilienceHandler()` from `Microsoft.Extensions.Http.Resilience` -- provides retry + circuit breaker + timeout for ALL `HttpClient` instances
- **Conclusion**: HTTP resilience was ALREADY handled. No additional work needed.

## Changes Made

### 1. Messaging.RabbitMq Package (v1.0.2 -> v1.1.0)

**New file: `Configuration/ResilienceOptions.cs`**
- Configurable retry intervals (default: 1s, 5s, 15s, 30s exponential backoff)
- Circuit breaker settings (trip threshold, tracking period, reset interval)
- In-memory outbox toggle
- All settings have production-ready defaults

**Updated: `Extensions/ServiceCollectionExtensions.cs`**
- Added `resilienceOptions` optional parameter to both `AddRabbitMqMessaging` overloads
- Extracted `ConfigureResilience()` internal method applying: retry, circuit breaker, outbox, endpoints
- Circuit breaker: trips after 5 failures in 30s, resets after 60s (configurable)
- MassTransit automatically creates `_error` and `_skipped` queues for dead-letter handling
- Backward compatible: existing callers work unchanged (optional parameter defaults to null)

**Updated: `Publishers/INotificationEventPublisher.cs`**
- Added `TryPublishAsync<TEvent>()` -- fire-and-forget with graceful degradation
- Added `TryPublishBatchAsync<TEvent>()` -- batch version of graceful degradation
- Existing `PublishAsync` and `PublishBatchAsync` behavior unchanged

**Updated: `Publishers/NotificationEventPublisher.cs`**
- Implemented `TryPublishAsync` -- catches exceptions, logs warning, returns false
- Implemented `TryPublishBatchAsync` -- publishes as many as possible, returns success count

### 2. NotificationService Direct Fix

**Updated: `Notification.Web/Program.cs`**
- Added `UseMessageRetry` with exponential backoff (1s, 5s, 15s, 30s)
- Added `UseCircuitBreaker` (5 failures / 30s window / 60s reset)
- Added `UseInMemoryOutbox` for transactional consistency
- Added comment explaining MassTransit's automatic `_error` queue creation

### 3. Unit Tests (34 total, all passing)

**New: `ResilienceOptionsTests.cs` (8 tests)**
- Default values (retry intervals, circuit breaker settings, outbox)
- Custom options override defaults
- Static Default matches new instance

**New: `ServiceCollectionExtensionsTests.cs` (7 tests)**
- DI registration of INotificationEventPublisher
- Both overloads (IConfiguration and connection string)
- Custom resilience options accepted
- Consumer configuration callback invoked
- Null config falls back to defaults

**Updated: `NotificationEventPublisherTests.cs` (19 tests)**
- All original tests preserved
- Added: TryPublishAsync success returns true
- Added: TryPublishAsync failure returns false (no throw)
- Added: TryPublishAsync passes cancellation token
- Added: TryPublishBatchAsync returns full count on success
- Added: TryPublishBatchAsync returns partial count on partial failure
- Added: TryPublishBatchAsync returns 0 on empty collection
- Added: TryPublishBatchAsync returns 0 when all fail (no throw)

## Verification Results

### Messaging.RabbitMq Package
- Build: PASS (0 warnings, 0 errors, Release mode)
- Tests: 34/34 PASS

### NotificationService (directly modified)
- notification-lint: PASS
- notification-yagni: PASS
- notification-unit-tests: PASS
- notification-api: PASS (container rebuilt successfully)

### Other Services (unmodified, verify no regressions)
- questioner-unit-tests: PASS
- content-unit-tests: PASS
- identity-unit-tests: FAILED (pre-existing: Privacy endpoint test compilation errors, unrelated)
- onlinemenu-unit-tests: FAILED (pre-existing: AnthropicDescriptionService.cs errors, unrelated)
- IdentityService build: PASS (API builds, tests have pre-existing issues)
- ContentService build: PASS
- QuestionerService build: PASS

### HTTP Resilience (No Changes Needed)
All services already use `AddStandardResilienceHandler()` via ServiceDefaults which provides:
- Retry with exponential backoff for transient HTTP failures
- Circuit breaker for downstream service outages
- Timeout policies
- Service discovery

## Architecture Decisions

1. **Circuit breaker at bus level, not consumer level**: MassTransit's `UseCircuitBreaker` applies to all endpoints on the bus. This is the correct approach because individual consumer circuit breakers would still process poison messages repeatedly.

2. **Dead-letter via MassTransit defaults**: MassTransit automatically creates `_error` and `_skipped` queues for each consumer endpoint. Messages that fail all retries go to `_error`. No custom dead-letter configuration needed.

3. **Graceful degradation via TryPublish pattern**: Instead of wrapping every notification call in try/catch at the call site, the `TryPublishAsync` pattern centralizes the degradation logic in the publisher. Services call one method and get a boolean result.

4. **Optional ResilienceOptions parameter**: Uses C# optional parameter with null default to maintain backward compatibility. Services that need custom settings can override; others get production-ready defaults automatically.

5. **HTTP resilience already handled**: The `AddStandardResilienceHandler()` in ServiceDefaults provides Microsoft's recommended resilience pipeline for all HttpClient instances. No additional Polly configuration needed.

## Version Bump
- Messaging.RabbitMq: 1.0.2 -> 1.1.0 (minor version: new features, backward compatible)
