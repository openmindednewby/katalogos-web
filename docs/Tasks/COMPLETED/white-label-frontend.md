# White-Label Frontend Integration

> **Status**: COMPLETED
> **Priority**: P2
> **Created**: 2026-03-21
> **Completed**: 2026-03-21
> **Parent**: white-label-service.md (Phase 1 backend DONE)

---

## Problem Statement

The backend foundation for white-label is complete -- ThemeConfigJson already has 8 white-label fields (customLogoUrl, customFaviconUrl, customCss, headerHtml, footerHtml, showPoweredBy, companyName, supportEmail). BrandedEmailTemplateRenderer is done. What's needed is:

1. A **settings UI** (`/settings/white-label`) for admins to configure white-label fields -- **DONE** (pre-existing)
2. **Runtime application** of white-label config on public menu pages -- **DONE**
3. **Feature gating** to Enterprise tier via `useSubscription` -- **DONE** (pre-existing)

## Implementation Summary

### Pre-existing (found already implemented)
- Settings screen: `WhiteLabelSettingsScreen` with 4 sections (Brand Identity, Appearance, Attribution, Support)
- Sub-components: `BrandIdentitySection`, `AppearanceSection`
- Hooks: `useWhiteLabelConfig` (authenticated), `useWhiteLabelMutation`, `useWhiteLabelRuntime`
- Types: `WhiteLabelConfig`, `WhiteLabelFormState`
- Test IDs, styles, constants, barrel exports
- Route, sidebar, breadcrumb, route preloader
- Translation keys in `en.json`
- Feature-gated to Enterprise tier
- Unit tests for `toWhiteLabelConfig`, `toApiPayload`, `injectCustomCss`, `removeCustomCss`

### New Work (this session)

#### Step A: Public white-label config hook
- Created `usePublicWhiteLabelConfig` -- accepts tenantId parameter directly (no Redux dependency)
- Backend `GET /tenants/{tenantId}/theme` is `AllowAnonymous`, works for unauthenticated public pages
- Shares `toWhiteLabelConfig` mapping with the authenticated variant

#### Step B: Favicon injection
- Added `injectFavicon()` and `removeFavicon()` to `useWhiteLabelRuntime`
- Manages a `<link id="white-label-favicon" rel="icon">` tag in document head
- Cleanup on unmount

#### Step C: Public menu runtime integration
- Integrated into `app/public/menu/[id].tsx` (public menu viewer)
- Integrated into `app/public/menu/embed/[id].tsx` (embedded menu widget)
- Both pages now:
  - Inject custom CSS via `<style>` tag
  - Inject custom favicon via `<link>` tag
  - Render custom header HTML (`WhiteLabelHeader` component)
  - Render custom footer HTML (`WhiteLabelFooter` component)
  - Use white-label `customLogoUrl` for SEO/meta tags (falls back to business profile logo)
  - Control watermark: `shouldShowWatermark = tierWatermark && showPoweredBy`

#### Step D: Extracted `MenuDisplayView` component
- Moved the `MenuDisplay` inline component from `[id].tsx` to `src/components/PublicMenu/components/MenuDisplayView.tsx`
- Reduces route file to under 200 lines (lint max-lines compliance)
- Uses local `PublicMenuData` interface instead of importing `PublicMenuDto` (avoids product-import-in-shared lint violation)

#### Step E: Unit tests
- Added tests for `injectFavicon`, `removeFavicon` (create, update, remove, null/empty handling)
- Added tests for `usePublicWhiteLabelConfig` (field mapping, defaults)

#### Step F: Pre-existing lint fixes
- Fixed complex condition in `app/(protected)/menus/index.tsx` (extracted named variable)
- Fixed inline hook arg warning in `MenuContentView.tsx` (eslint-disable for false positive on memoized value)

## Files Created
- `src/hooks/whiteLabel/hooks/usePublicWhiteLabelConfig.ts`
- `src/hooks/whiteLabel/hooks/usePublicWhiteLabelConfig.test.ts`
- `src/components/PublicMenu/components/WhiteLabelHeader.tsx`
- `src/components/PublicMenu/components/WhiteLabelFooter.tsx`
- `src/components/PublicMenu/components/MenuDisplayView.tsx`

## Files Modified
- `src/hooks/whiteLabel/hooks/useWhiteLabelRuntime.ts` -- added favicon injection, refactored hook into smaller functions
- `src/hooks/whiteLabel/hooks/useWhiteLabelRuntime.test.ts` -- added favicon injection tests
- `src/shared/testIds/whiteLabelTestIds.ts` -- added WHITE_LABEL_HEADER, WHITE_LABEL_FOOTER
- `app/public/menu/[id].tsx` -- integrated white-label runtime, extracted MenuDisplay to separate file
- `app/public/menu/embed/[id].tsx` -- integrated white-label runtime
- `app/(protected)/menus/index.tsx` -- fixed complex condition lint error
- `src/components/PublicMenu/components/MenuContentView.tsx` -- fixed hook arg warning

## Quality Checks (all via Tilt MCP)
- [x] `frontend-lint-fix` -- PASSED
- [x] `frontend-yagni` -- PASSED
- [x] `frontend-unit-tests` -- PASSED
- [x] `frontend-prod-build` -- PASSED

## Success Criteria
- [x] White-label settings page accessible at `/settings/white-label`
- [x] All fields save via existing theme API
- [x] Feature-gated to Enterprise tier
- [x] Runtime hook applies custom CSS on public pages
- [x] Runtime hook applies custom favicon on public pages
- [x] Custom header/footer HTML renders on public pages
- [x] Watermark visibility respects white-label showPoweredBy config
- [x] All text via FM(), no hardcoded strings
- [x] All interactive elements have testID + a11y
- [x] Unit tests pass
- [x] Lint clean
- [x] Build succeeds
