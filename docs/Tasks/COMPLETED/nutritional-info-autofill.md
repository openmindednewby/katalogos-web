# Nutritional Info Auto-Fill (Backend)

## Status: COMPLETED

## Problem Statement
Restaurant owners need an easy way to provide nutritional information for their menu items. Manually looking up and entering calorie counts, macronutrient data, and allergen information is tedious and error-prone. By leveraging AI (Claude Haiku), we can auto-estimate nutritional info from a free-text ingredients list.

## Architectural Approach

### Layers Affected
- **Core**: Add `IAiNutritionService` interface, `NutritionalInfo` class, `Ingredients` property on `MenuItem`
- **Infrastructure**: Add `AnthropicNutritionService` implementation reusing existing Anthropic HTTP client pattern
- **UseCases**: Add `GenerateNutritionalInfo` command + handler, `NutritionalInfoDto`
- **Web**: Add `GenerateNutrition` FastEndpoint with validator and rate limiting

### Design Decisions
1. **No new database tables**: `NutritionalInfo` and `Ingredients` are stored in the existing `MenuContents` JSON blob on `MenuItem`
2. **No auto-save**: The endpoint returns data for frontend preview; the user confirms before saving via existing menu update endpoint
3. **Reuse existing AI infrastructure**: Same `AnthropicOptions`, same HTTP client pattern, same rate limit policy (`AiGenerate`)
4. **Allergen detection maps to DietaryTag keys**: AI returns allergen strings that map to existing `DietaryTag.Key` values
5. **Namespace convention**: UseCases files use `OnlineMenu.UseCases.Menus.GenerateNutrition` namespace (not `TenantMenus`) to avoid entity name collision, matching existing pattern

### Success Criteria
- [x] `POST /TenantMenus/{externalId}/generate-nutrition` endpoint works
- [x] AI prompt returns structured JSON with calories, macros, serving size, allergens
- [x] Response validation rejects out-of-range values (calories 0-5000, macros 0-500g, fiber 0-100g, sodium 0-10000mg)
- [x] Rate limited: 20 req/60s (shares AiGenerate policy with description generation)
- [x] Unit tests cover: handler, service, validator, DTO, domain entity, JSON serialization
- [x] Lint, YAGNI, unit tests, and API rebuild all pass via Tilt

## Files Created

### Core Layer
- `OnlineMenu.Core/Interfaces/IAiNutritionService.cs` -- Interface + `NutritionEstimate` record
- `OnlineMenu.Core/TenantMenusAggregate/TenantMenusAggregate.cs` -- Added `NutritionalInfo` class, `Ingredients` and `NutritionalInfo` properties on `MenuItem`

### Infrastructure Layer
- `OnlineMenu.Infrastructure/Ai/AnthropicNutritionService.cs` -- Claude Haiku API integration for nutrition estimation
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` -- DI registration for `IAiNutritionService`

### UseCases Layer
- `OnlineMenu.UseCases/TenantMenus/GenerateNutrition/GenerateNutritionalInfoCommand.cs`
- `OnlineMenu.UseCases/TenantMenus/GenerateNutrition/GenerateNutritionalInfoHandler.cs`
- `OnlineMenu.UseCases/TenantMenus/GenerateNutrition/NutritionalInfoDto.cs`

### Web Layer
- `OnlineMenu.Web/TenantMenus/GenerateNutrition.cs` -- FastEndpoint with request/response DTOs
- `OnlineMenu.Web/TenantMenus/GenerateNutrition.Validator.cs` -- FluentValidation

### Unit Tests
- `OnlineMenu.UnitTests/Infrastructure/Services/AnthropicNutritionServiceTests.cs` -- 19 tests covering API key validation, response parsing, range validation, error handling, prompt construction, code fence stripping, allergen detection
- `OnlineMenu.UnitTests/UseCases/GenerateNutritionalInfoHandlerTests.cs` -- 6 tests covering menu not found, AI errors, success, partial data, cancellation, argument passthrough
- `OnlineMenu.UnitTests/Validators/GenerateNutritionValidatorTests.cs` -- 8 tests covering all validation rules
- `OnlineMenu.UnitTests/Domain/CategoryAndMenuItemTests.cs` -- Added 4 tests for new `Ingredients`, `NutritionalInfo` properties
- `OnlineMenu.UnitTests/Domain/TenantMenusJsonSerializationTests.cs` -- Added 3 tests for JSON round-trip
- `OnlineMenu.UnitTests/Web/EndpointRoutesAndDtosTests.cs` -- Added 2 tests for route and response DTO

## Files Fixed (Pre-existing Issues)
- Fixed UTF-8 BOM and CRLF line endings on ~30 pre-existing Experiment and ImportMenu files
- Fixed incorrect FastEndpoints API calls in Experiment endpoints (`SendNotFoundAsync` -> `Send.NotFoundAsync`)
- Ran `dotnet format` to fix whitespace formatting in Experiment files

## Tilt Verification Results
- `onlinemenu-lint`: PASSED
- `onlinemenu-yagni`: PASSED
- `onlinemenu-unit-tests`: PASSED
- `onlinemenu-api`: PASSED (container rebuilt successfully)

## API Contract

### Endpoint
`POST /TenantMenus/{ExternalId:guid}/generate-nutrition`

### Authorization
Requires `Admin` role. Rate limited: 20 requests per 60 seconds (AiGenerate policy).

### Request Body
```json
{
  "itemName": "Grilled Chicken",
  "ingredients": "chicken breast, olive oil, garlic, lemon, salt, pepper"
}
```

### Response (200 OK)
```json
{
  "calories": 450,
  "proteinGrams": 35.5,
  "carbsGrams": 20.0,
  "fatGrams": 18.2,
  "fiberGrams": 3.5,
  "sodiumMg": 680.0,
  "servingSize": "1 plate",
  "detectedAllergens": ["dairy"]
}
```

### Error Responses
- `404 Not Found` -- Menu with given ExternalId does not exist
- `429 Too Many Requests` -- Rate limit exceeded
- `400 Bad Request` -- Validation failure (empty item name or ingredients)
- `500 Internal Server Error` -- AI service error
