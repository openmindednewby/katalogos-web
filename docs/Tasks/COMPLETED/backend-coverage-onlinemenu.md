# Task: Improve OnlineMenu Service Unit Test Coverage

## Status: COMPLETED

## Problem Statement

The OnlineMenu service had moderate overall coverage (55% line, 45% branch, 70% method), but the Web layer (23.89% line) and Infrastructure layer (39.22% line) were significantly under-tested.

## Baseline Coverage (Before)

| Module | Line | Branch | Method |
|--------|------|--------|--------|
| OnlineMenu.Core | 97.96% | 92.3% | 97.69% |
| OnlineMenu.Infrastructure | 39.22% | 25.8% | 25% |
| OnlineMenu.UseCases | 95.29% | 83.78% | 98.12% |
| OnlineMenu.Web | 23.89% | 17.32% | 24.81% |
| **Total** | **55%** | **45.43%** | **70.43%** |

## Final Coverage (After)

| Module | Line | Branch | Method |
|--------|------|--------|--------|
| OnlineMenu.Core | 97.96% | 92.3% | 97.69% |
| OnlineMenu.Infrastructure | 57.49% | 47.58% | 50% |
| OnlineMenu.UseCases | 95.29% | 83.78% | 98.12% |
| OnlineMenu.Web | 26.4% | 17.32% | 33.57% |
| **Total** | **61.65%** | **50.57%** | **76.52%** |

## Coverage Improvements

- **Total line**: 55% -> 61.65% (+6.65%)
- **Total branch**: 45.43% -> 50.57% (+5.14%)
- **Total method**: 70.43% -> 76.52% (+6.09%)
- **Infrastructure line**: 39.22% -> 57.49% (+18.27%)
- **Infrastructure branch**: 25.8% -> 47.58% (+21.78%)
- **Infrastructure method**: 25% -> 50% (+25%)
- **Web method**: 24.81% -> 33.57% (+8.76%)
- **Tests**: 527 -> 614 (+87 new tests)

## New Test Files Created

### Infrastructure Tests
- `Infrastructure/Services/AnthropicDescriptionServiceTests.cs` - 14 tests covering all code paths (missing API key, success, API errors, empty responses, HTTP exceptions, timeout, invalid JSON, request body content)
- `Infrastructure/Services/NginxConfigProviderTests.cs` - 9 tests covering AddDomain/RemoveDomain with and without config path, file creation/deletion, directory creation
- `Infrastructure/Services/DefaultSubscriptionStatusServiceTests.cs` - 4 tests confirming always-false behavior
- `Infrastructure/Services/DotnetDnsVerifierTests.cs` - 4 tests covering DNS resolution failures for both CNAME and TXT verification
- `Infrastructure/AnthropicOptionsTests.cs` - 3 tests for option defaults and property setting

### Validator Tests
- `Validators/GenerateDescriptionValidatorTests.cs` - 12 tests covering all validation rules for AI description generation
- `Validators/MenuValidationLimitsTests.cs` - 4 tests for constant values

### Web Tests
- `Web/EndpointRoutesAndDtosTests.cs` - 30 tests covering all endpoint route constants and request/response DTO record properties
- `Web/WebPolicyNamesTests.cs` - 1 test for policy name constant
- `Web/BaseResponseDtoTests.cs` - 2 tests for base DTO properties

## Notes

- The Web layer's remaining untested code is primarily FastEndpoints `HandleAsync` methods which cannot be tested as pure unit tests (they require the FastEndpoints test framework for integration testing)
- All new test files use UTF-8 with BOM encoding and CRLF line endings per project standards
- All tests follow AAA pattern with NSubstitute + Shouldly
- All quality checks pass: lint, YAGNI, unit tests
