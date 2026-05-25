# Fix Race Condition in CompleteUploadHandler

## Status: COMPLETED

## Problem Statement
`CompleteUploadHandler.cs` called `ObjectExistsAsync` once to verify the uploaded file exists in SeaweedFS. When SeaweedFS has an indexing delay between file upload and metadata availability, this single check fails with a misleading "File not found in storage" error even though the file was successfully uploaded.

## Solution
Added retry logic with short delays around the `ObjectExistsAsync` call:
- Max 3 retries (constants: `MaxExistsCheckRetries = 3`, `ExistsCheckRetryDelayMs = 500`)
- 500ms delay between retries using `Task.Delay` with cancellation token
- Only retries on `false` result (not on exceptions)
- Logs each retry attempt and final failure via `ILogger<CompleteUploadHandler>`

## Changes Made

### `CompleteUploadHandler.cs`
- Added `using Microsoft.Extensions.Logging`
- Added `ILogger<CompleteUploadHandler>` to constructor injection
- Added constants `MaxExistsCheckRetries` (3) and `ExistsCheckRetryDelayMs` (500)
- Replaced single `ObjectExistsAsync` call with a retry loop that logs warnings on each retry and on final failure

### `CompleteUploadHandlerTests.cs`
- Added `using Microsoft.Extensions.Logging`
- Added `ILogger<CompleteUploadHandler>` mock field
- Updated constructor to pass logger to handler
- Renamed `Handle_FileNotInStorage_ReturnsInvalidResult` to `Handle_FileNotInStorage_RetriesAndReturnsInvalidResult`
- Added assertion that `ObjectExistsAsync` is called exactly 3 times when file is not found

## Verification Results
- [x] `content-lint` -- PASSED
- [x] `content-yagni` -- PASSED
- [x] `content-unit-tests` -- PASSED
- [x] `content-api` -- PASSED (container rebuilt successfully)
