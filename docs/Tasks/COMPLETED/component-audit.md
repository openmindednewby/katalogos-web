# Reusable Component Audit

**Status**: COMPLETED
**Created**: 2026-03-18

## Summary

- Total shared components inventoried: 62 (excluding product modules OnlineMenus, PublicMenu, QuestionerTemplates)
- Product-coupled components (violations): 3 (ExportButtons, CollapsibleSection, SliderRow)
- Duplicated patterns found: 6 (ActionRow, ConfirmDialog, Dropdown, StatusBadge, Empty/Loading states, FormActions)
- Extraction opportunities: 4

---

## Product-Specific Violations

| Component | File | Product Import | Severity |
|-----------|------|----------------|----------|
| `ExportButtons` | `components/Buttons/ExportButtons/index.tsx` | `questioner/models/Answer`, `Question`, `QuestionType`, `useCompletedQuestionersWithUsers` | HIGH |
| `generateCsvExport` | `components/Buttons/ExportButtons/generateCsvExport.ts` | Same questioner imports | HIGH |
| `generateJsonExport` | `components/Buttons/ExportButtons/generateJsonExport.ts` | `useCompletedQuestionersWithUsers` | HIGH |
| `CollapsibleSection` | `components/OnlineMenus/Styling/components/CollapsibleSection.tsx` | Styles from `globalStylingTabStyles` | LOW |
| `SliderRow` | `components/OnlineMenus/Styling/components/SliderRow.tsx` | Styles from `boxStyleEditorStyles` | LOW |

---

## Duplicated Patterns (Extraction Candidates)

### 1. Status Badge Pattern

**Found in**:
- `components/Status/StatusBadge.tsx` (tenant status)
- `components/Status/GenericStatusBadge.tsx` (boolean/numeric)
- `components/Settings/BillingSettings/components/StatusBadge.tsx` (subscription status)
- `components/Settings/CustomDomainSettings/components/DomainStatusBadge.tsx` (domain status)

**Variations**: All use identical `{ paddingHorizontal, paddingVertical, borderRadius, fontWeight: '600' }` shape. Differ only in color-mapping logic.

**Recommendation**: Create a single `components/Shared/StatusBadge.tsx` that accepts `label`, `color`, `bgColor`, `size`. Each domain exports a small adapter mapping its enum to colors.

### 2. Modal Dropdown Pattern

**Found in**:
- `components/Settings/components/DisplayPreferenceDropdown.tsx`
- `components/Settings/PreferencesSettings/components/SettingsDropdown.tsx`

**Variations**: `DisplayPreferenceDropdown` is typed to numeric enum; `SettingsDropdown` accepts strings. Both use identical Modal + FlatList + useFocusTrap structure.

**Recommendation**: Extract to `components/Shared/ModalDropdown.tsx` with generic `value: T`, `options: { label, value }[]`, `onChange`.

### 3. Confirmation Dialog Pattern

**Found in**:
- `components/Shared/ConfirmDialog.tsx` — canonical version
- `components/Settings/BillingSettings/components/CancelConfirmDialog.tsx` — copy-paste

**Recommendation**: Delete `CancelConfirmDialog`, replace with `<ConfirmDialog destructive title={FM(...)} message={FM(...)} />`.

### 4. Empty/Error/Loading State Pattern

**Found in**:
- `components/Shared/EmptyListState.tsx` — generic (only used by TenantListRenderer)
- `components/Shared/Fallbacks/LoadingFallback.tsx` — loading spinner
- `components/Lists/PaginatedList.tsx` — inlines its own loading + empty text
- `components/PublicMenu/components/MenuStateViews.tsx` — inline MenuLoadingState/MenuErrorState
- `components/QuestionerTemplates/TemplateListError.tsx` — error with refresh button

**Recommendation**:
1. `PaginatedList` should use `LoadingFallback` and `EmptyListState`
2. Extract generic `ErrorState` component to `components/Shared/ErrorState.tsx`
3. Replace `TemplateListError` and `MenuErrorState` with it

### 5. ActionRow Duplication

**Found in**:
- `components/Buttons/ActionRow.tsx` — old save+cancel specific row (LEGACY)
- `components/core/ActionRow/ActionRow.tsx` — new generic layout wrapper

**Recommendation**: Delete `components/Buttons/ActionRow.tsx`. Consumers use `core/ActionRow` + individual buttons.

### 6. Card Component Pattern

**Found in**:
- `components/Dashboard/components/OverviewCard.tsx`
- `components/Dashboard/components/GuidedActionCard.tsx`
- `components/PublicMenu/components/MenuCard.tsx`
- `components/Settings/BillingSettings/components/PlanComparisonCard.tsx`

**Recommendation**: Extract `components/Shared/Card.tsx` base container. Unify `OverviewCard` and `GuidedActionCard` into configurable `ActionCard`.

---

## Shared Component Inventory

### Core
| Component | Path | Purpose | Reusable |
|-----------|------|---------|----------|
| Button | `core/Button/components/Button.tsx` | 5 variants, 3 sizes, loading, icon | Yes |
| ActionRow | `core/ActionRow/ActionRow.tsx` | Horizontal layout wrapper | Yes |
| TenantLogo | `core/TenantLogo/TenantLogo.tsx` | Theme-driven tenant branding | Yes |

### Forms
| Component | Path | Purpose | Reusable |
|-----------|------|---------|----------|
| FormField | `Forms/FormField.tsx` | Labeled text input with error | Yes |
| FormSwitch | `Forms/FormSwitch.tsx` | Labeled toggle with description | Yes |
| ChipSelector | `Forms/ChipSelector.tsx` | Multi-chip option selector | Yes |
| FormActions | `Forms/FormActions.tsx` | Save/Cancel bar (uses raw TouchableOpacity) | Yes (tech debt) |

### Shared
| Component | Path | Purpose | Reusable |
|-----------|------|---------|----------|
| FieldLabel | `Shared/FieldLabel.tsx` | Input label text | Yes |
| Heading | `Shared/Heading.tsx` | Section heading | Yes |
| Section | `Shared/Section.tsx` | Bordered card container | Yes |
| Tabs | `Shared/Tabs.tsx` | Horizontal tab bar | Yes |
| Title | `Shared/Title.tsx` | Page title | Yes |
| ChoicePill | `Shared/ChoicePill.tsx` | Pill toggle button | Yes |
| ConfirmDialog | `Shared/ConfirmDialog.tsx` | Modal confirm with destructive mode | Yes |
| EmptyListState | `Shared/EmptyListState.tsx` | Empty state with optional CTA | Yes |
| PageHeaderWithActions | `Shared/PageHeaderWithActions.tsx` | Page header with action buttons | Yes |
| ModalShell | `Shared/ModalShell.tsx` | Full-screen modal container | Yes |
| Checkbox | `Shared/Checkbox.tsx` | Checkbox with label | Yes |
| FeatureGate | `Shared/FeatureGate.tsx` | Feature flag guard | Yes |
| PlaceholderPage | `Shared/PlaceholderPage.tsx` | Coming soon page | Yes |
| LoadingFallback | `Shared/Fallbacks/LoadingFallback.tsx` | Centered spinner | Yes |
| PageSkeleton | `Shared/Fallbacks/PageSkeleton.tsx` | Shimmer skeleton | Yes |

### UI (Web)
| Component | Path | Purpose | Reusable |
|-----------|------|---------|----------|
| FormNativeInput | `ui/form-fields/FormNativeInput.tsx` | RHF text input | Yes |
| FormNativeSelect | `ui/form-fields/FormNativeSelect.tsx` | RHF select | Yes |
| FormNativeTextarea | `ui/form-fields/FormNativeTextarea.tsx` | RHF textarea | Yes |
| FormNativeCheckbox | `ui/form-fields/FormNativeCheckbox.tsx` | RHF checkbox | Yes |
| FormNativeDatePicker | `ui/form-fields/FormNativeDatePicker.tsx` | RHF date picker | Yes |
| FormPasswordInput | `ui/form-fields/FormPasswordInput.tsx` | RHF password | Yes |
| TableNative | `ui/TableNative/` | Virtual data table | Yes |
| ButtonNative | `ui/native/ButtonNative/` | HTML button | Yes |

### Other
| Component | Path | Purpose | Reusable |
|-----------|------|---------|----------|
| SvgIcon | `Icons/SvgIcon.tsx` | SVG icon renderer | Yes |
| PaginatedList | `Lists/PaginatedList.tsx` | Paginated FlatList | Yes (needs refactor) |
| ErrorBoundary | `ErrorBoundary/ErrorBoundary.tsx` | Error boundary | Yes |
| DynamicForm | `DynamicForm/` | Dynamic survey form engine | Yes |
| Content | `Content/` | File upload system | Yes |
| CookieConsentBanner | `CookieConsent/` | GDPR consent | Yes |
| LegalSection | `Legal/` | Legal document sections | Yes |
| StatusBadge | `Status/StatusBadge.tsx` | Tenant status badge | Partial |
| GenericStatusBadge | `Status/GenericStatusBadge.tsx` | Boolean/numeric badge | Yes |

---

## Top 10 Recommendations

1. **Move `ExportButtons/`** to `QuestionerTemplates/` — HIGH severity violation
2. **Delete `CancelConfirmDialog`** — use `ConfirmDialog` directly
3. **Delete `Buttons/ActionRow.tsx`** — superseded by `core/ActionRow`
4. **Extract `ModalDropdown`** — merge two identical dropdown implementations
5. **Extract `ErrorState`** — replace scattered inline error states
6. **Consolidate status badges** — 4 implementations into 1 generic
7. **Promote `CollapsibleSection`** — move from OnlineMenus to Shared
8. **Promote `SliderRow`** — move from OnlineMenus to Shared
9. **Update `FormActions`** to use `core/Button` instead of raw `TouchableOpacity`
10. **Increase `EmptyListState` adoption** — currently used by only 1 consumer

---

## Implementation Results (2026-03-18)

All 10 recommendations have been implemented and verified.

### Verification Results
- `frontend-lint-fix`: PASS
- `frontend-yagni`: PASS
- `frontend-unit-tests`: PASS
- `frontend-prod-build`: PASS

### Changes Summary

| # | Recommendation | Action Taken |
|---|---------------|--------------|
| 1 | Move ExportButtons to QuestionerTemplates | Moved 5 files from `Buttons/ExportButtons/` to `QuestionerTemplates/ExportButtons/`. Updated import in `app/(protected)/quiz-answers/index.tsx`. |
| 2 | Delete CancelConfirmDialog | Deleted file, replaced usage in `BillingSettingsScreen.tsx` with `ConfirmDialog` from Shared. |
| 3 | Delete legacy Buttons/ActionRow | Deleted file, migrated 4 consumers (TenantForm, TemplateJsonEditor, TemplateForm, TemplateEditorForm) to `core/ActionRow` + `SaveButton`/`CancelButton`. |
| 4 | Extract ModalDropdown | Created `Shared/ModalDropdown.tsx` with generic `<T extends string \| number>`. Rewrote `DisplayPreferenceDropdown` and `SettingsDropdown` as thin wrappers. |
| 5 | Extract ErrorState | Created `Shared/ErrorState.tsx` with `message` + optional `onRetry`. Deleted `TemplateListError`. Removed `MenuErrorState` from `PublicMenu` barrel. Updated 3 consumers in `app/` directory. |
| 6 | Consolidate StatusBadge | Created `Shared/StatusBadge.tsx`. Rewrote `Status/StatusBadge`, `GenericStatusBadge`, `BillingSettings/StatusBadge`, `DomainStatusBadge` as thin wrappers. |
| 7 | Promote CollapsibleSection | Created `Shared/CollapsibleSection.tsx` with self-contained styles. Original in OnlineMenus re-exports from Shared. |
| 8 | Promote SliderRow | Created `Shared/SliderRow.tsx` with self-contained styles. Original in OnlineMenus re-exports from Shared. |
| 9 | Update FormActions to use core/Button | Rewrote `Forms/FormActions.tsx` to use `core/Button` with `ButtonVariant.Primary` and `ButtonVariant.Outline`. |
| 10 | Increase EmptyListState adoption | Updated `Lists/PaginatedList.tsx` to use `EmptyListState` and `LoadingFallback`, changed `emptyMessage` prop to `emptyMessageKey`. |

### Translation Keys Added to `en.json`
- `common.selectPlaceholder`, `common.selectOptionHint`, `common.dismissDropdown`, `common.dismissDropdownHint`
- `common.retryHint`, `common.retry`, `common.errorOccurred`
- `common.decreaseHint`, `common.increaseHint`, `common.pxUnit`
- `common.toggleSectionHint`
- `common.saveHint`, `common.discardHint`

### TestIds Added to `commonTestIds.ts`
- `ERROR_STATE`, `ERROR_STATE_RETRY`
