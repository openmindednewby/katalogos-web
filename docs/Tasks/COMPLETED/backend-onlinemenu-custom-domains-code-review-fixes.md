# Task: Fix Code Review Issues in Custom Domains Backend

## Status: COMPLETED

## Problem Statement

Two code review issues were identified in the OnlineMenu service Custom Domains feature:

### Issue 1: HIGH - CheckDomain bypasses CQRS
- **File**: `OnlineMenu.Web/CustomDomains/CheckDomain.cs`
- **Problem**: Endpoint directly injects `ICustomDomainRepository` and contains business logic (`domain.Status != CustomDomainStatus.Revoked`). Violates CQRS pattern -- all endpoints must delegate to MediatR handlers.
- **Fix**: Create `CheckDomainAvailabilityQuery` and `CheckDomainAvailabilityHandler` in UseCases layer, update endpoint to use IMediator only.

### Issue 7: LOW - DotnetDnsVerifier doesn't validate ownership token
- **File**: `OnlineMenu.Infrastructure/Dns/DotnetDnsVerifier.cs`
- **Problem**: CNAME verification accepts any resolving domain. TXT verification never checks `expectedToken`. Ownership verification is effectively nonfunctional.
- **Fix**: Add prominent XML doc comment documenting this is a development stub. Add TODO comment. Add startup warning log in InfrastructureServiceExtensions.cs.

## Architectural Approach
- Follow existing CQRS patterns (see ResolveDomainQuery/Handler as reference)
- Use `Result<bool>` return type from handler
- Unit tests using NSubstitute + Shouldly (matching existing test patterns)
- FastEndpoints with primary constructor injecting IMediator

## Affected Services
- OnlineMenu service only

## Changes Made

### Issue 1: CheckDomain CQRS Fix
1. **Created** `OnlineMenu.UseCases/CustomDomains/CheckAvailability/CheckDomainAvailabilityQuery.cs` -- record with DomainName property, returns `Result<bool>`
2. **Created** `OnlineMenu.UseCases/CustomDomains/CheckAvailability/CheckDomainAvailabilityHandler.cs` -- queries repository, checks status != Revoked, returns Result<bool>
3. **Updated** `OnlineMenu.Web/CustomDomains/CheckDomain.cs` -- removed ICustomDomainRepository injection, now injects only IMediator and delegates to handler
4. **Created** `OnlineMenu.UnitTests/UseCases/CustomDomains/CheckDomainAvailabilityHandlerTests.cs` -- 7 tests covering all statuses, not-found, and null/empty input

### Issue 7: DotnetDnsVerifier Stub Documentation
1. **Updated** `OnlineMenu.Infrastructure/Dns/DotnetDnsVerifier.cs` -- added prominent XML doc summary documenting it as DEVELOPMENT STUB, added TODO remarks pointing to DnsClient.NET, changed log levels from Information to Warning for stub acceptance
2. **Updated** `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` -- added configuration guard that logs a warning at startup if DomainVerification:Enabled is true while stub verifier is in use

## Verification Results
- [x] `onlinemenu-lint` -- PASSED
- [x] `onlinemenu-yagni` -- PASSED
- [x] `onlinemenu-unit-tests` -- PASSED (335 tests, 0 failures)
- [x] `onlinemenu-api` -- PASSED (container rebuilt successfully)

## Success Criteria
- [x] CheckDomain endpoint delegates to MediatR handler
- [x] No business logic in endpoint layer
- [x] Handler has comprehensive unit tests
- [x] DotnetDnsVerifier has prominent stub documentation
- [x] InfrastructureServiceExtensions logs warning for stub verifier
- [x] onlinemenu-lint passes
- [x] onlinemenu-unit-tests passes
- [x] onlinemenu-api builds successfully
