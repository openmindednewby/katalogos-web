# Landing Pages for Online Menus & Questionnaires

## Status: COMPLETED
## Priority: P0
## Started: 2026-03-14
## Completed: 2026-03-14

## Summary

Create dedicated landing pages for each SaaS product (Online Menus and Questionnaires), plus a lightweight brand hub at the root URL. These are the first thing visitors see — critical for conversion.

## Architecture Decisions

### Dedicated Pages Per Service (not unified)
- **Root `/`** — Lightweight brand hub with two service cards linking to dedicated pages
- **`/menus`** — Full dedicated landing page for Online Menu service
- **`/questionnaires`** — Full dedicated landing page for Questionnaire service
- **`/pricing`** — Side-by-side pricing for both services

**Rationale:** Different audiences, different value props. Focused pages convert better and rank better for SEO.

### Web vs Mobile Strategy
- **Web (browser):** Full landing pages with hero, features, pricing, CTAs
- **Mobile (iOS/Android app):** Skip landing, go straight to login/register or dashboard
- **Implementation:** `Platform.OS === 'web'` conditional at root route level
- Landing page components only load on web (tree-shaken from native bundles)

### Inside BaseClient (not separate site)
- Leverages existing theme system, i18n, auth flow, SEO infrastructure
- Expo Router's `asyncRoutes: true` ensures landing chunks don't bloat the app bundle
- Public routes already exist (`/public/*`) — landing pages follow the same pattern

## Route Changes

### New Routes
| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/index.tsx` | Brand hub (web) / redirect to auth (mobile) |
| `/menus` | `app/menus.tsx` | Online Menu service landing page |
| `/questionnaires` | `app/questionnaires.tsx` | Questionnaire service landing page |
| `/pricing` | `app/pricing.tsx` | Pricing page for both services |

### Modified Routes
| Route | Change |
|-------|--------|
| `Routes.HOME` | Renamed to `Routes.DASHBOARD`, updated 3 usages in Sidebar, MobileSidebarCollapsed, FeatureGate |

## Component Architecture (Final)

```
src/components/Landing/
  index.ts                          # Barrel exports (6 public components)
  types.ts                          # LandingFeature interface
  constants.ts                      # Layout constants
  components/
    LandingLayout.tsx               # Shared wrapper (navbar + footer + scroll)
    LandingNavbar.tsx               # Top nav: logo, links, Login/Register/Dashboard CTAs
    LandingFooter.tsx               # Footer: Products + Legal columns, copyright
    HeroSection.tsx                 # Configurable hero (title, subtitle, CTA)
    ServiceCard.tsx                 # Service showcase card (hub page)
    FeatureGrid.tsx                 # Responsive 3/2/1 column feature grid
    FeatureItem.tsx                 # Individual feature highlight card
    PricingCard.tsx                 # Pricing tier card with features checklist
    CTASection.tsx                  # Full-width call-to-action block
```

Note: `useLandingScroll.ts` hook was planned but removed as it was unused (YAGNI). `LandingLayout.tsx` was moved from root to `components/` subdirectory to satisfy `enforce-module-structure` ESLint rule.

## Verification Results

| Check | Result |
|-------|--------|
| `frontend-lint-fix` | PASS (only pre-existing `App.tsx` barrel companion error) |
| `frontend-yagni` | PASS |
| `frontend-unit-tests` | PASS |
| `frontend-prod-build` | PASS |

## Lint Fixes Applied

1. **Duplicate enum values** in routes.ts — Removed LANDING, LANDING_MENUS, LANDING_QUESTIONNAIRES, LANDING_PRICING, REGISTER entries that duplicated existing values
2. **Type assertions (`as Routes`)** — Removed all `as Routes` casts; router.push accepts strings
3. **Magic numbers** — Extracted COLUMNS_DESKTOP=3, COLUMNS_TABLET=2 in FeatureGrid
4. **Inline borderWidth styles** — Moved to StyleSheet via DEFAULT_BORDER_WIDTH constant in Navbar, Footer, PricingCard
5. **Nested ternary** — Extracted `resolveColumnWidth()` function in Footer
6. **Literal string checkmark** — Created CHECKMARK_SYMBOL constant in PricingCard
7. **File too long (208 lines)** — Condensed LandingNavbar to 136 lines
8. **enforce-module-structure** — Moved LandingLayout.tsx to components/ subdirectory
9. **Unused style** — Removed `mobileLink` style, merged into `mobileLinkText`

## Files Created

- `app/index.tsx` — Brand hub (web) / redirect (mobile)
- `app/menus.tsx` — Online Menus landing page
- `app/questionnaires.tsx` — Questionnaires landing page
- `app/pricing.tsx` — Pricing page (3 tiers)
- `src/components/Landing/index.ts` — Barrel exports
- `src/components/Landing/types.ts` — LandingFeature interface
- `src/components/Landing/constants.ts` — Layout constants
- `src/components/Landing/components/LandingLayout.tsx` — Shared layout wrapper
- `src/components/Landing/components/LandingNavbar.tsx` — Navigation bar
- `src/components/Landing/components/LandingFooter.tsx` — Footer
- `src/components/Landing/components/HeroSection.tsx` — Hero section
- `src/components/Landing/components/ServiceCard.tsx` — Service card
- `src/components/Landing/components/FeatureGrid.tsx` — Feature grid
- `src/components/Landing/components/FeatureItem.tsx` — Feature item
- `src/components/Landing/components/PricingCard.tsx` — Pricing card
- `src/components/Landing/components/CTASection.tsx` — CTA section
- `src/shared/testIds/landingTestIds.ts` — Landing test IDs
- `public/robots.txt` — SEO robots file for MenuFlow
- `public/sitemap.xml` — XML sitemap for MenuFlow

## Files Modified

- `src/navigation/routes.ts` — Renamed HOME to DASHBOARD
- `src/components/Sidebar/Sidebar.tsx` — Routes.HOME to Routes.DASHBOARD
- `src/components/Sidebar/MobileSidebarCollapsed.tsx` — Routes.HOME to Routes.DASHBOARD
- `src/components/Shared/FeatureGate.tsx` — Routes.HOME to Routes.DASHBOARD
- `src/shared/constants/index.ts` — Added DESKTOP_BREAKPOINT_PX
- `src/shared/testIds.ts` — Added LandingTestIds import and spread
- `app/+html.tsx` — Updated SEO_CONFIG for MenuFlow
- `src/components/Shared/SEOHead.tsx` — Updated DEFAULT_SEO for MenuFlow
- `src/localization/locales/en.json` — Added landing namespace translations
- `src/localization/locales/en/core.json` — Added landing namespace translations (sync-loaded)
