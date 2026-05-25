# Fix Figma Colors & Create Colors Showcase Page

## Status: IN PROGRESS

## Summary
Fix theme default colors to match Figma design exactly, update shadow values, create a Figma corrections JSON file, and build a new Colors showcase page at `/dashboard/components/colors`.

## Changes Made

### Modified Files
1. **`src/stores/theme/defaults/defaultColors.ts`** — Updated light mode: surface (250 251 252), surfaceSunken (246 246 246), borders.default (223 223 223). Updated dark mode: page (27 32 41), surface (38 44 57), surfaceElevated (57 64 75), surfaceSunken (17 19 25), borders.default (223 223 223).
2. **`src/stores/theme/defaults/defaultLayout.ts`** — Updated shadow md and lg to match Figma specs.
3. **`src/app/routes/routeSegment.ts`** — Added ComponentsColors, ComponentsColorsNative segments.
4. **`src/app/routes/routePath.ts`** — Added ComponentsColors, ComponentsColorsNative paths.
5. **`src/app/routes/routePrefix.ts`** — Added ComponentsColors prefix.
6. **`src/app/routes/lazyPages.ts`** — Added ColorsShowcase lazy import.
7. **`src/app/routes/componentShowcaseRoutes.tsx`** — Added Colors route entries.
8. **`src/components/layout/Sidebar/utils/sidebarComponentGroups.ts`** — Added Colors nav entry.
9. **`src/shared/testIds.components.ts`** — Added COLORS_SHOWCASE, NAV_COLORS_GROUP.
10. **`src/localization/locales/en.json`** — Added menu.colors, components.colorsShowcase.title/description.

### New Files
1. **`scripts/figma/data/figma-corrections/colours.json`** — Figma color extraction corrections.
2. **`src/features/components/pages/ColorsShowcase/index.tsx`** — Main Colors page.
3. **`src/features/components/pages/ColorsShowcase/components/ColorCard.tsx`** — Color card component.
4. **`src/features/components/pages/ColorsShowcase/components/ColorSection.tsx`** — Section renderer.
5. **`src/features/components/pages/ColorsShowcase/components/NeutralStrip.tsx`** — Neutral palette strip.
6. **`src/features/components/pages/ColorsShowcase/data/colorSectionsData.ts`** — All Figma section data.
