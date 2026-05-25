# Task: Push OnlineMenu Unit Test Coverage

## Problem Statement
OnlineMenu service had the lowest coverage of the 4 non-Identity services at 60.58% line coverage.
The weakest areas were OnlineMenu.Web (18.43% line) and OnlineMenu.Infrastructure (55.1% line).
Other services (Questioner 94%, Content 99%, Notification 96%) were already well above target.

## Approach
Focused on writing tests for:
1. Web layer validators (Location, Experiment, MenuVersion, Import, ApplyImport, QrScan)
2. Web middleware (ApiVersionRedirectMiddleware, ApiKeyAuthMiddleware)
3. Web endpoint DTOs/routes not yet covered (Translations, Experiments, Locations, MenuVersions, Analytics, CustomDomains)
4. Infrastructure services (DefaultMultiLocationFeatureService, AnthropicTranslationService, UmamiOptions)
5. Fixed pre-existing NoCacheHeadersMiddleware test failures

## Coverage Results

### Before
| Module | Line | Branch | Method |
|--------|------|--------|--------|
| OnlineMenu.Core | 94.01% | 88.04% | 92.06% |
| OnlineMenu.Infrastructure | 55.1% | 52.75% | 45.32% |
| OnlineMenu.UseCases | 93.04% | 74.06% | 94.43% |
| OnlineMenu.Web | 18.43% | 12.62% | 20.62% |
| **Total** | **60.58%** | **52.05%** | **69.21%** |

### After
| Module | Line | Branch | Method |
|--------|------|--------|--------|
| OnlineMenu.Core | 94.73% | 88.04% | 93.42% |
| OnlineMenu.Infrastructure | 61.32% | 61.37% | 48.59% |
| OnlineMenu.UseCases | 93.04% | 74.06% | 94.43% |
| OnlineMenu.Web | 30.5% | 16.34% | 44.94% |
| **Total** | **65.9%** | **55%** | **75.8%** |

### Test Count: 1026 -> 1195 (+169 tests)

## Files Created
- `Validators/LocationValidatorTests.cs` - CreateLocation + UpdateLocation validator tests
- `Validators/ExperimentValidatorTests.cs` - CreateExperiment validator tests
- `Validators/MenuVersionValidatorTests.cs` - Compare, Get, List, Restore validator tests
- `Validators/ImportValidatorTests.cs` - ImportFromImage + ApplyImport validator tests
- `Validators/QrScanEndpointValidatorTests.cs` - Track + GetAnalytics validator tests
- `Web/ApiVersionRedirectMiddlewareTests.cs` - ApiVersionRedirectMiddleware tests
- `Web/ApiKeyAuthMiddlewareTests.cs` - ApiKeyAuthMiddleware tests
- `Web/EndpointRoutesExtendedTests.cs` - Locations, Experiments, MenuVersions, Translations, TenantMenus DTOs
- `Web/WebPolicyNamesExtendedTests.cs` - WebPolicyNames constants
- `Web/AnalyticsEndpointDtoTests.cs` - Analytics + QrScan DTO tests
- `Web/CustomDomainEndpointDtoTests.cs` - CustomDomain DTO tests
- `Infrastructure/Services/DefaultMultiLocationFeatureServiceTests.cs`
- `Infrastructure/Services/AnthropicTranslationServiceTests.cs`
- `Infrastructure/UmamiOptionsTests.cs`

## Files Fixed
- `Web/NoCacheHeadersMiddlewareTests.cs` - Fixed 4 pre-existing test failures

## Verification
- [x] onlinemenu-lint: PASS
- [x] onlinemenu-yagni: PASS
- [x] onlinemenu-unit-tests: PASS (1195 tests, 0 failures)
- [x] onlinemenu-api: PASS (container rebuild successful)
