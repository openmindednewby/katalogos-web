# Fix Custom Domains & SEO Code Review Issues

## Problem Statement
Five code review issues found in the Custom Domains and SEO frontend code need fixing:
- Issue 2: Manual API calls instead of generated hooks in `useCustomDomain.ts`
- Issue 3: Magic numbers in `DnsInstructions.tsx`
- Issue 4: Hardcoded `APP_BASE_URL` in `[id].tsx`
- Issue 5: Duplicate accessibility label/hint in `DnsInstructions.tsx`
- Issue 6: Component structure order in `CustomDomainSettingsScreen.tsx`

## Implementation Plan

### Issue 2 - Manual API calls
No auto-generated hooks exist for Custom Domains (swagger spec doesn't include them yet). Add TODO comments explaining why manual `customInstance` approach is used and how to swap to generated hooks later.

### Issue 3 - Magic numbers
Add `LABEL_MARGIN_BOTTOM` and `COPY_BUTTON_MARGIN_LEFT` constants to `CustomDomainSettings/constants.ts`. Import and use in `DnsInstructions.tsx`.

### Issue 4 - Hardcoded APP_BASE_URL
Add `APP_BASE_URL` to `environment.ts` config for all environments. Import in `[id].tsx`.

### Issue 5 - Duplicate a11y label/hint
Add `copyCnameLabel` and `copyTxtLabel` keys to `en.json`. Update copy buttons to use distinct label and hint.

### Issue 6 - Hook ordering
Reorder hooks in `CustomDomainSettingsScreen.tsx`: TanStack Query first, then local state, then other hooks, then derived values.

## Files to Modify
- `src/lib/hooks/customDomain/hooks/useCustomDomain.ts`
- `src/components/Settings/CustomDomainSettings/constants.ts`
- `src/components/Settings/CustomDomainSettings/components/DnsInstructions.tsx`
- `src/config/environment.ts`
- `app/public/menu/[id].tsx`
- `src/localization/locales/en.json`
- `src/components/Settings/CustomDomainSettings/components/CustomDomainSettingsScreen.tsx`

## Success Criteria
- All five issues resolved
- Lint passes
- Unit tests pass
- Build succeeds
