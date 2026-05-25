# Task: Fix OnlineMenu Service Lint Errors

## Status: COMPLETED

## Problem Statement
The `onlinemenu-lint` Tilt resource was failing with multiple lint errors across files in the OnlineMenu service.

## Changes Made

### 1. DotnetDnsVerifier.cs (IDE0011 - Add braces to if statement)
- Extracted the complex multi-line if condition into two named boolean variables (`isHostNameMatch`, `isAliasMatch`) to keep the if statement on a single line, avoiding the need for braces per `csharp_prefer_braces = when_multiline:warning`.

### 2. ActivateTenantMenusHandlerTests.cs (S2699 - Missing assertion)
- Added `result.IsSuccess.ShouldBeTrue()` assertion to `Handle_ValidMenu_CallsRepositoryUpdateOnce` test. The test previously only verified mock interactions via `Received()` without an explicit Shouldly/xUnit assertion, which SonarAnalyzer S2699 requires.

### 3. DeactivateTenantMenusHandlerTests.cs (S2699 - Missing assertion)
- Same fix as above: added `result.IsSuccess.ShouldBeTrue()` assertion to `Handle_ValidMenu_CallsRepositoryUpdateOnce` test.

## Verification Results
- `onlinemenu-lint`: PASSED (update=ok)
- `onlinemenu-unit-tests`: PASSED (327 passed, 0 failed, 0 skipped)
- All files verified to have UTF-8 BOM encoding
