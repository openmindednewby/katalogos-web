/**
 * Service Worker for public menu offline support.
 *
 * Caching strategies:
 * - Public menu API responses: stale-while-revalidate with 24h max age
 * - Static assets (JS, CSS, images): cache-first
 * - Admin API calls: network-only (never cached)
 *
 * Cache names are versioned so old caches are cleaned up on activation.
 */

var MENU_API_CACHE = 'public-menu-api-v1';
var STATIC_CACHE = 'static-assets-v1';
var MANAGED_CACHES = [MENU_API_CACHE, STATIC_CACHE];

/** 24 hours in milliseconds. */
var MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

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
 * Check if a cached response is still fresh (within 24h).
 */
function isCacheFresh(response) {
  var dateHeader = response.headers.get('date') || response.headers.get('sw-cached-at');
  if (!dateHeader) return false;

  var cachedTime = new Date(dateHeader).getTime();
  if (isNaN(cachedTime)) return false;

  return (Date.now() - cachedTime) < MAX_CACHE_AGE_MS;
}

/**
 * Stale-while-revalidate strategy for public menu API.
 * Returns cached response immediately (if available and fresh),
 * then fetches fresh data in the background to update the cache.
 */
function staleWhileRevalidate(event) {
  event.respondWith(
    caches.open(MENU_API_CACHE).then(function(cache) {
      return cache.match(event.request).then(function(cachedResponse) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          // Only cache successful responses
          if (networkResponse && networkResponse.ok) {
            // Clone the response and add a timestamp header
            var responseToCache = networkResponse.clone();
            var headers = new Headers(responseToCache.headers);
            headers.set('sw-cached-at', new Date().toISOString());

            return responseToCache.blob().then(function(body) {
              var cachedResp = new Response(body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers,
              });
              cache.put(event.request, cachedResp);
              return networkResponse;
            });
          }
          return networkResponse;
        }).catch(function() {
          // Network failed — return cached response or undefined
          return cachedResponse;
        });

        // Return cached response if fresh, otherwise wait for network
        if (cachedResponse && isCacheFresh(cachedResponse)) {
          // Still revalidate in the background
          fetchPromise.catch(function() { /* background revalidation failed, ignore */ });
          return cachedResponse;
        }

        // No fresh cache — wait for network, fall back to stale cache
        return fetchPromise.then(function(response) {
          return response || cachedResponse;
        });
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

self.addEventListener('fetch', function(event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip admin/protected API calls
  if (isAdminApiRequest(request.url)) return;

  // Public menu API: stale-while-revalidate
  if (isPublicMenuApiRequest(request.url)) {
    staleWhileRevalidate(event);
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(request.url)) {
    cacheFirst(event);
    return;
  }

  // All other requests: let the browser handle normally
});
