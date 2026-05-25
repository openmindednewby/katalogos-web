# ESLint i18n Enforcement Rules

## Status: COMPLETED

## Problem Statement
When adding new features (e.g., FlexBox in SyncfusionThemeStudio), hardcoded English strings were missed in JSX files. Code review caught them manually, but this should be automated via ESLint.

## Root Cause Analysis
Neither SyncfusionThemeStudio nor BaseClient had ESLint rules to prevent hardcoded user-facing strings in JSX. Developers could accidentally commit untranslatable text without any linter warning.

## Implementation Plan
1. Add `react/jsx-no-literals` rule to both projects (zero new dependencies - uses existing `eslint-plugin-react`)
2. Add `i18next/no-literal-string` rule for deeper analysis (added as complementary rule)
3. Configure `allowedStrings` for punctuation/symbols that don't need translation
4. Disable both rules for test files
5. Fix all existing violations by wrapping strings with `FM()` / `t()`
6. Update CLAUDE.md with documentation

## Files Modified

### ESLint Configs
- `SyncfusionThemeStudio/eslint.config.mjs` - Added `react/jsx-no-literals` rule + test override
- `BaseClient/eslint.config.mjs` - Added `react/jsx-no-literals` rule + test override

### CLAUDE.md
- Added "Hardcoded Strings in JSX" section to ESLint Rules documentation

### SyncfusionThemeStudio Violations Fixed (18 files)
- `src/features/dashboard/pages/DashboardPage/index.tsx`
- `src/features/showcase/pages/ComponentsPage/sections/AdvancedInputsSection.tsx`
- `src/features/showcase/pages/NativeComponentsPage/sections/NativeNotificationsSection.tsx`
- `src/features/showcase/pages/ComponentsPage/sections/NotificationsSection.tsx`
- `src/features/showcase/pages/ComponentsPage/sections/PopupsSection.tsx`
- `src/components/layout/ThemeSettingsDrawer/ColorsSection.tsx`
- `src/features/showcase/pages/NativeComponentsPage/sections/NativeDialogsSection.tsx`
- `src/components/common/ErrorBoundary.tsx`
- `src/features/showcase/pages/ComponentsPage/sections/NavigationsSection.tsx`
- `src/features/showcase/pages/ComponentsPage/sections/SelectionSection.tsx`
- `src/components/layout/Sidebar/NavExpandableItem.tsx`
- `src/components/layout/Sidebar/index.tsx`
- `src/components/layout/ThemeSettingsDrawer/index.tsx`
- `src/app/providers/I18nProvider.tsx`
- `src/components/layout/ThemeSettingsDrawer/ImportExportSection.tsx`
- `src/features/products/pages/ProductsListPage/index.tsx`
- `src/features/showcase/pages/ComponentsPage/sections/ButtonsSection.tsx`
- `src/features/showcase/pages/DataGridPage/index.tsx`

### BaseClient Violations Fixed (25 files)
- `src/components/Users/TenantSelector.tsx`
- `src/components/ErrorBoundary/ErrorBoundary.tsx`
- `src/components/Notifications/NotificationPermissionBanner.tsx`
- `src/components/Users/UserListItem.tsx`
- `src/components/Users/PasswordResetModal.tsx`
- `src/features/showcase/pages/NativeFormsPage/forms/ContactForm/index.tsx`
- `src/features/showcase/pages/NativeFormsPage/forms/LoginForm/index.tsx`
- `src/features/showcase/pages/NativeFormsPage/forms/NewsletterForm/index.tsx`
- `src/features/showcase/pages/NativeFormsPage/forms/RegistrationForm/index.tsx`
- `src/features/showcase/pages/NativeFormsPage/index.tsx`
- `src/components/Content/VideoPicker.tsx`
- `src/components/Lists/PaginationControls.tsx`
- `src/components/OnlineMenus/Styling/ImportExportButtons.tsx`
- `src/components/Content/ContentPreview.tsx`
- `src/components/Content/ContentPreviewParts.tsx`
- `src/components/Content/ContentUploader.tsx`
- `src/components/Content/ContentVideoParts.tsx`
- `src/components/Content/UploadProgress.tsx`
- `src/components/OnlineMenus/Styling/PriceStyleInputControls.tsx`
- `src/components/OnlineMenus/Styling/SliderRow.tsx`
- `src/components/OnlineMenus/Styling/SpacingEditor.tsx`
- `src/components/OnlineMenus/Styling/TypographyMenuPicker.tsx`
- `src/components/OnlineMenus/Styling/TypographySection.tsx`
- `src/components/Shared/Checkbox.tsx`
- `src/components/Users/UserFormTenantSelector.tsx`

## Configuration Details

| Setting | Value | Why |
|---------|-------|-----|
| `noStrings: true` | Catches all string literals in JSX children | Core enforcement |
| `allowedStrings` | Punctuation and symbols | Non-translatable characters |
| `ignoreProps: true` | Skips props (className, testID, etc.) | Technical strings |
| `noAttributeStrings: false` | Allows string attribute values | Props like type="text" |
| Severity: `warn` | Start with warnings | Gradual adoption |

## Success Criteria
- [x] `react/jsx-no-literals` rule added to SyncfusionThemeStudio
- [x] `react/jsx-no-literals` rule added to BaseClient
- [x] Rules disabled for test files in both projects
- [x] CLAUDE.md updated with new rule documentation
- [x] All SyncfusionThemeStudio violations fixed (83 violations across 18 files)
- [x] All BaseClient violations fixed (53 violations across 25 files)
- [x] Lint passes with zero jsx-no-literals warnings (both projects)
- [x] Unit tests pass in both projects (429/429 SyncfusionThemeStudio, 1457/1457 BaseClient)
- [x] Build succeeds in both projects

## Rollout Strategy
1. **Phase 1** (this task): Add rules as `warn`, fix all violations
2. **Phase 2** (future): Upgrade to `error` after team is comfortable
3. **Phase 3** (optional): Evaluate if `eslint-plugin-i18next` alone suffices
