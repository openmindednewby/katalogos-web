/**
 * Service Worker for public menu offline support.
 *
 * Caching strategies:
 * - Public menu API responses: NETWORK-FIRST (always fetch fresh when online;
 *   the cached copy is only an offline fallback). This guarantees a menu edit /
 *   activation is reflected on the next load for every visitor — the previous
 *   stale-while-revalidate(24h) served up to a day-old menu.
 * - Static assets (JS, CSS, images): cache-first.
 * - Admin API calls: network-only (never cached).
 *
 * The editor can also push a `{ type: 'PURGE_PUBLIC_MENU', externalId? }` message
 * to evict cached menus immediately (so its own preview refreshes mid-session).
 *
 * Cache names are versioned so old caches are cleaned up on activation. The menu
 * cache is v2 so the old 24h-stale entries are evicted on deploy.
 */

var MENU_API_CACHE = 'public-menu-api-v2';
var STATIC_CACHE = 'static-assets-v1';
var MANAGED_CACHES = [MENU_API_CACHE, STATIC_CACHE];

/**
 * Static asset file extensions eligible for cache-first strategy.
 */
var STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ico'];

/**
 * Check if a URL is a public menu API request.
 * Matches paths like /api/v1/public/menus/{id} or /public/menus/{id}.
 */
function isPublicMenuApiRequest(url) {
  var pathname = new URL(url).pathname;
  return pathname.includes('/public/menus/');
}

/**
 * Check if a URL is an admin/protected API request that should never be cached.
 */
function isAdminApiRequest(url) {
  var pathname = new URL(url).pathname;
  // Do not cache any API calls that are NOT public menu requests
  if (pathname.includes('/api/') && !pathname.includes('/public/')) return true;
  // Do not cache authentication endpoints
  if (pathname.includes('/realms/') || pathname.includes('/token')) return true;
  return false;
}

/**
 * Check if a URL points to a static asset based on file extension.
 */
function isStaticAsset(url) {
  var pathname = new URL(url).pathname.toLowerCase();
  for (var i = 0; i < STATIC_EXTENSIONS.length; i++) {
    if (pathname.endsWith(STATIC_EXTENSIONS[i])) return true;
  }
  return false;
}

/**
 * Network-first strategy for public menu API.
 * Always tries the network so edits are reflected immediately; on success the
 * response is cached (for offline). Only when the network fails do we serve the
 * cached copy, so a returning visitor never sees a stale menu while online.
 */
function networkFirst(event) {
  event.respondWith(
    caches.open(MENU_API_CACHE).then(function(cache) {
      return fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok) {
          var responseToCache = networkResponse.clone();
          var headers = new Headers(responseToCache.headers);
          headers.set('sw-cached-at', new Date().toISOString());
          return responseToCache.blob().then(function(body) {
            cache.put(event.request, new Response(body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers,
            }));
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(function() {
        // Offline / network error — fall back to the cached copy if present.
        return cache.match(event.request);
      });
    })
  );
}

/**
 * Cache-first strategy for static assets.
 * Serves from cache if available, otherwise fetches and caches.
 */
function cacheFirst(event) {
  event.respondWith(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.match(event.request).then(function(cachedResponse) {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
}

/**
 * Evict cached public-menu responses. With no externalId, clears the whole menu
 * cache; with one, only entries whose URL contains that id.
 */
function purgePublicMenu(externalId) {
  return caches.open(MENU_API_CACHE).then(function(cache) {
    if (!externalId) {
      return caches.delete(MENU_API_CACHE);
    }
    return cache.keys().then(function(requests) {
      return Promise.all(
        requests
          .filter(function(request) { return request.url.indexOf(externalId) !== -1; })
          .map(function(request) { return cache.delete(request); })
      );
    });
  });
}

// --- Lifecycle Events ---

self.addEventListener('install', function() {
  // Take control immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Clean up old caches that are not in our managed set
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) {
            // Delete caches that start with our prefixes but have old version numbers
            var isOurCache = name.startsWith('public-menu-api-') || name.startsWith('static-assets-');
            var isCurrent = MANAGED_CACHES.indexOf(name) !== -1;
            return isOurCache && !isCurrent;
          })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function(event) {
  var data = event.data || {};
  if (data.type === 'PURGE_PUBLIC_MENU') {
    event.waitUntil(purgePublicMenu(data.externalId));
  }
});

self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip admin/protected API calls
  if (isAdminApiRequest(request.url)) return;

  // Public menu API: network-first (fresh when online, cache as offline fallback)
  if (isPublicMenuApiRequest(request.url)) {
    networkFirst(event);
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(request.url)) {
    cacheFirst(event);
    return;
  }

  // All other requests: let the browser handle normally
});
