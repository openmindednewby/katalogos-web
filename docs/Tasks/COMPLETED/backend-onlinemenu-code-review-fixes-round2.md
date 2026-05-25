# Backend: OnlineMenu Code Review Fixes (Round 2)

## Status: COMPLETED

## Problem Statement
Fix 4 code review issues in OnlineMenuService:
1. **Issue 2 (HIGH)**: Frontend/backend contract mismatch for CreateExperiment - make VariantAMenuId optional (default to MenuId), accept VariantBConfig as object or string
2. **Issue 3 (HIGH)**: UTF-8 BOM missing on new C# files
3. **Issue 4 (MEDIUM)**: Create.cs returns 404 on failure but should use proper Result status discrimination
4. **Issue 5 (MEDIUM)**: Prompt injection vulnerability in AnthropicNutritionService - user input interpolated directly into prompt

## Affected Services
- OnlineMenu

## Changes Made

### Issue 2: Frontend/backend contract mismatch (Create.cs + Create.Validator.cs)
- Changed `VariantBConfig` from `string` to `JsonElement` in `CreateExperimentRequest` to accept both JSON objects and JSON strings from the frontend
- Handler checks `ValueKind` -- if string, uses `GetString()`; otherwise uses `GetRawText()` to serialize the object
- `VariantAMenuId` remains as `Guid` (default `Guid.Empty`) but handler defaults it to `MenuId` when empty
- Removed `NotEmpty` validator rule for `VariantAMenuId` (now optional)
- Updated validator for `VariantBConfig` to use `Must()` with `JsonValueKind` checks instead of `NotEmpty()`

### Issue 3: UTF-8 BOM
- Verified all .cs files across all feature directories (ExperimentAggregate, Experiments, Ai, ImportMenu, GenerateNutrition, and all test files) already have UTF-8 BOM
- No changes needed

### Issue 4: Improper error handling in Create.cs
- Replaced `await Send.NotFoundAsync(ct)` with `ThrowError(result.Errors.FirstOrDefault() ?? "Failed to create experiment.", StatusCodes.Status500InternalServerError)`
- Consistent with other endpoints in the codebase (Locations/Create.cs, DietaryTags/Create.cs, Translations/Translate.cs, etc.)

### Issue 5: Prompt injection in AnthropicNutritionService.cs
- Wrapped user-provided `itemName` and `ingredients` in XML delimiters (`<dish_name>`, `<ingredients>`) per Anthropic's recommended practice
- Updated corresponding unit test `BuildUserMessage_IncludesItemNameAndIngredients` to assert XML delimiter presence
- AnthropicMenuImportService does NOT interpolate user text (only binary image data and hardcoded prompt text) -- no change needed

## Files Modified
1. `OnlineMenu.Web/Experiments/Create.cs` - Issues 2 + 4
2. `OnlineMenu.Web/Experiments/Create.Validator.cs` - Issue 2
3. `OnlineMenu.Infrastructure/Ai/AnthropicNutritionService.cs` - Issue 5
4. `OnlineMenu.UnitTests/Infrastructure/Services/AnthropicNutritionServiceTests.cs` - Issue 5 test update

## Verification Results
- [x] onlinemenu-lint: PASS
- [x] onlinemenu-yagni: PASS
- [x] onlinemenu-unit-tests: PASS
- [x] onlinemenu-api: PASS (container rebuilt successfully)
- [x] All .cs files have UTF-8 BOM (verified, already present)
