# Identity Service Code Review Fixes

## Status: COMPLETED

## Issues Fixed

### Issue 1 (HIGH): Moq -> NSubstitute migration
- Replaced Moq with NSubstitute 5.3.0 in IdentityService.Tests.csproj and Directory.Packages.props
- Converted all 59 test files from Moq to NSubstitute
- Rewrote MockDbSetHelper.cs to use NSubstitute
- Converted all patterns: Mock<T>, .Setup(), .Returns(), .Verify(), .Callback, It.IsAny, It.Is, Times.*
- Fixed NSubstitute-specific issues: await on Received() for async methods, ExceptionExtensions for Throws on async, extracted CreateMockDbSet into variables to avoid CouldNotSetReturnDueToNoLastCallException

### Issue 2 (MEDIUM): Dead 404 branch in GetPreferences
- Removed unreachable else branch from GetPreferences.cs
- Removed impossible test HandleAsync_WhenNoPreferences_Returns404

### Issue 4 (MEDIUM): Assertion library inconsistency
- Converted GetPreferencesEndpointTests.cs from xUnit Assert to Shouldly
- Converted GetTenantThemeEndpointTests.cs from xUnit Assert to Shouldly
- Converted UpdateTenantThemeEndpointTests.cs from xUnit Assert to Shouldly

### Issue 6 (LOW): Incomplete stored-values test assertions
- Set WizardCompleted = true and ChecklistDismissed = true in Handle_WhenPreferencesExist_ReturnsStoredValues test data
- Added assertions for WizardCompleted and ChecklistDismissed

## Verification
- identity-lint: PASSED
- identity-unit-tests: PASSED (651 tests, 0 failures)
