# GDPR Phase 1: Cookie Consent Banner + Legal Pages

## Problem Statement
The BaseClient web app needs GDPR compliance features: a cookie consent banner that appears on all pages, plus Privacy Policy and Terms of Service pages accessible via public routes.

## Implementation Plan

### Files Created
1. `src/shared/testIds/legalTestIds.ts` - TestIDs for all GDPR components
2. `src/components/CookieConsent/CookieConsentTypes.ts` - Consent model types
3. `src/components/CookieConsent/hooks/useCookieConsent.ts` - Hook for reading/writing consent
4. `src/components/CookieConsent/hooks/useCookieConsent.test.ts` - Unit tests for the hook
5. `src/components/CookieConsent/CookieConsentBanner.tsx` - The banner component
6. `src/components/CookieConsent/components/ConsentButton.tsx` - Reusable button sub-component
7. `src/components/Legal/PrivacyPolicyModal.tsx` - Privacy policy content
8. `src/components/Legal/TermsOfServiceModal.tsx` - Terms of service content
9. `src/components/Legal/components/LegalSection.tsx` - Reusable section sub-component
10. `src/components/Auth/LoginFooterLinks.tsx` - Footer links extracted from login page
11. `app/public/privacy.tsx` - Route wrapper for privacy page
12. `app/public/terms.tsx` - Route wrapper for terms page

### Files Modified
1. `src/navigation/routes.ts` - Added PRIVACY_POLICY and TERMS_OF_SERVICE routes
2. `src/shared/constants/index.ts` - Added STORAGE_KEYS.COOKIE_CONSENT
3. `src/shared/testIds.ts` - Imported and spread LegalTestIds
4. `src/localization/locales/en/core.json` - Added cookieConsent and legal i18n strings
5. `app/_layout.tsx` - Added CookieConsentBanner to root layout after AuthProvider
6. `app/(auth)/login.tsx` - Added LoginFooterLinks component

### Follow-up Changes (2026-03-13)
- Added Essential/Necessary cookie toggle (disabled, always-on) to CookieConsentBanner customize section
- Added `COOKIE_CONSENT_ESSENTIAL_TOGGLE` testID to legalTestIds.ts
- Added `essentialToggleHint` translation key to core.json and en.json

## Verification Results
- [x] `frontend-lint-fix` - PASSED
- [x] `frontend-yagni` - PASSED
- [x] `frontend-unit-tests` - PASSED
- [x] `frontend-prod-build` - PASSED

## Status: COMPLETED
All checklist items verified and passing.
