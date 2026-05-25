# Task 07: Build Core Layout and Navigation Components with Theme

> **Status**: COMPLETED (2026-03-06) — TenantLogo integrated, 5 unit tests
> **Agent**: `frontend-dev`
> **Blocked by**: 03 (ThemeProvider), 04 (default preset)
> **Blocks**: 12 (domain migration)
> **Estimated effort**: Medium

---

## Problem Statement

Layout and navigation components (Sidebar, Topbar, Tabs, etc.) use Pattern A (direct Redux) and Pattern E (layoutStyles + inline color override). They need to consume theme via `useTheme()` for tenant branding.

---

## Requirements

### Components to Refactor

| Component | Current Location | Current Pattern |
|-----------|-----------------|-----------------|
| Sidebar | `components/Sidebar/Sidebar.tsx` | layoutStyles + Redux palette |
| MobileSidebarCollapsed | `components/Sidebar/MobileSidebarCollapsed.tsx` | Responsive variant |
| Topbar | `components/Topbar/Topbar.tsx` | layoutStyles + Redux palette |
| MobileTopbar | `components/Topbar/MobileTopbar.tsx` | Responsive variant |
| Tabs | `components/Shared/Tabs.tsx` | Inline styles |
| Section | `components/Shared/Section.tsx` | Layout styles |
| Heading | `components/Shared/Heading.tsx` | Inline styles |
| Title | `components/Shared/Title.tsx` | Inline styles |
| FieldLabel | `components/Shared/FieldLabel.tsx` | Inline styles |
| PageHeaderWithActions | `components/Shared/PageHeaderWithActions.tsx` | Layout styles |
| PaginatedList | `components/Lists/PaginatedList.tsx` | Generic list |
| PaginationControls | `components/Lists/PaginationControls.tsx` | Page controls |
| ProtectedLayout | `components/Layout/ProtectedLayout.tsx` | Auth wrapper |

### Sidebar Branding
The Sidebar should display the tenant's logo (from `ResolvedTheme.branding.logoUrl`). Add a `TenantLogo` sub-component that:
- Shows the tenant logo if available
- Falls back to app name/default logo if not
- Respects the current theme mode (light/dark logo variants if available)

### Layout Styles Migration
The current `layout.ts`, `layoutSidebar.ts`, `layoutTopbar.ts` files define static StyleSheets. These should be converted to theme-aware style generators:
```typescript
// Before (static)
export const layoutStyles = StyleSheet.create({ sidebarContainer: { ... } });

// After (theme-aware)
export function createLayoutStyles(colors: ModeColors) {
  return StyleSheet.create({ sidebarContainer: { backgroundColor: colors.surface, ... } });
}
```

---

## Acceptance Criteria

- [ ] All 13 components consume theme via `useTheme()`
- [ ] No direct Redux theme access in layout/navigation components
- [ ] Sidebar displays tenant logo from theme branding
- [ ] Topbar uses tenant primary color for branding elements
- [ ] Tabs active indicator uses `palette.primary[500]`
- [ ] Layout style files converted to theme-aware generators
- [ ] Responsive variants (Mobile*) also use `useTheme()`
- [ ] Unit tests for TenantLogo fallback logic
- [ ] No visual regressions in existing layout

---

## Files to Create

- `BaseClient/src/components/core/TenantLogo/TenantLogo.tsx` - New branding component
- `BaseClient/src/components/core/TenantLogo/index.ts`

## Files to Modify

- `BaseClient/src/components/Sidebar/Sidebar.tsx` - Use `useTheme()` instead of Redux
- `BaseClient/src/components/Topbar/Topbar.tsx` - Use `useTheme()` instead of Redux
- `BaseClient/src/components/Shared/Tabs.tsx` - Use `useTheme()`
- `BaseClient/src/components/Shared/Section.tsx` - Use `useTheme()`
- `BaseClient/src/components/Shared/Heading.tsx` - Use `useTheme()`
- `BaseClient/src/components/Shared/Title.tsx` - Use `useTheme()`
- `BaseClient/src/theme/layout.ts` - Convert to theme-aware style generators
- `BaseClient/src/theme/layoutSidebar.ts` - Convert to theme-aware
- `BaseClient/src/theme/layoutTopbar.ts` - Convert to theme-aware

---

## Files to Reference

- `BaseClient/src/components/Sidebar/Sidebar.tsx` - Current implementation
- `BaseClient/src/components/Topbar/Topbar.tsx` - Current implementation
- `BaseClient/src/theme/layout.ts` - Current layout styles barrel
- `BaseClient/src/theme/layoutSidebar.ts` - Sidebar-specific styles
- `BaseClient/src/theme/layoutTopbar.ts` - Topbar-specific styles
