# Frontend: Starter Menu Templates

## Problem Statement
New users should be able to pick from pre-built starter menu templates (Cafe, Fine Dining, Pizzeria, Bar, Food Truck) when creating their first menu during the Welcome Wizard onboarding flow.

## Backend API (already implemented)
- `GET /MenuTemplates` -> `MenuTemplateDto[]` (ExternalId, Slug, DisplayName, Description, PreviewIcon)
- `POST /TenantMenus` now accepts optional `templateSlug` parameter

## Implementation Summary

### Files Created
- `BaseClient/src/shared/testIds/menuTemplateTestIds.ts` - Test IDs for template gallery
- `BaseClient/src/features/onlinemenus/types.ts` - MenuTemplateDto interface
- `BaseClient/src/features/onlinemenus/hooks/useMenuTemplates.ts` - React Query hook for GET /MenuTemplates
- `BaseClient/src/features/onlinemenus/hooks/useMenuTemplates.test.ts` - Unit tests for the hook
- `BaseClient/src/features/onlinemenus/components/TemplateGallery/TemplateCard.tsx` - Individual template card
- `BaseClient/src/features/onlinemenus/components/TemplateGallery/TemplateGallery.tsx` - Horizontal scrolling gallery
- `BaseClient/src/features/onlinemenus/components/TemplateGallery/templateGalleryStyles.ts` - Shared styles

### Files Modified
- `BaseClient/src/shared/testIds.ts` - Added MenuTemplateTestIds spread
- `BaseClient/src/localization/locales/en.json` - Added `onlineMenus.templates.*` keys
- `BaseClient/src/features/dashboard/hooks/useWelcomeWizard.ts` - Added selectedTemplateSlug state, CreateMenuWithTemplate type, passes templateSlug to create mutation
- `BaseClient/src/features/dashboard/hooks/useWelcomeWizard.test.ts` - Updated tests for templateSlug in payload, added template selection test
- `BaseClient/src/features/dashboard/components/WizardStepContent.tsx` - Step3Content renders TemplateGallery above inputs

### Key Design Decisions
- `MenuTemplateDto` defined in `features/onlinemenus/types.ts` (not auto-generated models, since Orval hasn't regenerated yet)
- `CreateMenuWithTemplate` extends `CreateTenantMenusRequest` to add `templateSlug` without modifying auto-generated types
- `TemplateCard` uses `isBlank` boolean prop instead of null slug to avoid ESLint `no-null-check` vs `no-unsafe-call` conflict
- `TemplateGallery` uses `isNullOrUndefined()` for blank selection detection
- All text uses `FM()` from localization/helpers

## Verification Results
- [x] Lint: PASSED (only pre-existing errors in AiDescriptionButton.tsx remain)
- [x] YAGNI: PASSED
- [x] Unit Tests: PASSED (232 suites, 2965 tests)
- [x] Production Build: PASSED

## Status
- Started: 2026-03-18
- Completed: 2026-03-18
