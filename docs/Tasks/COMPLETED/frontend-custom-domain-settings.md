# Frontend: Custom Domain Settings Screen

## Problem Statement
Restaurant owners need a settings screen to add, verify, and manage a custom domain for their public menu page. The backend endpoints will be created separately; this task creates the UI shell with placeholder hooks.

## Implementation Plan

### Files Created
1. `app/(protected)/settings/custom-domain.tsx` - Route page (thin wrapper)
2. `src/components/Settings/CustomDomainSettings/index.ts` - Barrel export
3. `src/components/Settings/CustomDomainSettings/constants.ts` - Named constants
4. `src/components/Settings/CustomDomainSettings/components/CustomDomainSettingsScreen.tsx` - Main screen
5. `src/components/Settings/CustomDomainSettings/components/AddDomainForm.tsx` - Domain input form
6. `src/components/Settings/CustomDomainSettings/components/DomainStatusBadge.tsx` - Status badge
7. `src/components/Settings/CustomDomainSettings/components/DnsInstructions.tsx` - DNS record instructions
8. `src/components/Settings/CustomDomainSettings/utils/domainValidation.ts` - Validation logic
9. `src/components/Settings/CustomDomainSettings/utils/domainValidation.test.ts` - Validation tests (16 cases)
10. `src/lib/hooks/customDomain/useCustomDomain.ts` - Placeholder hook
11. `src/lib/hooks/customDomain/enums/CustomDomainStatus.ts` - Status enum
12. `src/lib/hooks/customDomain/types.ts` - Type definitions
13. `src/lib/hooks/customDomain/index.ts` - Barrel export
14. `src/shared/testIds/customDomainTestIds.ts` - Test IDs

### Files Modified
1. `src/shared/testIds.ts` - Import and spread custom domain test IDs
2. `src/localization/locales/en.json` - Added `settings.customDomain.*` and `menu.customDomain` keys
3. `src/navigation/routes.ts` - Added CUSTOM_DOMAIN_SETTINGS route
4. `src/components/Settings/index.ts` - Export CustomDomainSettingsScreen
5. `src/config/routePreloader.ts` - Added custom-domain page preload

### Patterns Followed
- BillingSettings component structure (components/, utils/, constants.ts, index.ts)
- StatusBadge color pattern from BillingSettings
- FM() for all translations (NEVER t())
- const enum in own file (like SubscriptionStatus)
- TestIDs in dedicated file (like billingTestIds.ts)

## Lint Fixes Applied
- Extracted inline opacity to named constant DISABLED_OPACITY
- Changed Alert onPress from async callback to .then/.catch/.finally chain
- Used static variables instead of useState for placeholder isLoading/error
- Added route preload entry

## Success Criteria
- [x] All files created following established patterns
- [x] All user-facing text uses FM()
- [x] Translation keys added to en.json (33 keys under settings.customDomain + 1 under menu)
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Domain validation has comprehensive unit tests (16 test cases)
- [x] Linting passes (frontend-lint-fix: OK)
- [x] YAGNI passes (frontend-yagni: OK)
- [x] Unit tests pass (frontend-unit-tests: OK)
- [x] Production build succeeds (frontend-prod-build: OK)

## Next Steps
- Backend: Create CustomDomain endpoints (GET/POST/DELETE + POST verify)
- Frontend: Wire useCustomDomain hook to Orval-generated hooks after backend deploy
- Frontend: Add sidebar navigation entry via module registration

## Status: COMPLETED
