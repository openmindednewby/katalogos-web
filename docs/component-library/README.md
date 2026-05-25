# Component Library

Interactive reference of all shared reusable components in BaseClient.

## Live Showcase

Visit `/showcase/components` in the app (requires `enableThemeEditor` feature flag).

## Categories

| Category | File | Components |
|----------|------|------------|
| [Layout](layout.md) | layout.md | Section, Heading, Title, PageHeaderWithActions, ActionRow, ModalShell |
| [Inputs & Forms](inputs.md) | inputs.md | Checkbox, ChoicePill, FormField, FormSwitch, ChipSelector, FormActions |
| [Buttons](buttons.md) | buttons.md | Button, SaveButton, CancelButton, ActionRow (Buttons) |
| [Feedback](feedback.md) | feedback.md | ConfirmDialog, ApiErrorModal, LoadingFallback, PageSkeleton |
| [Data Display](data-display.md) | data-display.md | StatusBadge, GenericStatusBadge, Tabs, EmptyListState, PaginatedList |
| [Icons & Branding](icons-branding.md) | icons-branding.md | SvgIcon, TenantLogo |
| [Utility](utility.md) | utility.md | FeatureGate, ErrorBoundary, PlaceholderPage, SEOHead |

## Conventions

- All user-facing text uses `FM()` from `@/localization/helpers`
- Interactive elements require `testID` + `accessibilityLabel` + `accessibilityHint`
- Colors come from `useTheme()`, never hardcoded
- Components follow the structure order defined in `frontend-react.md`
