# Task 12: Migrate Remaining Domain Components to New Theme System

> **Status**: COMPLETED
> **Agent**: `frontend-dev`
> **Started**: 2026-02-14
> **Completed**: 2026-02-14

---

## Problem Statement

After core components are themed, the remaining domain-specific components still use direct Redux palette access (`useSelector((s) => s.ui.theme)` + `themePalette.dark/light`) or the backward-compat `useThemeColors()` hook. They need to be migrated to `useTheme()` for consistent per-tenant styling.

## Migration Mapping

Old palette property -> New theme equivalent:
- `colors.primary` -> `theme.palette.primary['500']`
- `colors.secondary` -> `theme.palette.secondary['500']`
- `colors.accent` -> `theme.palette.accent['500']`
- `colors.success` -> `theme.semantic.success['500']`
- `colors.error` -> `theme.semantic.error['500']`
- `colors.gamboge` -> `theme.semantic.warning['500']`
- `colors.text` -> `theme.colors.text`
- `colors.subtext` -> `theme.colors.textSecondary`
- `colors.textSecondary` -> `theme.colors.textSecondary`
- `colors.background` -> `theme.colors.background`
- `colors.surface` -> `theme.colors.surface`
- `colors.border` -> `theme.colors.border`
- `colors.muted` -> `theme.colors.surface` (closest match)
- `colors.textOnPrimary` -> `theme.colors.background` (or constant)

## Files Modified

### Batch 1: Redux palette pattern (`useSelector + themePalette`)
- [x] QuestionerTemplates/TemplateForm.tsx
- [x] QuestionerTemplates/TemplateJsonEditor.tsx
- [x] QuestionerTemplates/DeleteInactiveButton.tsx
- [x] Notifications/NotificationPermissionBanner.tsx
- [x] Users/UserListItem.tsx
- [x] Tenants/TenantListItem.tsx
- [x] Tenants/TenantListItemParts.tsx (local interface renamed: ThemeColors -> ListItemColors)
- [x] Tenants/TenantListItemActions.tsx (local interface renamed: ThemeColors -> ActionColors)
- [x] Shared/Fallbacks/LoadingFallback.tsx
- [x] Shared/Fallbacks/PageSkeleton.tsx
- [x] feedback/ApiErrorModal.tsx
- [x] Buttons/ExportButtons/index.tsx

### Batch 2: useThemeColors() pattern
- [x] Content/ContentUploader.tsx (created UploaderColors interface)
- [x] Content/ContentImage.tsx
- [x] Content/ContentVideo.tsx
- [x] Content/ContentPreview.tsx (updated buildThemeColors function)
- [x] Content/ContentPreviewStyles.ts (removed `muted` from ThemeColors, use `surface`)
- [x] Content/ContentUploader.styles.ts (renamed `subtext` to `textSecondary`)
- [x] Content/UploadProgress.tsx (renamed `subtext` to `textSecondary` in local interface)
- [x] Content/VideoPicker.tsx
- [x] QuestionerTemplates/TemplateEditorForm.tsx
- [x] QuestionerTemplates/Editor/QuestionEditor.tsx
- [x] QuestionerTemplates/Editor/QuestionList.tsx
- [x] QuestionerTemplates/Editor/OptionEditor.tsx
- [x] QuestionerTemplates/Editor/SkipConditions.tsx
- [x] Settings/NotificationPreferencesScreen.tsx
- [x] Settings/CategoryPreferenceRow.tsx
- [x] Settings/DisplayPreferenceDropdown.tsx
- [x] Tenants/TenantForm.tsx
- [x] Tenants/TenantAuthConfig.tsx
- [x] Users/UserFormTenantSelector.tsx
- [x] Users/TenantSelector.tsx (renamed `subtext` to `textSecondary` in local interface)
- [x] DynamicForm/QuestionRenderer/components/TextQuestion.tsx
- [x] Notifications/NotificationItemComponent.tsx (renamed `subtext` to `textSecondary`)

### Batch 3: PWA components (discovered during sweep)
- [x] pwa/IOSAddToHomePrompt.tsx
- [x] pwa/PWAInstallPrompt.tsx

### Test Files Updated
- [x] Shared/__tests__/Accessibility.test.tsx (removed stale useThemeColors/react-redux mocks)
- [x] __tests__/components/Content/ContentImage.test.tsx (replaced react-redux mock with useTheme mock)
- [x] __tests__/components/Content/ContentUploader.test.tsx (replaced react-redux mock with useTheme mock)
- [x] __tests__/components/Content/ContentPreview.test.tsx (replaced react-redux mock with useTheme mock)
- [x] feedback/__tests__/ApiErrorModal.test.tsx (replaced react-redux mock with useTheme mock)
- [x] Shared/Fallbacks/__tests__/LoadingFallback.test.tsx (rewrote to use useTheme mock)
- [x] Shared/Fallbacks/__tests__/PageSkeleton.test.tsx (rewrote to use useTheme mock)
- [x] Notifications/__tests__/NotificationPermissionBanner.test.tsx (replaced react-redux mock with useTheme mock)
- [x] OnlineMenus/__tests__/MenuContentEditor.mocks.ts (added useTheme mock alongside react-redux mock)

### DO NOT MIGRATE (confirmed excluded)
- OnlineMenus/* (editor chrome) - still uses Redux + themePalette
- PublicMenu/* (separate ColorScheme)

## Verification Results

- **Lint**: Passes (9 pre-existing errors in unrelated files)
- **Tests**: 159/159 suites pass, 1982/1982 tests pass
- **Build**: Successful (expo export --platform web)
- **YAGNI**: No new unused exports

## Success Criteria Verification

- Zero remaining `useSelector.*ui.theme` calls in component files outside OnlineMenus - CONFIRMED
- Zero remaining `themePalette.dark/light` references in components outside OnlineMenus - CONFIRMED
- `useThemeColors()` only consumed in theme definition/export files and their tests - CONFIRMED
- All local interfaces cleaned up: `subtext` -> `textSecondary`, `muted` removed (use `surface`)
