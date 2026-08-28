/**
 * PWA service-worker + manifest config for katalogos-web (online menus platform).
 *
 * Consumed by `@dloizides/pwa-sw`'s `pwa-sw-gen` CLI (see the `generate:sw`
 * script). The package owns the caching STRATEGY (network-first for the public
 * API, cache-first for static assets, network-only for admin/auth + versioned
 * cache cleanup + purge handler); this file owns katalogos's CONFIG.
 *
 * `public/service-worker.js`, `public/sw-register.js` and `public/manifest.json`
 * are GENERATED from this file — do not hand-edit them; edit this config and
 * re-run `npm run generate:sw`.
 *
 * WHY katalogos needs this (the zombie-SW defect): katalogos-web historically
 * shipped NO managing service worker, so `/sw.js` fell through to the SPA
 * catch-all HTML. Returning visitors were stranded on a stale SW from an old
 * build — a hard refresh could not evict it. This worker stamps a UNIQUE
 * per-build BUILD_VERSION, so every deploy ships a byte-different SW → the
 * browser installs it → its `activate` evicts the previous build's caches.
 */
module.exports = {
  serviceWorker: {
    // Build id for the versioned cache key. Sourced from the SAME id katalogos
    // stamps into its bundle (EXPO_PUBLIC_BUILD_VERSION), so the build footer and
    // the SW cache key agree — one id, both places. When unset (a plain local
    // `generate:sw`), pwa-sw-gen falls back to PWA_BUILD_VERSION and finally to
    // Date.now(), so each build stays unique.
    buildVersion: process.env.EXPO_PUBLIC_BUILD_VERSION || undefined,
    // Bump the `-v2` suffix on a deploy that must evict stale entries.
    apiCacheName: 'katalogos-public-api-v2',
    staticCacheName: 'katalogos-static-assets-v1',
    // Public, cacheable reads only (katalogos's unauthenticated public menu
    // endpoints). Network-first: the browser always prefers a fresh fetch and
    // only serves the cached copy offline — so this never serves stale menus.
    publicApiPathMatchers: ['/public/'],
    purgeMessageType: 'PURGE_PUBLIC_CACHE',
    // Root-scoped app: scope + swUrl take the package defaults ('/' + '/service-worker.js').
    // The generated sw-register.js polls for a new worker on this interval (+ on load
    // and refocus) and reloads once on controllerchange — the auto-update-on-deploy path.
    scope: '/',
    swUrl: '/service-worker.js',
    updateCheckIntervalMs: 60000,
    // katalogos ALSO registers a push-notifications SW (/sw-notifications.js) at
    // scope '/' (RealTimeNotificationProvider in the protected layout). Two full
    // workers at one scope hand control back and forth; reload-on-controllerchange
    // would turn that into a RELOAD LOOP on logged-in pages. Off here (matches
    // erevna, which has the same 2nd SW): the new build's SW still installs +
    // evicts stale caches on public pages (the actual fix); only the open-tab
    // auto-reload is skipped. See @dloizides/pwa-sw 1.2.0.
    reloadOnControllerChange: false,
  },
  manifest: {
    name: 'Katalogos',
    shortName: 'Katalogos',
    description: 'Install Katalogos to build and manage digital menus with QR codes and real-time updates.',
    themeColor: '#b04632',
    backgroundColor: '#f4ede2',
    categories: ['business', 'food', 'productivity'],
    startUrl: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en-US',
    dir: 'ltr',
    id: '/',
    icons: [
      { src: '/icons/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  },
};
