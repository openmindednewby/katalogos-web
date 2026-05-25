# Public Menu Business Profile Integration

**Status: COMPLETED**

## Problem Statement

The public menu DTO now includes `tenantId`. Wire the business profile data from the Identity
service into the public menu page so customers can see the restaurant's address, phone, hours, etc.

## Changes Made

### 1. Regenerated OnlineMenu Orval hooks
- Updated `src/server/swagger/onlinemenu.json` to add `tenantId` field to `TenantMenusDto`
- Ran `npx orval --config orval.config.js --project onlineMenuApi`
- Verified `TenantMenusDtoAllOf` now includes `tenantId?: string | null`

### 2. Created custom hook for public business profile
- **New file**: `src/server/customHooks/usePublicBusinessProfile.ts`
- Uses `get()` with `withToken: false` and `withCredentials: false` (no auth needed)
- Accepts `tenantId: string | null | undefined`, only fetches when valid
- 10-minute stale time for caching

### 3. Added translation keys
- Added `publicMenu.businessInfo.*` keys to `src/localization/locales/en.json`
- Reuses existing `settings.businessProfile.days.*` keys for day names

### 4. Added testIDs
- Added 6 new testIDs to `src/shared/testIds/menuTestIds.ts`:
  - `PUBLIC_MENU_BUSINESS_INFO`, `PUBLIC_MENU_BUSINESS_PHONE`, `PUBLIC_MENU_BUSINESS_EMAIL`
  - `PUBLIC_MENU_BUSINESS_WEBSITE`, `PUBLIC_MENU_BUSINESS_ADDRESS`, `PUBLIC_MENU_BUSINESS_HOURS`

### 5. Created BusinessInfoSection component
- **New file**: `src/components/PublicMenu/components/BusinessInfoSection.tsx`
- Displays phone (clickable tel: link), email (mailto: link), website link, address, hours
- All text via FM(), all interactive elements have testID + a11y labels/hints
- Renders nothing when profile has no displayable info

### 6. Created helper utilities
- **New file**: `src/components/PublicMenu/utils/businessInfoHelpers.ts`
- `formatAddress()`, `parseOperatingHours()`, `hasDisplayableInfo()`, `isNonEmpty()`

### 7. Updated PublicMenuViewerPage (app/public/menu/[id].tsx)
- Extracts `tenantId` from menu query response
- Fetches business profile via `usePublicBusinessProfile(tenantId)`
- Passes profile data to `SeoHead` (with restaurantName and logoUrl) and `MenuContentView`

### 8. Updated EmbedMenuPage (app/public/menu/embed/[id].tsx)
- Same pattern: extracts `tenantId`, fetches profile, passes to `MenuContentView`

### 9. Updated MenuContentView
- Accepts optional `businessProfile` prop
- Renders `BusinessInfoSection` below menu categories, above share button

### 10. Enhanced meta tags
- Updated `menuMetaTags.ts` to include cuisine type in meta description
- e.g., "Great food - Italian - Springfield, IL"

### 11. Structured data (already wired)
- `SeoHead` already accepted `businessProfile` and passed to `generateMenuJsonLd`
- Now receives business profile data from page, producing PostalAddress, telephone, etc.

## Unit Tests
- **New**: `src/server/customHooks/usePublicBusinessProfile.test.ts` - tests hook enable/disable logic
- **New**: `src/components/PublicMenu/utils/businessInfoHelpers.test.ts` - tests helpers
- **Updated**: `src/components/PublicMenu/utils/menuMetaTags.test.ts` - added cuisine type test

## Verification Results
- frontend-lint-fix: PASS
- frontend-yagni: PASS
- frontend-unit-tests: PASS
- frontend-prod-build: PASS
