# Task 07: Core Layout and Navigation Components Theme Refactor

> **Status**: COMPLETE
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider - COMPLETE), 04 (default preset - COMPLETE)

---

## Problem Statement

Layout and navigation components (Sidebar, Topbar, Tabs, Section, Heading, Title, FieldLabel, PageHeaderWithActions, PaginatedList, PaginationControls, ProtectedLayout) use Pattern A (direct Redux `useSelector` for theme) and Pattern E (static `layoutStyles` + inline color override from `themePalette`). They need to consume theme via `useTheme()` for tenant branding support.

---

## Implementation Plan

### Phase 1: Convert layout style files to theme-aware generators
1. `layoutSidebar.ts` - Convert to `createSidebarStyles(colors)` generator
2. `layoutTopbar.ts` - Convert to `createTopbarStyles(colors)` generator
3. `layout.ts` - Convert to `createLayoutStyles(colors)` generator, maintain backwards compat

### Phase 2: Refactor components to use `useTheme()`
Replace `useSelector((s: RootState) => s.ui.theme)` + `theme === ThemeMode.Dark ? themePalette.dark : themePalette.light` pattern with `const { theme } = useTheme()` + `theme.colors`.

Components to refactor (in order):
1. Sidebar.tsx
2. MobileSidebarCollapsed.tsx
3. Topbar.tsx
4. MobileTopbar.tsx
5. ProtectedLayout.tsx
6. Tabs.tsx
7. Section.tsx
8. Heading.tsx
9. Title.tsx
10. FieldLabel.tsx
11. PageHeaderWithActions.tsx
12. PaginatedList.tsx (already uses useThemeColors - update to useTheme)
13. PaginationControls.tsx (already uses useThemeColors - update to useTheme)

### Phase 3: TenantLogo component
Create TenantLogo sub-component for Sidebar that shows tenant logo from branding.

---

## Key Mapping: Old palette -> New theme

| Old pattern | New pattern |
|-------------|-------------|
| `colors.surface` | `theme.colors.surface` |
| `colors.background` | `theme.colors.background` |
| `colors.text` | `theme.colors.text` |
| `colors.textSecondary` | `theme.colors.textSecondary` |
| `colors.border` | `theme.colors.border` |
| `colors.primary` | `theme.palette.primary['500']` |
| `colors.secondary` | `theme.palette.secondary['500']` |
| `colors.subtext` | `theme.colors.textSecondary` |
| `colors.textOnPrimary` | not in ThemeModeColors (keep as palette reference or constant) |

---

## Files to Modify

- `src/theme/layoutSidebar.ts`
- `src/theme/layoutTopbar.ts`
- `src/theme/layout.ts`
- `src/components/Sidebar/Sidebar.tsx`
- `src/components/Sidebar/MobileSidebarCollapsed.tsx`
- `src/components/Topbar/Topbar.tsx`
- `src/components/Topbar/MobileTopbar.tsx`
- `src/components/Layout/ProtectedLayout.tsx`
- `src/components/Shared/Tabs.tsx`
- `src/components/Shared/Section.tsx`
- `src/components/Shared/Heading.tsx`
- `src/components/Shared/Title.tsx`
- `src/components/Shared/FieldLabel.tsx`
- `src/components/Shared/PageHeaderWithActions.tsx`
- `src/components/Lists/PaginatedList.tsx`
- `src/components/Lists/PaginationControls.tsx`

## Files to Create

- `src/components/core/TenantLogo/TenantLogo.tsx`
- `src/components/core/TenantLogo/index.ts`
- `src/components/core/TenantLogo/__tests__/TenantLogo.test.ts`

---

## Success Criteria

- [x] All 13 components consume theme via `useTheme()`
- [x] No direct Redux theme access in layout/navigation components
- [x] Layout style files expose theme-aware generator functions (`createSidebarStyles`, `createTopbarStyles`, `createCoreLayoutStyles`)
- [x] TenantLogo component with fallback logic + unit tests (5 tests passing)
- [x] All existing unit tests still pass (2028/2028 pass, 1 pre-existing failure in FormNativeInput unrelated)
- [x] Lint passes (0 errors on all modified files), build succeeds

---

## Changes Made (2026-03-06)

### Already completed (from prior work):
- All 13 components already migrated to `useTheme()` from previous task iterations
- Layout style files already have theme-aware generators (`createSidebarStyles`, `createTopbarStyles`, `createCoreLayoutStyles`)
- `TenantLogo` component already existed at `src/components/core/TenantLogo/TenantLogo.tsx`

### Completed in this session:

1. **Created `TenantLogo/index.ts`** barrel export for clean imports
2. **Created `TenantLogo/TenantLogo.test.ts`** - 5 unit tests for `resolveLogoUrl` fallback logic
3. **Updated `core/index.ts`** - Added TenantLogo and resolveLogoUrl exports
4. **Refactored `Topbar.tsx`** - Replaced hardcoded Tag Heuer Image/app title with `<TenantLogo />` component, removed unused `Image`/`StyleSheet`/`env` imports, added missing `accessibilityHint`/`accessibilityLabel` on language toggle, account button, and logout button
5. **Refactored `MobileTopbar.tsx`** - Replaced hardcoded Tag Heuer Image/app title with `<TenantLogo />` component, removed unused `Image`/`env` imports, added missing `accessibilityHint`/`accessibilityLabel` on menu button, backdrop, language toggle, account button, logout button, and close button
6. **Updated `ProtectedLayout.tsx`** - Added missing `accessibilityHint`/`accessibilityLabel` on close sidebar TouchableOpacity
7. **Updated `PaginationControls.tsx`** - Added missing `accessibilityHint`/`accessibilityLabel` on PageButton component
