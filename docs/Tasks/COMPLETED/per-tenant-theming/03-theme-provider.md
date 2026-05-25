# Task 03: Create ThemeProvider Context and useTheme Hook

> **Status**: COMPLETED (2026-03-06) — 12 unit tests
> **Agent**: `frontend-dev`
> **Blocked by**: 01 (types), 02 (palette generator), 04 (default preset)
> **Blocks**: 05, 06, 07, 08 (all core component tasks)
> **Estimated effort**: Medium

---

## Problem Statement

Components currently access theme via 5 different patterns, most commonly:
```typescript
const theme = useSelector((s: RootState) => s.ui.theme);
const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
```

This is tightly coupled to the hardcoded palette and doesn't support per-tenant colors. We need a centralized ThemeProvider that:
1. Accepts a `TenantThemeConfig` (from API or defaults)
2. Generates the full resolved palette
3. Exposes everything via a single `useTheme()` hook
4. Supports light/dark mode toggle
5. Is backwards-compatible during migration

---

## Requirements

### ThemeProvider Component
- React Context provider wrapping the app
- Accepts optional `tenantThemeConfig` prop (null = use defaults)
- Internally generates `ResolvedTheme` from config using palette generator
- Re-generates when config or mode changes
- Memoized to prevent unnecessary re-renders

### useTheme() Hook
Returns a `ResolvedTheme` object containing:
- `colors` - Current mode's resolved colors (background, surface, text, border, etc.)
- `palette` - Full shade scales (primary.50-900, secondary.50-900, etc.)
- `semantic` - Semantic colors (success, warning, error, info)
- `typography` - Font config
- `mode` - Current ThemeMode (light/dark)
- `toggleMode()` - Function to switch light/dark
- `setMode(mode)` - Function to set specific mode
- `branding` - Logo URL, favicon URL (resolved from ContentIds)

### Backwards Compatibility
- Keep existing `useThemeColors()` hook working during migration (internally delegate to new system)
- Keep Redux `ui.theme` in sync with the provider's mode
- Existing components should not break while migration happens incrementally

### Mode Persistence
- Light/dark mode preference persisted to localStorage (existing behavior via Redux persist)
- ThemeProvider reads initial mode from Redux store
- Mode changes update both context and Redux store

---

## Acceptance Criteria

- [ ] `ThemeProvider` component created and wraps the app in `App.tsx` or equivalent
- [ ] `useTheme()` hook returns complete `ResolvedTheme`
- [ ] Light/dark mode toggle works via `useTheme().toggleMode()`
- [ ] Default theme applied when no `tenantThemeConfig` provided
- [ ] Existing `useThemeColors()` hook still works (delegates to new system)
- [ ] Redux `ui.theme` stays in sync with ThemeProvider mode
- [ ] No visual changes to existing UI (backwards compatible)
- [ ] Unit tests for ThemeProvider mode switching
- [ ] Unit tests for useTheme() returning correct resolved values
- [ ] Memoization prevents unnecessary re-renders (useMemo/useCallback)

---

## Files to Create

- `BaseClient/src/theme/ThemeProvider.tsx` - Context provider component
- `BaseClient/src/theme/useTheme.ts` - The primary hook
- `BaseClient/src/theme/ThemeContext.ts` - Context definition (separate for clean imports)
- `BaseClient/src/theme/__tests__/ThemeProvider.test.tsx` - Unit tests

## Files to Modify

- `BaseClient/src/theme/hooks.ts` - Update `useThemeColors()` to delegate to new system
- `BaseClient/src/theme/styles.ts` - Update barrel exports
- `BaseClient/src/App.tsx` (or root layout) - Wrap with ThemeProvider

---

## Files to Reference

- `BaseClient/src/theme/palette.ts` - Current palette structure (ThemeColors interface)
- `BaseClient/src/store/slices/uiSlice.ts` - Redux theme/mode state
- `BaseClient/src/theme/hooks.ts` - Current `useThemeColors()` implementation
- `BaseClient/src/components/Shared/Checkbox.tsx` - Example of Pattern A (direct Redux)
- `BaseClient/src/components/Forms/FormField.tsx` - Example of Pattern B (useThemeColors)
- `BaseClient/src/components/DynamicForm/` - Example of Pattern with useDynamicFormStyles()

---

## Design Notes

### Context Shape
```typescript
interface ThemeContextValue {
  theme: ResolvedTheme;
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setTenantConfig: (config: TenantThemeConfig | null) => void;
}
```

### Provider Implementation Pattern
```typescript
function ThemeProvider({ tenantConfig, children }) {
  const [mode, setMode] = useState(/* from Redux or localStorage */);

  const resolvedTheme = useMemo(
    () => resolveTheme(tenantConfig ?? DEFAULT_THEME_CONFIG, mode),
    [tenantConfig, mode]
  );

  // Keep Redux in sync
  const dispatch = useDispatch();
  useEffect(() => { dispatch(setTheme(mode)); }, [mode]);

  return <ThemeContext.Provider value={...}>{children}</ThemeContext.Provider>;
}
```

### Migration Path
During migration, both patterns work:
- New: `const { colors } = useTheme();`
- Old: `const colors = useThemeColors();` (internally calls useTheme)
- Old: `useSelector((s) => s.ui.theme)` still works for mode only

Once all components are migrated, the old patterns can be removed.
