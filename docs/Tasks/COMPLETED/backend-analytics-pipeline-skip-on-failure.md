# Task: Fix AnalyticsPipelineBehavior -- Only Fire Analytics on Success

## Status: COMPLETED

## Problem Statement

`AnalyticsPipelineBehavior` fired analytics events even when the command handler returned a failure `Result` (e.g., `Result.NotFound()`, `Result.Error()`). This meant failed QR scans (non-existent menu, inactive menu) still emitted `qr_scan_recorded` analytics events, producing false positives in analytics dashboards.

## Root Cause

The behavior checked only whether the request implements `IAnalyticsTracked`, but did not check whether the handler response indicates success. Any `IAnalyticsTracked` request that completed without throwing would fire analytics, regardless of the Result status.

## Solution

Added a runtime cast of the response to `Ardalis.Result.IResult` after the handler executes. If the response implements `IResult` and its `Status` is not a success status (`Ok`, `Created`, `NoContent`), analytics are skipped. If the response does NOT implement `IResult`, success is assumed (safe default for non-Result responses).

Key technical details:
- `Ardalis.Result.IResult` interface exposes `Status` (of type `ResultStatus`) but NOT `IsSuccess`
- `IsSuccess` only exists on the concrete `Result` and `Result<T>` classes
- Used C# property pattern matching: `response is Ardalis.Result.IResult { Status: not ResultStatus.Ok and not ResultStatus.Created and not ResultStatus.NoContent }`

## Changes Made

### 1. `OnlineMenu.UseCases/Behaviors/AnalyticsPipelineBehavior.cs`
- Added success check after the `IAnalyticsTracked` check
- Uses `Ardalis.Result.IResult` runtime cast with pattern matching on `Status`

### 2. `OnlineMenu.UnitTests/UseCases/Behaviors/AnalyticsPipelineBehaviorTests.cs`
- Added `[Theory]` test with 4 `[InlineData]` cases: NotFound, Error, Invalid, Forbidden
- Test verifies that analytics `TrackAsync` is NOT called for any failure Result status
- Test also verifies the original failure result is returned unmodified

## Verification Results

- [x] Analytics events are NOT fired when handler returns a failure Result
- [x] Analytics events ARE still fired when handler returns a success Result
- [x] Existing tests continue to pass
- [x] New test covers the failure-result scenario
- [x] `onlinemenu-lint` -- PASSED
- [x] `onlinemenu-yagni` -- PASSED
- [x] `onlinemenu-unit-tests` -- PASSED (all existing + new tests)
