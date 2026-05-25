# Fix Hardcoded Color Values in Feature Pages

## Status: TODO
## Priority: MEDIUM
## Domain: SyncfusionThemeStudio (Frontend)

## Problem
Several feature page components use hardcoded hex color values instead of theme CSS variables or Tailwind utility classes. This breaks theme switching and violates the "no hardcoded color literals" code standard.

## Affected Files

### AlertKpiCards.tsx (alerts-incidents)
- `#EF4444` (red) for trend increase
- `#10B981` (green) for trend decrease
- `#7B7B7B` (gray) for neutral
- Additional hardcoded hex values for dark mode variants
- Path: `src/features/alerts-incidents/pages/AlertsManagementPage/components/AlertKpiCards.tsx`

### LoginBackground.tsx (auth)
- `#0B2535` background color
- `#0E3A4A`, `#155A6E` SVG stroke colors
- Path: `src/features/auth/pages/LoginPage/components/LoginBackground.tsx`

### LoginFormPanel.tsx (auth)
- `#005368` (input label color)
- `#fff` (input background)
- `#00B5E2` (focus border color)
- `#006D87` (button primary bg)
- `#005368` (button hover bg)
- Path: `src/features/auth/pages/LoginPage/components/LoginFormPanel.tsx`

## Tasks
- [ ] Replace AlertKpiCards hardcoded colors with semantic Tailwind classes (text-error-500, text-success-500, text-muted)
- [ ] Replace LoginBackground colors with CSS variables from the theme system
- [ ] Replace LoginFormPanel CSS variable overrides with theme-aware values
- [ ] Verify all replacements work in both light and dark mode
- [ ] Run visual-qa to confirm no visual regressions

## Code Standard
Per CLAUDE.md: "No hardcoded color literals (use theme or constants)"
