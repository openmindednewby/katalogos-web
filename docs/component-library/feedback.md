# Feedback Components

## ConfirmDialog

Modal confirmation dialog with confirm/cancel actions. Supports destructive mode and loading state.

**Import**: `import ConfirmDialog from '@/components/Shared/ConfirmDialog'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| visible | `boolean` | Yes | - | Whether the dialog is visible |
| title | `string` | Yes | - | Dialog title |
| message | `string` | Yes | - | Dialog message body |
| onConfirm | `() => void` | Yes | - | Confirm callback |
| onCancel | `() => void` | Yes | - | Cancel callback |
| confirmLabel | `string` | No | `FM('common.confirm')` | Confirm button label |
| cancelLabel | `string` | No | `FM('common.cancel')` | Cancel button label |
| confirmDisabled | `boolean` | No | `false` | Disable confirm button |
| loading | `boolean` | No | `false` | Show loading spinner on confirm |
| destructive | `boolean` | No | `false` | Use error color for confirm button |

```tsx
<ConfirmDialog
  visible={showDelete}
  title={FM('templates.deleteTitle')}
  message={FM('templates.deleteMessage')}
  onConfirm={handleDelete}
  onCancel={handleCancelDelete}
  destructive
  loading={isDeleting}
/>
```

**Accessibility**: `role="dialog"`, `accessibilityViewIsModal`, buttons have `accessibilityHint`.

---

## ApiErrorModal

Modal for displaying API error events. Renders different content based on the error type (generic error, maintenance, upgrade prompt, feature gate).

**Import**: `import ApiErrorModal from '@/components/feedback/ApiErrorModal'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| event | `ModalEvent \| null` | Yes | - | Error event to display (null hides modal) |
| onDismiss | `() => void` | Yes | - | Dismiss callback |

```tsx
<ApiErrorModal
  event={errorEvent}
  onDismiss={handleDismissError}
/>
```

**Accessibility**: `role="dialog"`, `accessibilityViewIsModal`, close button has `accessibilityHint`.

---

## LoadingFallback

Spinner loading indicator for lazy-loaded components. Use with `React.lazy()` and `Suspense`.

**Import**: `import LoadingFallback from '@/components/Shared/Fallbacks/LoadingFallback'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| fullScreen | `boolean` | No | `false` | Show as full-screen loader (min 300px height) |
| size | `'small' \| 'large'` | No | `'large'` | Spinner size |

```tsx
<Suspense fallback={<LoadingFallback />}>
  <LazyComponent />
</Suspense>

// Full-screen variant
<LoadingFallback fullScreen />
```

**Accessibility**: `accessibilityRole="progressbar"`, `accessibilityLabel="Loading content"`.

---

## PageSkeleton

Shimmer skeleton loader for page content. Shows animated pulsing placeholders to improve perceived loading performance.

**Import**: `import PageSkeleton from '@/components/Shared/Fallbacks/PageSkeleton'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| rows | `number` | No | `5` | Number of skeleton rows |
| showHeader | `boolean` | No | `true` | Show header skeleton bar |
| variant | `'list' \| 'cards'` | No | `'list'` | Skeleton layout style |

```tsx
// List skeleton
<PageSkeleton rows={5} showHeader />

// Card skeleton
<PageSkeleton rows={3} variant="cards" />
```

**Accessibility**: `accessibilityState={{ busy: true }}`, `accessibilityLabel="Loading page content"`.
