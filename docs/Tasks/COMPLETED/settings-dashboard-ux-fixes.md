# Settings & Dashboard UX Fixes

## Problem Statement
Multiple HIGH and MEDIUM UX issues across Settings pages and systemic patterns:
- Settings hub missing nav cards (5 missing)
- Inconsistent save buttons (raw TouchableOpacity vs core Button)
- ExperimentListScreen uses deprecated hook and deviates from design system
- Create experiment modal requires raw menu ID (should be dropdown)
- Experiment detail back button styling
- Settings section card padding too small
- Inconsistent error states
- No active route highlighting in sidebar
- Dashboard single-column on desktop
- Redundant dark mode controls in Topbar
- Topbar accountText hardcoded white
- SkipNavLink hardcoded colors

## Files to Modify
1. `src/components/Settings/AccountSettingsHub/AccountSettingsHubScreen.tsx` - Add 5 missing nav cards
2. `src/components/Settings/WhiteLabelSettings/components/WhiteLabelSettingsScreen.tsx` - Replace raw save button
3. `src/components/Experiments/ExperimentListScreen.tsx` - useTheme, core Button
4. `src/components/Experiments/components/CreateExperimentModal.tsx` - Button + menu dropdown
5. `src/components/Experiments/components/ExperimentDetailView.tsx` - Back button ghost variant
6. `src/components/Settings/LocationSettings/components/LocationSettingsScreen.tsx` - Button component
7. `src/components/Settings/BusinessProfileSettings/components/BusinessProfileSettingsScreen.tsx` - Fix error color
8. `src/components/Sidebar/Sidebar.tsx` - Active route highlighting
9. `src/features/dashboard/components/DashboardCards.tsx` - Desktop row layout
10. `src/components/Topbar/Topbar.tsx` - Remove dark mode switch, fix accountText
11. `src/theme/utils/layoutTopbar.ts` - Replace hardcoded white
12. `src/theme/utils/layoutForms.ts` - Increase sectionCard padding
13. `src/components/Shared/SkipNavLink.tsx` - Replace hardcoded colors
14. `src/localization/locales/en.json` - Add new translation keys
15. `src/shared/testIds/accountHubTestIds.ts` - Add new testIds

## Success Criteria
- All 12 issues resolved
- All text via FM()
- All interactive elements have testID + accessibilityLabel + accessibilityHint
- No hardcoded colors
- No magic numbers
- Lint, unit tests, build pass via Tilt MCP
