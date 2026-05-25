# Task: Fix IdentityService Email Integration Code Review Issues

## Status: COMPLETED

## Problem Statement
Six code review issues were identified in the IdentityService email integration, ranging from Clean Architecture violations to coding standard violations.

## Changes Made

### Issue 1 (HIGH) -- FIXED: Move CompositeNotificationService to Infrastructure layer
- Moved `CompositeNotificationService.cs` from `IdentityService.API/` to `IdentityService.Infrastructure/`
- Updated namespace from `IdentityService.API` to `IdentityService.Infrastructure`
- Added `using IdentityService.Infrastructure;` to `ProgramExtensions.cs` (in correct alphabetical order)
- Removed the comment `// CompositeNotificationService is in this namespace (IdentityService.API)` from ProgramExtensions.cs
- Added `Email.Smtp`, `MultiTenant.NotificationProviders`, and `Twilio` package references to `IdentityService.Infrastructure.csproj`
- Updated test file to import from `IdentityService.Infrastructure` instead of `IdentityService.API`

### Issue 2 (HIGH) -- INTENTIONALLY LEFT: Concrete TwilioSmsProvider dependency
- Added XML `<remarks>` documentation to CompositeNotificationService explaining the pragmatic design decision
- TwilioSmsProvider implements INotificationService (same interface CompositeNotificationService implements), so creating a separate ISmsProvider would be over-engineering for a single SMS provider

### Issue 3 (MEDIUM) -- FIXED: Brace style violations in ProgramExtensions.cs
- Removed braces from 7 single-statement if blocks in `MapKeycloakRoleClaims`, `ConfigurePipeline`, `ApplyMigrationsAsync`, and `AddApplicationServices`
- Now compliant with `csharp_prefer_braces = when_multiline:warning` in .editorconfig

### Issue 4 (MEDIUM) -- FIXED: Tests use Assert.* instead of Shouldly
- Added `Shouldly` 4.3.0 to `Directory.Packages.props` (central package management)
- Added `Shouldly` package reference to `IdentityService.Tests.csproj`
- Converted all assertions: `Assert.True` -> `ShouldBeTrue`, `Assert.False` -> `ShouldBeFalse`, `Assert.NotNull` -> `ShouldNotBeNull`, `Assert.Equal` -> `ShouldBe`

### Issue 5 (MEDIUM) -- FIXED: Missing input validation
- Added `ArgumentException.ThrowIfNullOrWhiteSpace()` guard clauses for all parameters:
  - `SendSmsAsync`: `phoneNumber`, `message`
  - `SendEmailAsync`: `email`, `subject`, `body`
- Added 5 `[Theory]` test methods with `[InlineData(null)]`, `[InlineData("")]`, `[InlineData("   ")]` for each parameter

### Issue 6 (MEDIUM) -- DOCUMENTED: Code duplication with SmtpNotificationBridge
- Added XML `<remarks>` comment explaining the intentional similarity to SmtpNotificationBridge
- This version adds error logging on failure that the bridge does not provide
- Duplication is acceptable to avoid coupling across package boundaries

### Bonus fix: Pre-existing lint issue in MockDbSetHelper.cs
- Fixed IDE0060 (unused parameter) by adding `_ = cancellationToken;` discard

## Files Changed
- `IdentityService/src/IdentityService.API/CompositeNotificationService.cs` -- DELETED
- `IdentityService/src/IdentityService.Infrastructure/CompositeNotificationService.cs` -- CREATED
- `IdentityService/src/IdentityService.API/ProgramExtensions.cs` -- MODIFIED
- `IdentityService/src/IdentityService.Infrastructure/IdentityService.Infrastructure.csproj` -- MODIFIED
- `IdentityService/tests/IdentityService.Tests/CompositeNotificationServiceTests.cs` -- REWRITTEN
- `IdentityService/tests/IdentityService.Tests/IdentityService.Tests.csproj` -- MODIFIED
- `IdentityService/tests/IdentityService.Tests/Helpers/MockDbSetHelper.cs` -- MODIFIED
- `IdentityService/Directory.Packages.props` -- MODIFIED

## Verification Results
- identity-lint: PASSED
- identity-yagni: PASSED
- identity-unit-tests: PASSED
- identity-api: SKIPPED (Docker Desktop not running -- environment issue, not code issue)
