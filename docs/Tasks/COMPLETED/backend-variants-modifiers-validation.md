# Task: FluentValidation for Variants & Modifiers (Phase 6)

## Status: COMPLETED
## Created: 2026-03-18
## Completed: 2026-03-18
## Parent Task: item-variants-modifiers.md

---

## Problem Statement

The domain model for item variants and modifiers was added in Phase 1 (VariantGroup, Variant, ModifierGroup, Modifier classes in TenantMenusAggregate.cs). The UpdateTenantMenus endpoint accepts these structures as part of MenuContents JSON, but there was no server-side validation ensuring data integrity. Malformed or abusive payloads could create invalid menu data.

## Implementation

### Validator Changes (`Update.Validator.cs`)

Extended `UpdateTenantMenusValidator` with nested validation for MenuContents -> Categories -> Items -> VariantGroups/ModifierGroups.

Created 4 child validators:
- **VariantGroupValidator**: name required (max 200), at least 1 variant, MinSelections >= 0, MaxSelections >= MinSelections when set, max 50 variants per group
- **VariantValidator**: name required (max 200), price >= 0
- **ModifierGroupValidator**: name required (max 200), MinSelections >= 0, MaxSelections >= MinSelections when set, max 50 modifiers per group
- **ModifierValidator**: name required (max 200), PriceAdjustment has no constraints (negative = discount)

Added `MenuValidationLimits` constants class:
- MaxVariantGroupsPerItem = 10
- MaxVariantsPerGroup = 50
- MaxModifierGroupsPerItem = 10
- MaxModifiersPerGroup = 50

### Unit Tests

Added 28 new tests to `UpdateTenantMenusValidatorTests.cs` covering integration scenarios through the parent validator.

Created `VariantModifierValidatorTests.cs` with 4 test classes testing child validators in isolation:
- VariantGroupValidatorTests (14 tests)
- VariantValidatorTests (8 tests)
- ModifierGroupValidatorTests (14 tests)
- ModifierValidatorTests (8 tests)

### Files Modified
- `OnlineMenu.Web/TenantMenus/Update.Validator.cs` - Added variant/modifier validation rules + child validators + limits constants
- `OnlineMenu.UnitTests/Validators/UpdateTenantMenusValidatorTests.cs` - Added 28 integration tests
- `OnlineMenu.UnitTests/Validators/VariantModifierValidatorTests.cs` - New file with 44 isolated child validator tests

## Verification Results

- [x] onlinemenu-yagni: PASSED (no unused code)
- [x] onlinemenu-unit-tests: PASSED (491 total tests, 0 failures)
- [x] onlinemenu-lint: Pre-existing failures only (MenuTemplateConfiguration.cs, MenuTemplate.cs, migration file) -- no issues in changed files
