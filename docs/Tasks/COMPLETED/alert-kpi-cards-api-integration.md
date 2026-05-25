# Alert KPI Cards: API Integration + Figma Design + Drag & Drop

## Status: IN PROGRESS
**Created**: 2026-02-25
**Domain**: SyncfusionThemeStudio (Frontend)

## Objective
Replace hardcoded KPI card data with API-fetched data, match Figma design, and add drag-and-drop reordering.

## Files Modified
- `SyncfusionThemeStudio/src/features/alerts-incidents/pages/AlertsManagementPage/components/AlertKpiCards.tsx` — Major rewrite
- `SyncfusionThemeStudio/src/localization/locales/en.json` — Add i18n keys for trend labels

## Changes
1. **API Integration**: Use `useMockServerWebAlertsGetIndicators` hook to fetch real indicator data
2. **Figma Design**: Card dimensions (222px min-width, 90px height), dark background (#262C39), border (#39404B), typography per spec
3. **Trend Indicators**: Red up arrow for increase, green down arrow for decrease, gray dash for stable
4. **Drag & Drop**: HTML5 DnD for card reordering (no library)
5. **Loading State**: Skeleton cards with animate-pulse
6. **i18n**: Add `kpiIncrease` and `kpiDecrease` translation keys

## Verification
- 8 cards load from API with correct values
- Card styling matches Figma
- Trend indicators display correctly
- Drag and drop reorders cards
- quality-gate + code-reviewer pass
