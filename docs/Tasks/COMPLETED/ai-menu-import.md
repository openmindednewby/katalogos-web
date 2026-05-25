# AI Menu Import (Photo/PDF) - Backend

## Problem Statement
Users need the ability to upload a photo of a paper menu or PDF and have AI extract structured menu data (categories, items, prices, dietary tags) for review before saving.

## Architectural Approach
- Reuse existing Anthropic API integration patterns (AnthropicDescriptionService, AnthropicOptions)
- Claude Vision API with `claude-sonnet-4-6` model for image/PDF understanding
- CQRS pattern: ImportMenuFromImageCommand + ApplyMenuImportCommand
- FastEndpoints for the two new endpoints
- Feature gating via ISubscriptionStatusService (Free tier: limited, Pro+: unlimited)

## Affected Services
- OnlineMenuService (Core, UseCases, Infrastructure, Web layers)

## Implementation Plan

### Core Layer
1. `IAiMenuImportService` interface in `Core/Interfaces/`
2. `ImportedMenuData`, `ImportedCategory`, `ImportedMenuItem` DTOs in `UseCases/TenantMenus/ImportMenu/DTOs/`
3. `MergeStrategy` enum in same location

### UseCases Layer
4. `ImportMenuFromImageCommand` + `ImportMenuFromImageHandler`
5. `ApplyMenuImportCommand` + `ApplyMenuImportHandler`
6. DTOs for the import flow

### Infrastructure Layer
7. `AnthropicMenuImportService` implementing `IAiMenuImportService`
8. Vision API request with image content block
9. JSON response parsing with validation

### Web Layer
10. `ImportFromImage` endpoint (POST /TenantMenus/import-from-image)
11. `ApplyImport` endpoint (POST /TenantMenus/{ExternalId}/apply-import)
12. Validators for both endpoints
13. Rate limiting policy: AiImport (5 req/60s)

### Unit Tests
14. AnthropicMenuImportServiceTests (prompt, parsing, error handling)
15. ImportMenuFromImageHandlerTests (validation, subscription check)
16. ApplyMenuImportHandlerTests (merge vs replace strategies)
17. Validator tests

## Success Criteria
- [x] All Tilt checks pass (lint, YAGNI, unit tests, API rebuild)
- [x] Comprehensive unit test coverage for all new code
- [x] Follows existing patterns (FastEndpoints, CQRS, Result pattern)
- [x] Feature gating for Free vs Pro tiers
- [x] Rate limiting for expensive AI operations

## Completion Notes

All four Tilt checks pass: onlinemenu-lint, onlinemenu-yagni, onlinemenu-unit-tests, onlinemenu-api.

Additionally fixed pre-existing issues in the Experiments feature (CHARSET/BOM, ENDOFLINE, WHITESPACE, IDE0060, S1144, broken FastEndpoints API calls).
