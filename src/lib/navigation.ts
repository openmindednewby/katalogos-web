/** Delay in ms before checking if navigation occurred */
const NAVIGATION_CHECK_DELAY_MS = 150;

let redirectHandler: ((path: string) => void) | null = null;
const queuedRedirects: string[] = [];

function normalizeExpoRouterPath(path: string): string {
  const normalized = path.replace(/\/\([^/]+\)/g, '');
  return normalized === '' ? '/' : normalized;
}

/** Get current location string on web */
function getCurrentLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** Schedule fallback navigation if router didn't change location */
function scheduleFallbackNavigation(before: string, normalized: string): void {
  setTimeout(() => {
    try {
      const after = getCurrentLocation();
      if (after === before) window.location.replace(normalized);
    } catch { /* ignore */ }
  }, NAVIGATION_CHECK_DELAY_MS);
}

/** Try to navigate using window.location */
function tryWindowNavigation(normalized: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.location.replace(normalized);
    return true;
  } catch { return false; }
}

export function setRedirectHandler(h: (path: string) => void): void {
  redirectHandler = h;
  while (queuedRedirects.length > 0) {
    const p = queuedRedirects.shift();
    try {
      if (typeof p === 'string' && p.length > 0) h(normalizeExpoRouterPath(p));
    } catch { /* swallow; handler may still not be ready */ }
  }
}

export function redirectTo(path: string): void {
  const normalized = normalizeExpoRouterPath(path);
  if (redirectHandler) {
    const before = getCurrentLocation();
    try {
      redirectHandler(normalized);
      if (typeof before === 'string') scheduleFallbackNavigation(before, normalized);
      return;
    } catch { /* fallthrough to window */ }
  }
  if (tryWindowNavigation(normalized)) return;
  queuedRedirects.push(normalized);
}
