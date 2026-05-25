/**
 * Programmatic cache management for public menu data.
 * Provides utilities to clear cached menu responses from the service worker cache.
 *
 * The service worker itself handles caching strategy (stale-while-revalidate).
 * This module provides programmatic control for clearing stale data.
 */

/** Cache name used by the service worker for public menu API responses. */
const MENU_API_CACHE_NAME = 'public-menu-api-v1';

/** Cache name used by the service worker for static assets. */
const STATIC_ASSETS_CACHE_NAME = 'static-assets-v1';

/** Returns true when the Cache API is available. */
function isCacheApiAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'caches' in window;
}

/**
 * Clears all cached public menu API responses.
 * Call this when you want to force-refresh menu data on next load.
 *
 * @returns true if the cache was successfully deleted, false otherwise.
 */
export async function clearMenuCache(): Promise<boolean> {
  if (!isCacheApiAvailable()) return false;

  try {
    return await caches.delete(MENU_API_CACHE_NAME);
  } catch {
    return false;
  }
}

/**
 * Clears all service worker caches (menu API + static assets).
 * Use sparingly — this forces re-download of all cached resources.
 *
 * @returns true if at least one cache was deleted.
 */
export async function clearAllCaches(): Promise<boolean> {
  if (!isCacheApiAvailable()) return false;

  try {
    const results = await Promise.all([
      caches.delete(MENU_API_CACHE_NAME),
      caches.delete(STATIC_ASSETS_CACHE_NAME),
    ]);
    return results.some(Boolean);
  } catch {
    return false;
  }
}

/**
 * Gets the names of caches managed by the menu service worker.
 * Useful for diagnostics.
 */
export function getManagedCacheNames(): string[] {
  return [MENU_API_CACHE_NAME, STATIC_ASSETS_CACHE_NAME];
}
