# E2E Tests: Sidebar Expandable Navigation

## Status: COMPLETE (pending runtime verification)

## Summary
Analyzed existing E2E tests for regressions from sidebar restructuring, and wrote new E2E tests for the expandable sidebar navigation powered by the `NavExpandableItem` component.

## Background
The sidebar has been restructured with these changes:
1. Dashboard converted from simple link to expandable section with children (Overview, Metrics A, KPIs)
2. New "Threat Detection & Analysis" expandable section with 3-level deep nesting
3. 12 new SVG icons added
4. Admin Hub sub-nav icons updated
5. ~30 new placeholder pages created
6. `NavExpandableItem` component (recursive) replaces simple nav items for expandable sections

## Key Source Files
- `src/components/Sidebar/Sidebar.tsx` - Main sidebar component
- `src/components/Sidebar/NavExpandableItem.tsx` - New recursive expandable component
- `packages/siem-module/src/index.ts` - SIEM module with sidebar item definitions
- `src/shared/testIds/navTestIds.ts` - Navigation test IDs
- `src/navigation/routes.ts` - Route definitions

## Regression Analysis
Existing E2E tests do NOT directly interact with the changed sidebar navigation:
- Logout test only touches `TestIds.LOGOUT_BUTTON` (unchanged)
- Smoke tests navigate via direct URL (`page.goto()`) not sidebar clicks
- No existing tests use `nav-dashboard`, `nav-threat-detection`, or any expandable nav testIds
- **Conclusion**: No regressions expected from existing tests

## Files Created / Modified
- **NEW** `E2ETests/pages/SidebarPage.ts` - Page object for sidebar expandable navigation (170 lines)
- **NEW** `E2ETests/tests/navigation/sidebar-expandable.spec.ts` - 20 E2E tests (x3 browsers = 60) for expandable sidebar
- **MODIFIED** `E2ETests/pages/index.ts` - Added SidebarPage export
- **MODIFIED** `E2ETests/playwright.config.ts` - Added navigation-chromium/mobile/firefox projects

## Test Coverage (20 tests x 3 browsers = 60 total)

### Dashboard Section (6 tests)
1. Render Dashboard toggle in sidebar
2. Expand Dashboard to show child items (Overview, Metrics A, KPIs)
3. Collapse Dashboard to hide child items
4. Navigate to Dashboard Overview
5. Navigate to Metrics A
6. Navigate to KPIs

### Threat Detection Section (5 tests)
7. Render Threat Detection toggle in sidebar
8. Expand Threat Detection to show direct children
9. Collapse Threat Detection to hide all children
10. Navigate to Detection Coverage
11. Navigate to Playbooks

### 3-Level Nesting: Detection Rules (2 tests)
12. Expand Detection Rules (level 2) to show TA items (level 3)
13. Navigate to TA0001 detection rule page

### 3-Level Nesting: Active Defense & Beacon Traps (3 tests)
14. Expand Active Defense (level 2) to show sub-items
15. Expand Beacon Traps (level 3) to show policies and schedules
16. Navigate to Beacon Policies page

### Identity Threat Protection (2 tests)
17. Expand Identity Threat Protection to show children
18. Navigate to Identity Forest page

### Independent Expand States (2 tests)
19. Dashboard stays expanded when Threat Detection is expanded
20. Threat Detection stays expanded when Dashboard is collapsed

## Results
- Tests compile correctly and are listed by `npx playwright test --list` (61 total including auth setup)
- Cannot execute tests locally: IdentityService not running, Tilt not available
- Recommend running via `npm run tilt:navigation` (after adding Tilt resource) or Quick Mode when services are running
