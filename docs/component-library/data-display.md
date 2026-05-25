# Data Display Components

## StatusBadge

Colored badge displaying tenant status. Maps `TenantStatus` values to semantic colors.

**Import**: `import StatusBadge from '@/components/Status/StatusBadge'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | `TenantStatusInput` | No | - | Tenant status value |
| size | `number` | No | `18` | Badge height in pixels |

```tsx
<StatusBadge status={tenant.status} />
<StatusBadge status={tenant.status} size={24} />
```

---

## GenericStatusBadge

Boolean/numeric status badge for active/inactive states. More flexible than `StatusBadge`.

**Import**: `import GenericStatusBadge from '@/components/Status/GenericStatusBadge'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | `boolean \| number` | No | - | Status value (true/1+ = active, false/0 = inactive) |
| size | `number` | No | `18` | Badge height in pixels |
| translationNs | `string` | No | `'tenants'` | Translation namespace for labels |
| testID | `string` | No | `TestIds.STATUS_LABEL` | Test ID |

```tsx
<GenericStatusBadge status={isActive} />
<GenericStatusBadge status={count} translationNs="menus" />
```

---

## Tabs

Tab navigation bar with active state highlighting.

**Import**: `import Tabs from '@/components/Shared/Tabs'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| tabs | `Array<{ key: string, label: string }>` | Yes | - | Tab definitions |
| activeKey | `string` | Yes | - | Currently active tab key |
| onChange | `(key: string) => void` | Yes | - | Tab change callback |
| style | `ViewStyle` | No | - | Additional styles |

```tsx
const tabs = [
  { key: 'overview', label: FM('tabs.overview') },
  { key: 'details', label: FM('tabs.details') },
];

<Tabs
  tabs={tabs}
  activeKey={activeTab}
  onChange={setActiveTab}
/>
```

**Accessibility**: `accessibilityRole="tablist"` on container, each tab has `accessibilityRole="tab"` and `accessibilityState={{ selected }}`.

---

## EmptyListState

Empty list message with optional call-to-action button that navigates to a route.

**Import**: `import EmptyListState from '@/components/Shared/EmptyListState'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| messageKey | `string` | Yes | - | Translation key for the empty message |
| testID | `string` | Yes | - | Test ID (required) |
| ctaTextKey | `string` | No | - | Translation key for CTA button text |
| ctaHintKey | `string` | No | - | Translation key for CTA accessibility hint |
| ctaRoute | `string` | No | - | Route to navigate to on CTA press |

All three CTA props must be provided together for the button to appear.

```tsx
<EmptyListState
  messageKey="menus.emptyList"
  testID="menus-empty"
  ctaTextKey="menus.createFirst"
  ctaHintKey="menus.createFirstHint"
  ctaRoute={Routes.MENU_CREATE}
/>
```

**Accessibility**: CTA button has `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityHint`.

---

## PaginatedList

Client-side paginated FlatList with navigation controls. Handles page calculations, empty state, and loading state internally.

**Import**: `import PaginatedList from '@/components/Lists/PaginatedList'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| data | `T[]` | Yes | - | Full data array |
| renderItem | `(item: T, index: number) => ReactElement` | Yes | - | Item renderer |
| keyExtractor | `(item: T, index: number) => string` | Yes | - | Unique key extractor |
| pageSize | `number` | No | `DEFAULT_PAGE_SIZE` | Items per page |
| isLoading | `boolean` | No | `false` | Show loading spinner |
| emptyMessage | `string` | No | `'No items found'` | Message when data is empty |
| showPagination | `boolean` | No | `true` | Show pagination controls |
| listHeaderComponent | `ComponentType \| ReactElement` | No | - | FlatList header |
| listFooterComponent | `ComponentType \| ReactElement` | No | - | FlatList footer |
| contentContainerStyle | `object` | No | - | FlatList content container style |

```tsx
<PaginatedList
  data={items}
  renderItem={(item) => <ItemRow item={item} />}
  keyExtractor={(item) => item.id}
  pageSize={10}
  isLoading={isLoading}
  emptyMessage={FM('items.noItems')}
/>
```
