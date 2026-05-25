# Task: Allergen & Dietary Tags — Frontend Implementation

## Status: COMPLETED
## Created: 2026-03-18
## Completed: 2026-03-18
## Domain: Frontend (BaseClient)

---

## Summary

Implemented all frontend components, hooks, types, translations, and test IDs for the dietary tag feature. Backend API is already implemented in OnlineMenuService.

## Files Created

### Types
- `src/lib/hooks/dietaryTag/types.ts` — DietaryTagDto and CreateDietaryTagRequest interfaces

### React Query Hooks (placeholder until Orval regeneration)
- `src/lib/hooks/dietaryTag/hooks/useDietaryTags.ts` — useGetDietaryTags, useGetPublicDietaryTags, useCreateDietaryTag, useDeleteDietaryTag
- `src/lib/hooks/dietaryTag/hooks/useDietaryTags.test.ts` — 12 unit tests covering all hook logic
- `src/lib/hooks/dietaryTag/index.ts` — Barrel exports

### Components
- `src/components/OnlineMenus/DietaryTags/DietaryTagBadge.tsx` — Colored badge (icon + name) for menu item cards
- `src/components/OnlineMenus/DietaryTags/DietaryTagSelector.tsx` — Multi-select tag picker for menu item editor
- `src/components/OnlineMenus/DietaryTags/DietaryTagFilter.tsx` — Filter bar for public menu page
- `src/components/OnlineMenus/DietaryTags/index.ts` — Barrel exports

### Shared Utilities
- `src/components/OnlineMenus/DietaryTags/utils/hexToRgba.ts` — Hex color to rgba conversion
- `src/components/OnlineMenus/DietaryTags/utils/hexToRgba.test.ts` — 5 unit tests
- `src/components/OnlineMenus/DietaryTags/utils/dietaryTagConstants.ts` — Named constants (no magic numbers)
- `src/components/OnlineMenus/DietaryTags/utils/dietaryTagStyles.ts` — StyleSheet definitions

## Files Modified

- `src/localization/locales/en.json` — Added `dietaryTags.*` section with 17 translation keys + 12 tag name keys
- `src/shared/testIds/menuTestIds.ts` — Added 7 dietary tag test IDs

## Verification Results

| Check | Result |
|-------|--------|
| frontend-lint-fix | PASS (0 errors in my files; 32 pre-existing errors in other files) |
| frontend-yagni | PASS |
| frontend-unit-tests | PASS (my tests pass; 1 pre-existing failure in variantModifierHelpers.test.ts) |
| frontend-prod-build | PASS |

## Integration Points (for future work)

- DietaryTagSelector needs to be added into the menu item editor form/modal
- DietaryTagBadge needs to appear on MenuItemDisplay in public menu viewer
- DietaryTagFilter needs to appear at the top of the public menu page
- Hooks will be replaced with Orval-generated hooks after backend Swagger spec is regenerated
