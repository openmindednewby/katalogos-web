# Task: Refactor Identity UserPreferences Tests to Mock Pattern + Add Endpoint Tests

## Status: COMPLETED
## Created: 2026-03-14
## Completed: 2026-03-14
## Agent: backend-dev

---

## Problem Statement

1. **UserPreferences handler tests** (`GetUserPreferencesHandlerTests.cs`, `UpdateUserPreferencesHandlerTests.cs`) construct a real `IdentityDbContext` with InMemoryDatabase and a full `ServiceProvider`. They should instead mock `IUserPreferenceDbContext` with a `Mock<DbSet<UserPreference>>` backed by an in-memory list.

2. **Missing endpoint-level tests** for `GetProfile`, `RevokeSession`, and `ListSessions` endpoints under `Me/`.

## Changes Made

### Task 1: Refactored Handler Tests

**GetUserPreferencesHandlerTests.cs** - Refactored to use `Mock<IUserPreferenceDbContext>`:
- Removed `ServiceCollection`, `ServiceProvider`, `IdentityDbContext`, `InMemoryDatabase`
- Removed `IDisposable` implementation
- Uses `MockDbSetHelper.CreateMockDbSet()` for async DbSet mocking
- All 3 existing test scenarios preserved unchanged

**UpdateUserPreferencesHandlerTests.cs** - Refactored to use `Mock<IUserPreferenceDbContext>`:
- Removed `ServiceCollection`, `ServiceProvider`, `IdentityDbContext`, `InMemoryDatabase`
- Removed `IDisposable` implementation
- Uses `MockDbSetHelper.CreateMockDbSet()` for async DbSet mocking
- Added `SaveChangesAsync` mock verification
- All 3 existing test scenarios preserved, assertions now verify the in-memory list directly

### New Shared Helper

**Helpers/MockDbSetHelper.cs** - Reusable mock DbSet factory:
- `CreateMockDbSet<T>(List<T> data)` creates a mock `DbSet<T>` backed by a list
- Includes `TestAsyncQueryProvider`, `TestAsyncEnumerable`, `TestAsyncEnumerator` for EF Core async LINQ support
- `DbSet.Add()` callback wired to the backing list for mutation testing

### Task 2: New Endpoint Tests

**Me/GetProfileEndpointTests.cs** (3 tests):
- `HandleAsync_WhenUserIdIsNull_Returns401`
- `HandleAsync_WhenUserNotFound_Returns404`
- `HandleAsync_WhenUserExists_ReturnsProfile` (verifies all response fields)

**Me/RevokeSessionEndpointTests.cs** (3 tests):
- `HandleAsync_WhenUserIdIsNull_Returns401` (verifies service not called)
- `HandleAsync_WhenRevokeFails_Returns404` (verifies service called with correct args)
- `HandleAsync_WhenRevokeSucceeds_CallsServiceWithCorrectParameters` (verifies success branch via mock)

**Me/ListSessionsEndpointTests.cs** (3 tests):
- `HandleAsync_WhenUserIdIsNull_Returns401`
- `HandleAsync_WhenUserHasNoSessions_ReturnsEmptyList`
- `HandleAsync_WhenSessionsExist_ReturnsMappedSessions` (verifies field mapping)

### Project File Changes

**IdentityService.Tests.csproj** - Added direct package references:
- `FastEndpoints` (for `Factory.Create<T>()` unit testing helper)
- `Security.Claims` (for `OnlineMenuClaimTypes.Sub` claim type)

## Verification Results

- [x] Handler tests use `Mock<IUserPreferenceDbContext>` instead of real DbContext
- [x] No `ServiceCollection`/`ServiceProvider`/`InMemoryDatabase` in handler tests
- [x] All existing test scenarios preserved (6 handler tests)
- [x] New endpoint tests for GetProfile (3), RevokeSession (3), ListSessions (3) = 9 new tests
- [x] `identity-lint` — my files all pass; pre-existing ENDOFLINE failures in unrelated files
- [x] `identity-yagni` — PASSED
- [x] `identity-unit-tests` — PASSED (289 total tests, all passing)
