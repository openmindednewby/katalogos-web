# Layout Components

## Section

Themed card container with border and background color.

**Import**: `import Section from '@/components/Shared/Section'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | `ReactNode` | No | - | Content to render inside the card |
| style | `ViewStyle \| ViewStyle[]` | No | - | Additional styles to apply |

```tsx
<Section>
  <Heading text={FM('mySection.title')} />
  <Text>{FM('mySection.content')}</Text>
</Section>
```

---

## Heading

Section heading text styled from the theme.

**Import**: `import Heading from '@/components/Shared/Heading'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| text | `string` | No | - | Heading text (alternative to children) |
| children | `ReactNode` | No | - | Heading content |

```tsx
<Heading text={FM('users.title')} />
<Heading>{FM('users.title')}</Heading>
```

**Accessibility**: Has `testID={TestIds.HEADING_TEXT}`.

---

## Title

Page-level title text.

**Import**: `import Title from '@/components/Shared/Title'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| text | `string` | No | - | Title text (alternative to children) |
| children | `ReactNode` | No | - | Title content |

```tsx
<Title text={FM('menus.pageTitle')} />
```

---

## PageHeaderWithActions

Page header with title and optional refresh/add action buttons.

**Import**: `import PageHeaderWithActions from '@/components/Shared/PageHeaderWithActions'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | Yes | - | Page title text |
| onRefresh | `() => void` | No | - | Callback when refresh is pressed |
| refreshing | `boolean` | No | `false` | Whether refresh is in progress |
| refreshLabel | `string` | No | `FM('common.refresh')` | Custom refresh button label |
| refreshButtonTestId | `string` | No | - | Test ID for refresh button |
| onAdd | `() => void` | No | - | Callback when add is pressed |
| addLabel | `string` | No | `FM('common.add')` | Custom add button label |
| showAdd | `boolean` | No | `false` | Whether to show the add button |
| onCreatePress | `() => void` | No | - | Deprecated: use onAdd instead |
| createButtonTestId | `string` | No | - | Test ID for create button |
| children | `ReactNode` | No | - | Custom actions after built-in buttons |

```tsx
<PageHeaderWithActions
  title={FM('menus.pageTitle')}
  onRefresh={handleRefresh}
  onAdd={handleAdd}
  showAdd
  refreshButtonTestId="menus-refresh"
  createButtonTestId="menus-create"
/>
```

**Accessibility**: Refresh and add buttons have `accessibilityHint` and `accessibilityLabel`. Responsive: stacks vertically on phone breakpoints.

---

## ActionRow (core)

Horizontal layout row for arranging buttons with consistent 12px gap.

**Import**: `import { ActionRow } from '@/components/core/ActionRow'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | `ReactNode` | Yes | - | Buttons or elements to arrange |
| style | `StyleProp<ViewStyle>` | No | - | Additional styles |
| testID | `string` | No | - | Test ID |

```tsx
<ActionRow>
  <Button label={FM('common.save')} ... />
  <Button label={FM('common.cancel')} ... />
</ActionRow>
```

---

## ModalShell

Full-screen modal with header, close button, and scrollable content.

**Import**: `import ModalShell from '@/components/Shared/ModalShell'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| visible | `boolean` | Yes | - | Whether the modal is visible |
| onCancel | `() => void` | Yes | - | Callback when closing |
| title | `string \| ReactNode` | No | - | Modal title |
| children | `ReactNode` | No | - | Modal content |
| contentStyle | `StyleProp<ViewStyle>` | No | - | Additional content styles |
| showClose | `boolean` | No | `true` | Whether to show the close button |

```tsx
<ModalShell
  visible={isOpen}
  title={FM('templates.editTitle')}
  onCancel={handleClose}
>
  <FormField label={FM('templates.name')} ... />
</ModalShell>
```

**Accessibility**: `accessibilityViewIsModal`, `role="dialog"`, close button has `accessibilityHint`.
