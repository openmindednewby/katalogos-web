# Performance Optimization Plan: Bundle Size & Lighthouse 100

## Status: TODO

## Problem Statement

Two critical performance issues need to be addressed:

1. **Bundle Size**: 648 kB gzipped (exceeds 500 kB limit by 148 kB)
2. **Lighthouse Score**: 57/100 (target: 100/100)

### Current Lighthouse Breakdown

| Metric | Value | Score | Weight | Issue |
|--------|-------|-------|--------|-------|
| FCP (First Contentful Paint) | 804ms | 100 | 10% | OK |
| SI (Speed Index) | 4,401ms | 74 | 10% | Needs improvement |
| LCP (Largest Contentful Paint) | 7,253ms | 5 | 25% | **CRITICAL** |
| TBT (Total Blocking Time) | 686ms | 44 | 30% | **HIGH PRIORITY** |
| CLS (Cumulative Layout Shift) | 0.02 | 100 | 25% | OK |

**Root Causes:**
- LCP (5/100): Large JavaScript bundle blocking render, heavy initial load
- TBT (44/100): Too much JavaScript executing on main thread
- SI (74/100): Slow visual progression due to large bundle

---

## Solution Architecture

### Phase 1: Lazy Loading (Bundle Size Fix)

**Goal:** Reduce initial bundle from 648 kB to <500 kB by lazy loading heavy components.

#### 1.1 Lazy Load react-native-paper Components (~157 kB savings)

The Styling components in `src/components/OnlineMenus/Styling/` use react-native-paper and add ~157 kB. These are only needed when editing menu styles.

**Implementation:**

```typescript
// src/components/OnlineMenus/Styling/index.ts
import { lazy } from 'react';

export const GlobalStylingTab = lazy(() => import('./GlobalStylingTab'));
export const ImportExportButtons = lazy(() => import('./ImportExportButtons'));
export const PriceStyleControls = lazy(() => import('./PriceStyleControls'));
export const PriceStyleInputControls = lazy(() => import('./PriceStyleInputControls'));
export const TypographyMenuPicker = lazy(() => import('./TypographyMenuPicker'));
```

**Usage with Suspense:**
```typescript
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

<Suspense fallback={<ActivityIndicator />}>
  <GlobalStylingTab {...props} />
</Suspense>
```

#### 1.2 Route-Based Code Splitting

expo-router supports automatic code splitting. Ensure heavy routes are isolated:

```
app/
├── (auth)/           # Auth routes - small bundle
├── (protected)/      # Protected routes
│   ├── menus/        # Menu management (heavy - uses Styling components)
│   ├── quiz-*/       # Quiz features
│   └── ...
└── public/           # Public routes - should be lightest
```

**Action Items:**
- [ ] Move all Styling imports behind lazy boundaries
- [ ] Create loading fallback components
- [ ] Verify bundle splitting with `npx expo export --platform web`

#### 1.3 Dynamic Imports for Heavy Libraries

```typescript
// Instead of:
import { SegmentedButtons } from 'react-native-paper';

// Use dynamic import when needed:
const loadPaperComponents = async () => {
  const { SegmentedButtons, Menu, Switch, Button } = await import('react-native-paper');
  return { SegmentedButtons, Menu, Switch, Button };
};
```

---

### Phase 2: LCP Optimization (Score 5 → 90+)

**Goal:** Reduce LCP from 7,253ms to <2,500ms

#### 2.1 Critical CSS Inlining

Add critical CSS to the HTML template to render above-the-fold content immediately.

**File:** `app/+html.tsx`

```typescript
export default function Html({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS for initial render */
          body { margin: 0; font-family: system-ui; background: #fff; }
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
        `}} />
        {/* Preload critical fonts */}
        <link rel="preload" href="/fonts/main.woff2" as="font" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### 2.2 Preload Critical Resources

```html
<!-- In +html.tsx -->
<link rel="preload" as="script" href="/_expo/static/js/web/entry-*.js" />
<link rel="preconnect" href="https://identity.dloizides.com" />
<link rel="dns-prefetch" href="https://identity.dloizides.com" />
```

#### 2.3 Optimize LCP Element

Identify the LCP element (usually the largest image or text block) and optimize:

- Use `loading="eager"` for LCP images
- Use `fetchpriority="high"` for critical resources
- Ensure LCP element renders without JavaScript

#### 2.4 Server-Side Rendering (SSR) Consideration

For public routes (`/public/menu/[id]`), consider:
- Static generation at build time
- Edge rendering for dynamic content

---

### Phase 3: TBT Optimization (Score 44 → 90+)

**Goal:** Reduce TBT from 686ms to <200ms

#### 3.1 Break Up Long Tasks

Use `requestIdleCallback` or `setTimeout` to break up heavy initialization:

```typescript
// src/store/reduxStore.ts
async function initReduxStore(): Promise<void> {
  // Break initialization into smaller chunks
  await new Promise(resolve => setTimeout(resolve, 0));
  const persisted = await loadPersistedState(persistConfig);

  await new Promise(resolve => setTimeout(resolve, 0));
  restoreAuthFromPersistedState(persisted.auth);

  // ... etc
}
```

#### 3.2 Web Workers for Heavy Computation

Move heavy computations off the main thread:

```typescript
// src/workers/menuStyleWorker.ts
self.onmessage = (e) => {
  const { menuConfig } = e.data;
  const styles = generateMenuStyles(menuConfig);
  self.postMessage({ styles });
};
```

#### 3.3 Defer Non-Critical JavaScript

```typescript
// In app/_layout.tsx
useEffect(() => {
  // Defer non-critical initialization
  requestIdleCallback(() => {
    import('../lib/analytics').then(m => m.init());
    import('../lib/monitoring').then(m => m.init());
  });
}, []);
```

#### 3.4 Optimize React Rendering

- Use `React.memo()` for expensive components
- Use `useMemo()` and `useCallback()` appropriately
- Virtualize long lists with `FlashList` or `FlatList`

---

### Phase 4: Speed Index Optimization (Score 74 → 95+)

**Goal:** Improve visual progression speed

#### 4.1 Skeleton Screens

Show skeleton placeholders immediately:

```typescript
// src/components/Shared/SkeletonLoader.tsx
export function MenuListSkeleton() {
  return (
    <View>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.skeletonItem}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonText} />
        </View>
      ))}
    </View>
  );
}
```

#### 4.2 Progressive Loading

Load content in priority order:
1. Critical UI shell
2. Primary content
3. Secondary content
4. Analytics/tracking

#### 4.3 Image Optimization

- Use WebP format with JPEG fallback
- Implement responsive images with srcset
- Lazy load below-the-fold images
- Use blur-up placeholder technique

---

### Phase 5: Additional Optimizations

#### 5.1 Font Optimization

The MaterialCommunityIcons font is 1.31 MB. Options:
- Use subset of icons actually used
- Switch to icon SVGs for commonly used icons
- Use system fonts where possible

```typescript
// Create a custom icon component that uses SVGs
import MenuIcon from '../assets/icons/menu.svg';
export const Icon = ({ name }) => {
  const icons = { menu: MenuIcon, /* ... */ };
  return icons[name] || null;
};
```

#### 5.2 Tree Shaking Verification

Ensure proper tree shaking:

```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: true,
    },
  },
};
```

#### 5.3 Compression

Ensure gzip/brotli compression is enabled on the server:

```javascript
// lighthouserc.js - update startServerCommand
startServerCommand: 'npx serve dist -p 8082 --single --compress',
```

---

## Implementation Priority

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| P0 | Lazy load Styling components | -157 kB, fixes bundle limit | Medium |
| P0 | Critical CSS inlining | LCP -3000ms | Low |
| P1 | Break up long tasks | TBT -400ms | Medium |
| P1 | Skeleton screens | SI +15 points | Medium |
| P2 | Preload critical resources | LCP -1000ms | Low |
| P2 | Image optimization | LCP -500ms | Medium |
| P3 | Font subsetting | -500 kB+ | High |
| P3 | Web workers | TBT -100ms | High |

---

## Success Criteria

- [ ] Bundle size < 500 kB gzipped (initial load)
- [ ] Lighthouse Performance score >= 90
- [ ] LCP < 2,500ms
- [ ] TBT < 200ms
- [ ] SI < 3,000ms
- [ ] FCP maintained < 1,000ms
- [ ] CLS maintained < 0.1

---

## Verification Commands

```bash
# Build and check bundle size
npx expo export --platform web && npm run deps:bundle-size

# Run Lighthouse audit
npm run lighthouse

# View detailed Lighthouse reports
npm run lighthouse:open

# Analyze bundle composition (if webpack analyzer added)
npm run analyze
```

---

## Files to Modify

### Phase 1 (Bundle Size)
- `src/components/OnlineMenus/Styling/index.ts` - Create lazy exports
- `src/components/OnlineMenus/MenuEditorModal.tsx` - Add Suspense boundaries
- `src/components/OnlineMenus/FullMenuEditor.tsx` - Add Suspense boundaries

### Phase 2 (LCP)
- `app/+html.tsx` - Add critical CSS and preloads
- `app/_layout.tsx` - Optimize initial render

### Phase 3 (TBT)
- `src/store/reduxStore.ts` - Break up initialization
- `app/_layout.tsx` - Defer non-critical code

### Phase 4 (SI)
- `src/components/Shared/SkeletonLoader.tsx` - Create skeleton components
- Various list components - Add skeleton fallbacks

---

## References

- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [Expo Router Code Splitting](https://docs.expo.dev/router/reference/async-routes/)
- [Core Web Vitals](https://web.dev/vitals/)
