# Task 03: Create ThemeProvider Context and useTheme Hook

> **Status**: COMPLETED
> **Agent**: `frontend-dev`
> **Blocked by**: 01 (types), 02 (palette generator), 04 (default preset)
> **Blocks**: 05, 06, 07, 08 (all core component tasks)

---

## Problem Statement

Components currently access theme via multiple patterns, most commonly reading
Redux `ui.theme` and manually selecting from a hardcoded palette. This must be
replaced with a centralized ThemeProvider that:

1. Accepts a `TenantThemeConfig` (from API or defaults)
2. Generates the full `ResolvedTheme` via palette-generator
3. Exposes everything via a single `useTheme()` hook
4. Supports light/dark mode toggle
5. Is fully backwards-compatible during incremental migration

---

## Implementation Summary

### Files Created

1. `src/theme/utils/ThemeContext.ts` - React Context definition with `ThemeContextValue` interface
2. `src/theme/components/ThemeProvider.tsx` - Context provider component (85 lines)
3. `src/theme/hooks/useTheme.ts` - Primary hook with helpful error message
4. `src/theme/components/ThemeProvider.test.tsx` - 12 unit tests
5. `src/theme/utils/resolveTheme.ts` - Pure function bridging config + mode to ResolvedTheme

### Files Modified

1. `src/theme/utils/hooks.ts` - `useThemeColors()` now delegates to ThemeContext when available
2. `src/theme/utils/styles.ts` - Removed unused re-exports (YAGNI cleanup)
3. `src/theme/index.ts` - Added barrel exports for useTheme, ThemeProvider, ThemeContext
4. `app/_layout.tsx` - App wrapped with `<ThemeProvider>` inside Redux Provider

### Architecture Decisions

- ThemeProvider wraps INSIDE Redux Provider (needs Redux for sync) but OUTSIDE
  other providers that consume theme
- Initial mode read from Redux state (which is already persisted to localStorage)
- Mode changes dispatch to Redux via `setTheme()` to keep it in sync
- `useThemeColors()` returns the same ThemeColors shape for backwards compat
  by falling back to Redux + hardcoded palette when ThemeContext is unavailable
- `resolveTheme()` is a pure function that bridges TenantThemeConfig + ThemeMode
  to a full ResolvedTheme using `generateThemePalette()` from palette-generator

### Integration Points

- `TenantThemeConnector` renders inside ThemeProvider and QueryClientProvider,
  calling `useTenantThemeBridge()` to sync fetched tenant config into the provider
- 60+ components already consume `useTheme()` directly
- `useThemeColors()` remains available for legacy code paths

---

## Success Criteria

- [x] `ThemeProvider` wraps app in `_layout.tsx`
- [x] `useTheme()` returns complete `ResolvedTheme`
- [x] Light/dark toggle works via `toggleMode()`
- [x] Default theme applied when no tenantConfig
- [x] `useThemeColors()` still works (backwards compat)
- [x] Redux `ui.theme` stays in sync
- [x] All existing tests pass (2025/2025, 159 suites)
- [x] Lint passes (no errors)
- [x] YAGNI clean (no theme-related unused exports)
- [x] Build succeeds (web export OK)
