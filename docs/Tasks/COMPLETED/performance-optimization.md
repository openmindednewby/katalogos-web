# Performance Optimization

## Status: COMPLETED

## Problem Statement

The frontend production build had several optimization gaps despite a 99/100 Lighthouse score:
- **Cache TTL**: 0ms on all JS resources (content-hash filenames should enable long cache) -- score 50/100
- **Missing HTML optimizations**: The `+html.tsx` customizations (critical CSS, preconnect hints, loading spinner, SEO meta tags) were NOT being applied in the production `dist/index.html`
- **CLS**: 0.006 from blank white page while JS loads
- **CookieConsentBanner**: Eagerly imported in root layout despite only showing on first visit

## Baseline Metrics (Before - 2026-03-19)

| Metric | Value | Score |
|--------|-------|-------|
| Performance | 99/100 | Excellent |
| LCP | 0.9s | 97/100 |
| TBT | 0ms | 100/100 |
| FCP | 0.2s | 100/100 |
| CLS | 0.006 | 100/100 |
| Cache TTL | 0ms (7 resources) | 50/100 |
| Total transfer | 617 KB | 100/100 |

## After Metrics (2026-03-19)

| Metric | Value | Score | Change |
|--------|-------|-------|--------|
| Performance | 99/100 | Excellent | -- |
| LCP | 0.9s | 97/100 | -- |
| TBT | 0ms | 100/100 | -- |
| FCP | 0.2s | 100/100 | -- |
| CLS | 0 | 100/100 | IMPROVED (0.006 -> 0) |
| Cache TTL | 0 resources found | 100/100 | IMPROVED (50 -> 100) |
| Total transfer | 619 KB | 100/100 | -- |

## Root Causes Found

### 1. +html.tsx Not Applied in Production Build
`expo export --platform web` generates a plain SPA shell HTML that does NOT include `app/+html.tsx` customizations. The `+html.tsx` content only applies at client render time in dev mode.

### 2. No Cache Headers Configuration
`npx serve` (used by Lighthouse) served all assets with no-cache headers. Content-hashed JS files should have immutable caching.

### 3. CookieConsentBanner Eagerly Loaded
The `CookieConsentBanner` component was eagerly imported in the root `_layout.tsx` even though it only renders on first visit and returns null for returning users.

## Changes Made

### 1. Post-build HTML Injection Script (NEW)
**File**: `scripts/post-build-html.js`

Created a Node.js script that runs after `expo export` to inject into `dist/index.html`:
- Critical CSS (loading spinner styles, box-sizing reset, body styles)
- Preconnect/DNS-prefetch hints for API servers (identity, questioner)
- Full SEO meta tags (Open Graph, Twitter Card, canonical, robots)
- PWA meta tags (manifest, apple-touch-icon, app name)
- Loading spinner placeholder (shows immediately while JS loads)
- Service worker registration (deferred via requestIdleCallback)
- Loader removal script (fades out spinner after DOMContentLoaded)

### 2. Tiltfile Updated
**File**: `Tiltfile` (line 1400)

Updated `frontend-prod-build` command to chain the post-build script:
```
npx expo export --platform web --clear && node scripts/post-build-html.js
```

### 3. Cache Headers Configuration (NEW)
**File**: `public/serve.json`

Configured `serve` to set proper Cache-Control headers:
- `_expo/static/js/web/**`: `public, max-age=31536000, immutable` (1 year, content-hashed)
- `assets/**`: `public, max-age=31536000, immutable` (1 year)
- `icons/**`: `public, max-age=86400` (1 day)
- `manifest.json`: `public, max-age=3600` (1 hour)
- `service-worker.js`: `no-cache` (must always be fresh)

### 4. Lazy-loaded CookieConsentBanner
**File**: `app/_layout.tsx`

Changed `CookieConsentBanner` from eager import to `React.lazy()` with `Suspense` wrapper. This moves it to a separate 5.7KB chunk that loads after the main bundle.

### 5. Loading Spinner Cleanup in Root Layout
**File**: `app/_layout.tsx`

Added code in the root layout's mount effect to remove the post-build loading spinner with a fade-out animation when React has mounted.

## Verification Results

| Check | Result |
|-------|--------|
| `frontend-lint-fix` | PASS |
| `frontend-yagni` | PASS |
| `frontend-unit-tests` | PASS |
| `frontend-prod-build` | PASS |
| `frontend-lighthouse` | PASS (99/100 performance) |

## Files Modified
- `scripts/post-build-html.js` (NEW - 155 lines)
- `public/serve.json` (NEW - 58 lines)
- `app/_layout.tsx` (lazy CookieConsentBanner + spinner removal)
- `Tiltfile` (chained post-build script)
