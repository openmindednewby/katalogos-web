/** Tell the service worker to evict cached public-menu responses so the editor's */
export function purgePublicMenuCache(externalId?: string): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const controller = navigator.serviceWorker.controller;
  if (!controller) return;
  controller.postMessage({ type: 'PURGE_PUBLIC_MENU', externalId });
}
