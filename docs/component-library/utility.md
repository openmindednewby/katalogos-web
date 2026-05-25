# Utility Components

## FeatureGate

Gates content behind a feature flag. Redirects to the dashboard when the flag is disabled.

**Import**: `import FeatureGate from '@/components/Shared/FeatureGate'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| flag | `keyof FeatureFlags` | Yes | - | Feature flag key to check |
| children | `ReactElement` | Yes | - | Content to render when enabled |

```tsx
<FeatureGate flag="enableThemeEditor">
  <ThemeEditorPage />
</FeatureGate>
```

**Behavior**: When the flag is disabled, shows a centered `ActivityIndicator` while redirecting to `Routes.DASHBOARD`.

---

## ErrorBoundary

React error boundary that catches JavaScript errors in child components. Logs errors via `loggingService` and shows retry UI.

**Import**: `import { ErrorBoundary } from '@/components/ErrorBoundary'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | `ReactNode` | Yes | - | Content to wrap |
| fallback | `ReactNode` | No | - | Custom fallback UI (overrides default) |
| onError | `(error: Error, errorInfo: ErrorInfo) => void` | No | - | Error callback |

```tsx
// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error) => trackError(error)}>
  <YourComponent />
</ErrorBoundary>
```

**Default fallback UI**: Shows error title, message, error details (in `__DEV__` only), and a "Try Again" button that resets the boundary.

**Accessibility**: Retry button has `accessibilityRole="button"`, `accessibilityHint`, `accessibilityLabel`.

---

## PlaceholderPage

Coming soon placeholder for unimplemented pages. Shows a title and "Coming soon" message.

**Import**: `import PlaceholderPage from '@/components/Shared/PlaceholderPage'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| titleKey | `string` | Yes | - | Translation key for the page title |
| titleFallback | `string` | No | - | Deprecated: unused fallback |

```tsx
<PlaceholderPage titleKey="settings.billing" />
```

---

## SEOHead

Manages meta tags for SEO and social sharing using expo-router's `Head` component. Sets Open Graph, Twitter Card, and standard meta tags.

**Import**: `import SEOHead from '@/components/Shared/SEOHead'`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | No | - | Page title (appended with site name) |
| description | `string` | No | Default SEO description | Page description |
| url | `string` | No | `'https://app.menuflow.com'` | Canonical URL |
| image | `string` | No | `'/icons/logo-512.png'` | Social sharing image URL |
| noIndex | `boolean` | No | `false` | Prevent search engine indexing |

```tsx
<SEOHead
  title="Menu Editor"
  description="Edit and customize your digital menu"
  noIndex
/>
```

**Note**: This is a web-only component that injects `<meta>` tags into the document `<head>`.
