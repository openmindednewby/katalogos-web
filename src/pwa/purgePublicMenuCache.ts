/**
 * Tell the service worker to evict cached public-menu responses so the editor's
 * own preview (and any open public tab it controls) refreshes immediately after a
 * save/activate — without waiting for the next navigation.
 *
 * No-op off-web, when no SW is registered, or when no SW controls the page yet.
 * Cross-visitor freshness is already handled by the SW's network-first strategy;
 * this is the same-session immediacy nicety.
 */
export function purgePublicMenuCache(externalId?: string): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const controller = navigator.serviceWorker.controller;
  if (!controller) return;
  controller.postMessage({ type: 'PURGE_PUBLIC_MENU', externalId });
}
