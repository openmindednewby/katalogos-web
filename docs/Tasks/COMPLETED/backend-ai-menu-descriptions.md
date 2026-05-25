# Task: AI Menu Descriptions - Backend Implementation

## Status: COMPLETED
## Agent: backend-dev
## Created: 2026-03-18
## Completed: 2026-03-18

---

## Problem Statement

Implement the backend portion of the "AI Menu Descriptions" feature for the OnlineMenu service. This enables restaurant owners to generate appetizing, professional descriptions for their menu items using the Anthropic Claude API.

## Architecture

### Clean Architecture Layers

1. **Core Layer** - `IAiDescriptionService` interface in `Core/Interfaces/`
2. **Infrastructure Layer** - `AnthropicDescriptionService` implementation using HttpClient to call Anthropic Messages API
3. **UseCases Layer** - `GenerateMenuItemDescriptionCommand` + `GenerateMenuItemDescriptionHandler` (CQRS)
4. **Web Layer** - FastEndpoint `POST /TenantMenus/{ExternalId:guid}/generate-description`

### Affected Services
- OnlineMenu.Core (interface)
- OnlineMenu.Infrastructure (Anthropic HTTP client implementation)
- OnlineMenu.UseCases (CQRS command/handler)
- OnlineMenu.Web (FastEndpoint + rate limiting)
- OnlineMenu.UnitTests (handler tests)

## Files Created/Modified

### New Files
- `OnlineMenu.Core/Interfaces/IAiDescriptionService.cs` - Service interface
- `OnlineMenu.Infrastructure/Ai/AnthropicOptions.cs` - Configuration POCO
- `OnlineMenu.Infrastructure/Ai/AnthropicDescriptionService.cs` - Anthropic API client
- `OnlineMenu.UseCases/TenantMenus/GenerateDescription/GenerateMenuItemDescriptionCommand.cs` - CQRS command
- `OnlineMenu.UseCases/TenantMenus/GenerateDescription/GenerateMenuItemDescriptionHandler.cs` - CQRS handler
- `OnlineMenu.Web/TenantMenus/GenerateDescription.cs` - FastEndpoint
- `OnlineMenu.UnitTests/UseCases/GenerateMenuItemDescriptionHandlerTests.cs` - 6 unit tests

### Modified Files
- `OnlineMenu.Infrastructure/InfrastructureServiceExtensions.cs` - Registered AI service in DI
- `OnlineMenu.Web/Program.cs` - Added AiGenerate rate limit policy
- `OnlineMenu.Web/appsettings.json` - Added Anthropic configuration section

## API Contract

### Endpoint
`POST /TenantMenus/{ExternalId:guid}/generate-description`

### Authentication
- Requires JWT authentication
- Requires Admin role
- Rate limited: 20 requests per 60-second sliding window per authenticated user

### Request Body
```json
{
  "itemName": "Grilled Salmon",
  "categoryName": "Main Course",
  "price": 24.99,
  "existingDescription": "Fish dish"
}
```

### Response (200 OK)
```json
{
  "description": "Succulent Atlantic salmon, expertly grilled and served with seasonal vegetables."
}
```

### Error Responses
- 404 Not Found - Menu with given ExternalId does not exist
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - AI service failure

## Unit Tests (6 tests, all passing)
1. `Handle_MenuNotFound_ReturnsNotFound` - Menu not found returns NotFound result
2. `Handle_AiServiceReturnsError_PropagatesError` - AI error propagates correctly
3. `Handle_Success_ReturnsGeneratedDescription` - Happy path returns description
4. `Handle_WithExistingDescription_PassesItToAiService` - Existing description forwarded
5. `Handle_WithNullPrice_PassesNullPriceToAiService` - Null price handled correctly
6. `Handle_CancellationRequested_PropagatesCancellation` - Cancellation token works

## Tilt Verification Results
- [x] `onlinemenu-lint` - PASSED
- [x] `onlinemenu-yagni` - PASSED
- [x] `onlinemenu-unit-tests` - PASSED
- [x] `onlinemenu-api` - PASSED (container rebuilt successfully)

## Success Criteria

- [x] Endpoint POST /TenantMenus/{ExternalId:guid}/generate-description works
- [x] Rate limited to 20 requests per 60-second sliding window per user
- [x] Admin role required
- [x] Menu existence verified before calling AI
- [x] Result<T> pattern used throughout
- [x] Unit tests pass for handler (happy path, not found, AI error, edge cases)
- [x] All Tilt checks pass (lint, YAGNI, unit tests, API build)
