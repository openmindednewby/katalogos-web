# Component Showcase / Documentation

## Status: COMPLETED

## Problem Statement
The BaseClient codebase has a growing library of reusable shared components spread across multiple directories. There was no central documentation or interactive reference for developers to discover these components, understand their props, and see usage examples.

## Approach: Option C (In-App Screen + Markdown Docs)
1. **In-app showcase screen** at `/showcase/components` gated behind `enableThemeEditor` feature flag
2. **Markdown documentation** at `BaseClient/docs/component-library/` with one file per category

### Rationale
- The in-app screen lets developers see live, themed components with real prop combinations
- Markdown docs provide a searchable, offline-browsable reference with props tables
- Built on existing showcase infrastructure (`ShowcaseLayout`, `FeatureGate`, routes pattern)

## Components Documented (27 total)

### Layout (6)
- Section, Heading, Title, PageHeaderWithActions, ActionRow (core), ModalShell

### Inputs & Forms (6)
- Checkbox, ChoicePill, FormField, FormSwitch, ChipSelector, FormActions

### Buttons (4)
- Button (core, 5 variants, 3 sizes), SaveButton, CancelButton, ActionRow (Buttons)

### Feedback (4)
- ConfirmDialog, ApiErrorModal, LoadingFallback, PageSkeleton

### Data Display (5)
- StatusBadge, GenericStatusBadge, Tabs, EmptyListState, PaginatedList

### Icons & Branding (2)
- SvgIcon (26 sample icons displayed), TenantLogo

### Utility (4) -- documented in markdown only (non-visual)
- FeatureGate, ErrorBoundary, PlaceholderPage, SEOHead

## How to Access
- **Live showcase**: Navigate to `/showcase/components` (requires `enableThemeEditor` feature flag)
- **Markdown docs**: Browse `BaseClient/docs/component-library/`

## Files Created
- `app/(protected)/showcase/components.tsx` -- route file
- `src/features/showcase/pages/ComponentShowcasePage/index.tsx` -- main page
- `src/features/showcase/pages/ComponentShowcasePage/ComponentCard.tsx` -- card wrapper
- `src/features/showcase/pages/ComponentShowcasePage/styles.ts` -- CSS injection
- `src/features/showcase/pages/ComponentShowcasePage/sections/LayoutSection.tsx`
- `src/features/showcase/pages/ComponentShowcasePage/sections/InputsSection.tsx`
- `src/features/showcase/pages/ComponentShowcasePage/sections/ButtonsSection.tsx`
- `src/features/showcase/pages/ComponentShowcasePage/sections/FeedbackSection.tsx`
- `src/features/showcase/pages/ComponentShowcasePage/sections/DataDisplaySection.tsx`
- `src/features/showcase/pages/ComponentShowcasePage/sections/IconsBrandingSection.tsx`
- `docs/component-library/README.md` -- index
- `docs/component-library/layout.md`
- `docs/component-library/inputs.md`
- `docs/component-library/buttons.md`
- `docs/component-library/feedback.md`
- `docs/component-library/data-display.md`
- `docs/component-library/icons-branding.md`
- `docs/component-library/utility.md`

## Files Modified
- `src/navigation/routes.ts` -- added `SHOWCASE_COMPONENTS` route
- `src/localization/locales/en.json` -- added 80+ showcase translation keys, `common.save`
- `src/config/routePreloader.ts` -- added showcase/components preload

## Verification Results
- frontend-lint-fix: PASS
- frontend-yagni: PASS
- frontend-unit-tests: PASS
- frontend-prod-build: PASS

## Future Improvements
- Add interactive prop controls (knobs) for each component demo
- Add code snippet display alongside each live demo
- Add dark/light theme toggle within the showcase
- Document the native form field components (FormNativeInput, etc.)
- Add component usage frequency analytics
