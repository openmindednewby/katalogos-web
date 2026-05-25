# Task 12: Migrate Remaining Domain Components to New Theme System

> **Status**: COMPLETED (2026-03-06) — All components already migrated, useThemeColors() deprecated
> **Agent**: `frontend-dev`
> **Blocked by**: 05, 06, 07, 08 (all core component tasks)
> **Blocks**: None (final migration)
> **Estimated effort**: Large

---

## Problem Statement

After core components are themed, the remaining domain-specific components still use direct Redux palette access. They need to be migrated to `useTheme()` for consistent per-tenant styling across the entire app.

---

## Requirements

### Components to Migrate (by domain)

#### Content Module
| Component | Location |
|-----------|---------|
| ContentUploader | `components/Content/ContentUploader.tsx` |
| ContentImage | `components/Content/ContentImage.tsx` |
| ContentVideo | `components/Content/ContentVideo.tsx` |
| ContentPreview | `components/Content/ContentPreview.tsx` |
| UploadProgress | `components/Content/UploadProgress.tsx` |

Note: `ContentUploader.styles.ts` uses `createUploaderThemeStyles(colors)` pattern - update to accept `useTheme()` colors.

#### Questioner Module
| Component | Location |
|-----------|---------|
| TemplateForm | `components/QuestionerTemplates/TemplateForm.tsx` |
| TemplateEditorForm | `components/QuestionerTemplates/TemplateEditorForm.tsx` |
| TemplateJsonEditor | `components/QuestionerTemplates/TemplateJsonEditor.tsx` |
| TemplateEditorModal | `components/QuestionerTemplates/TemplateEditorModal.tsx` |
| TemplateListError | `components/QuestionerTemplates/TemplateListError.tsx` |
| DeleteInactiveButton | `components/QuestionerTemplates/DeleteInactiveButton.tsx` |
| DynamicForm/* | `components/DynamicForm/` (all sub-components) |

#### Notifications Module
| Component | Location |
|-----------|---------|
| Notifier | `components/Notifications/Notifier.tsx` |
| RealTimeNotificationProvider | `components/Notifications/RealTimeNotificationProvider.tsx` |
| NotificationPermissionBanner | `components/Notifications/NotificationPermissionBanner.tsx` |
| SafeNotificationBell | `components/Notifications/SafeNotificationBell.tsx` |

#### Users/Tenants Admin
| Component | Location |
|-----------|---------|
| UserForm | `components/Users/UserForm.tsx` |
| UserFormFields | `components/Users/UserFormFields.tsx` |
| UserListItem | `components/Users/UserListItem.tsx` |
| TenantListItem | `components/Tenants/TenantListItem.tsx` |
| TenantForm | `components/Tenants/TenantForm.tsx` |
| TenantAuthConfig | `components/Tenants/TenantAuthConfig.tsx` |

#### Settings
| Component | Location |
|-----------|---------|
| NotificationPreferencesScreen | `components/Settings/NotificationPreferencesScreen.tsx` |
| CategoryPreferenceRow | `components/Settings/CategoryPreferenceRow.tsx` |

#### Error Handling
| Component | Location |
|-----------|---------|
| ErrorBoundary | `components/ErrorBoundary/` |
| Fallbacks | `components/Shared/Fallbacks/` |

### DO NOT MIGRATE (separate color system)
The Public Menu components use their own `ColorScheme` for tenant-customized public content display. These should NOT use the app theme:
- `components/PublicMenu/MenuContentView.tsx`
- `components/PublicMenu/CategorySection.tsx`
- `components/PublicMenu/MenuItemDisplay.tsx`
- `components/PublicMenu/MenuCard.tsx`
- `components/PublicMenu/MenuStateViews.tsx`

The OnlineMenus editor components also have their own styling system for editing menu appearance:
- `components/OnlineMenus/ColorSchemeEditor.tsx`
- `components/OnlineMenus/TypographyEditor.tsx`
- etc.

These editor components should use the app theme for their own UI (editor chrome), but the color values they edit are menu-specific, not app-theme tokens.

---

## Migration Pattern

For each component:
1. Replace `useSelector((s: RootState) => s.ui.theme)` with `useTheme()`
2. Replace `theme === ThemeMode.Dark ? themePalette.dark : themePalette.light` with `colors` from `useTheme()`
3. Replace hardcoded color references with theme token equivalents
4. Update any separate `.styles.ts` files to accept theme colors as parameter
5. Verify no visual regressions

---

## Acceptance Criteria

- [ ] All domain components migrated to `useTheme()` (except PublicMenu/OnlineMenus editor)
- [ ] Zero remaining `useSelector((s) => s.ui.theme)` calls in component files (only in ThemeProvider)
- [ ] Zero remaining `themePalette.dark/light` references in components
- [ ] All `.styles.ts` files updated to theme-aware pattern
- [ ] DynamicForm sub-components use theme via `useDynamicFormStyles()` (updated in Task 06)
- [ ] No visual regressions in any module
- [ ] Old `useThemeColors()` backward-compat hook can be marked as deprecated
- [ ] Lint passes (`npm run lint:fix`)
- [ ] All unit tests pass
- [ ] Build succeeds (`npx expo export --platform web`)

---

## Migration Checklist

Use this as a tracking checklist during implementation:

- [ ] Content: ContentUploader, ContentImage, ContentVideo, ContentPreview, UploadProgress
- [ ] Content: Update ContentUploader.styles.ts
- [ ] Questioner: TemplateForm, TemplateEditorForm, TemplateJsonEditor
- [ ] Questioner: TemplateEditorModal, TemplateListError, DeleteInactiveButton
- [ ] Questioner: DynamicForm sub-components (verify useDynamicFormStyles works)
- [ ] Notifications: Notifier, RealTimeNotificationProvider, NotificationPermissionBanner
- [ ] Users: UserForm, UserFormFields, UserListItem
- [ ] Tenants: TenantListItem, TenantForm, TenantAuthConfig
- [ ] Settings: NotificationPreferencesScreen, CategoryPreferenceRow
- [ ] Error: ErrorBoundary, Fallbacks
- [ ] Providers: Any theme references in provider components
- [ ] Final: Search codebase for remaining `themePalette` references
- [ ] Final: Search codebase for remaining `useSelector.*ui.theme` references
