# Wire PillBadge into Theme Settings Editor

## Problem Statement
The PillBadge component at `src/components/ui/native/PillBadge/index.tsx` uses hardcoded Tailwind classes for structural properties (borderRadius, padding, fontSize, fontWeight). It needs to be connected to the theme editor so users can customize these structural properties through the Components tab.

## Implementation Plan
1. Add `PillBadgeConfig` type to `displayComponentTypes.ts`
2. Re-export from `componentTypes.ts` and add to `ComponentConfigSingle`
3. Re-export from `types/index.ts`
4. Add defaults to `defaultComponentsLight.ts` and `defaultComponentsDark.ts`
5. Add `ComponentKey.PillBadge` and `updatePillBadgeConfig` action
6. Add action type to `actions/types.ts`
7. Add to `ThemeState` in `themeTypes.ts`
8. Create `PillBadgeEditor.tsx` component
9. Wire into `ComponentsSection/index.tsx`
10. Add localization keys to `en.json`
11. Update PillBadge component to read theme values
12. Bump schema version

## Files to Modify
- `src/stores/theme/types/displayComponentTypes.ts`
- `src/stores/theme/types/componentTypes.ts`
- `src/stores/theme/types/index.ts`
- `src/stores/theme/types/themeTypes.ts`
- `src/stores/theme/defaults/defaultComponentsLight.ts`
- `src/stores/theme/defaults/defaultComponentsDark.ts`
- `src/stores/theme/actions/componentActions.ts`
- `src/stores/theme/actions/types.ts`
- `src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/components/PillBadgeEditor.tsx` (new)
- `src/components/layout/ThemeSettingsDrawer/sections/ComponentsSection/index.tsx`
- `src/localization/locales/en.json`
- `src/components/ui/native/PillBadge/index.tsx`
- `src/stores/useThemeStore.ts` (bump schema version)

## Success Criteria
- PillBadge config type exists with 5 properties
- Light and dark defaults provided
- Store action wired and functional
- Editor component renders in Components tab
- PillBadge component reads and applies theme values
- All quality checks pass (lint, YAGNI, unit tests, build)
