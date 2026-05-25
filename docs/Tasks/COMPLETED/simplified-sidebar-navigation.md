# Simplified Sidebar Navigation (Phase 1.5, P0)

## Status: COMPLETED

## Problem Statement
The current sidebar had 7+ flat top-level items which was too many for a restaurant owner. Items needed to be grouped into logical expandable sections using the existing `NavExpandableItem` component.

## Implementation

### Approach
Added a `groupSidebarItems` utility that takes the flat list of sidebar items from the module registry and reorganizes them into a grouped structure. This avoids changing the module registration API -- each module still registers flat items, and the grouping happens at the sidebar rendering layer.

### Target Sidebar Structure
1. **Home** (top-level, hardcoded)
2. **Menus** (expandable group) - Online Menus (icon: forkKnife)
3. **Feedback** (expandable group) - Quiz Templates, Quiz Answers, Active Quiz (icon: memo)
4. **Settings** (expandable group) - Theme Editor (icon: settings)
5. **Admin** (expandable group, superUser only) - Tenants, Users (icon: shield)
6. **Logout** (bottom, hardcoded)

### Files Modified
- `BaseClient/src/localization/locales/en.json` - Added translation keys: `menu.menusGroup`, `menu.feedbackGroup`, `menu.settingsGroup`, `menu.adminGroup`
- `BaseClient/src/shared/testIds/navTestIds.ts` - Added test IDs: `NAV_GROUP_MENUS`, `NAV_GROUP_FEEDBACK`, `NAV_GROUP_SETTINGS`, `NAV_GROUP_ADMIN`
- `BaseClient/src/components/Sidebar/Sidebar.tsx` - Now calls `groupSidebarItems()` before rendering; existing `NavExpandableItem` renders the groups
- `BaseClient/src/components/Sidebar/MobileSidebarCollapsed.tsx` - Uses grouped items; group icons shown in collapsed mode, tapping a group opens the full sidebar

### New Files
- `BaseClient/src/components/Sidebar/utils/groupSidebarItems.ts` - Pure function mapping flat items to grouped structure (107 lines)
- `BaseClient/src/components/Sidebar/utils/groupSidebarItems.test.ts` - 10 unit tests covering all grouping scenarios (151 lines)

## Success Criteria
- [x] Sidebar items are grouped into expandable sections
- [x] NavExpandableItem is used for groups
- [x] Mobile sidebar still works
- [x] All text uses FM() from localization/helpers
- [x] All interactive elements have testID + accessibilityLabel + accessibilityHint
- [x] Unit tests for grouping logic
- [x] All lint, YAGNI, tests, build pass

## Quality Gate Results
- Lint (frontend-lint-fix): PASS (no errors in changed files; pre-existing errors in other files)
- YAGNI (frontend-yagni): PASS
- Unit tests (frontend-unit-tests): PASS (234/235 suites; 1 pre-existing failure in MenuContentEditor.immutability.test.tsx)
- Prod build (frontend-prod-build): PASS

## Design Decisions
1. **Grouping at render layer** rather than module registration -- avoids breaking the module API and keeps modules decoupled from sidebar layout concerns
2. **Group order constants** (100, 200, 300, 400) provide spacing for future groups to be inserted between existing ones
3. **Mobile collapsed sidebar** shows group icons and opens the full sidebar on tap, rather than trying to show expandable sections in the narrow collapsed view
4. **All text via FM()** from `localization/helpers` -- no `t()` usage
