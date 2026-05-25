const PRELOAD_IDLE_TIMEOUT_MS = 2000;
const PRELOAD_FALLBACK_DELAY_MS = 100;
const HEAVY_MODULE_DELAY_MS = 3000;

/**
 * Preload critical framework chunks that gate the first protected render.
 * These must be cached before navigation so the Suspense boundary in
 * LazyQueryProvider resolves instantly.
 */
function preloadCriticalChunks(): void {
  import('@tanstack/react-query').catch(() => undefined);
  import('../lib/queryClient').catch(() => undefined);
}

/** Preload main application pages. */
function preloadMainPages(): void {
  import('../../app/(protected)/tenants/index').catch(() => undefined);
  import('../../app/(protected)/menus/index').catch(() => undefined);
  import('../../app/(protected)/users/index').catch(() => undefined);
  import('../../app/(protected)/quiz-templates/index').catch(() => undefined);
  import('../../app/(protected)/quiz-answers/index').catch(() => undefined);
  import('../../app/(protected)/quiz-active/index').catch(() => undefined);
  import('../../app/(protected)/quiz-active/QuizContent').catch(() => undefined);
  import('../../app/(protected)/quiz-active/ThankYouOverlay').catch(() => undefined);
  import('../../app/(protected)/notifications/index').catch(() => undefined);
  import('../../app/(protected)/analytics/index').catch(() => undefined);
  import('../../app/(protected)/analytics/menu/[id]').catch(() => undefined);
  import('../../app/(protected)/tenant-themes/index').catch(() => undefined);
  import('../../app/(protected)/showcase/native-forms').catch(() => undefined);
  import('../../app/(protected)/showcase/components').catch(() => undefined);
  import('../../app/(protected)/experiments/index').catch(() => undefined);
}

/** Preload settings and auxiliary pages. */
function preloadSettingsPages(): void {
  import('../../app/(protected)/settings/index').catch(() => undefined);
  import('../../app/(protected)/settings/notification-preferences').catch(() => undefined);
  import('../../app/(protected)/settings/privacy').catch(() => undefined);
  import('../../app/(protected)/settings/theme').catch(() => undefined);
  import('../../app/(protected)/settings/profile').catch(() => undefined);
  import('../../app/(protected)/settings/security').catch(() => undefined);
  import('../../app/(protected)/settings/preferences').catch(() => undefined);
  import('../../app/(protected)/settings/billing').catch(() => undefined);
  import('../../app/(protected)/settings/business-profile').catch(() => undefined);
  import('../../app/(protected)/settings/custom-domain').catch(() => undefined);
  import('../../app/(protected)/settings/locations').catch(() => undefined);
  import('../../app/(protected)/settings/white-label').catch(() => undefined);
  import('../../app/(protected)/settings/team').catch(() => undefined);
  import('../../app/(protected)/team/accept/[token]').catch(() => undefined);
}

/**
 * Preload heavy library modules that cause visible delays on first use.
 * These are loaded with a secondary idle callback to avoid competing
 * with the critical route preloads.
 */
function preloadHeavyModules(): void {
  // PDF export (jsPDF ~200 KB)
  import('jspdf').catch(() => undefined);

  // Excel file parsing for CSV/XLSX import
  import('read-excel-file/browser').catch(() => undefined);

  // QR code renderer
  import('react-qr-code').catch(() => undefined);

  // Menu editor styling sub-components (color picker, typography, layout)
  import('../components/OnlineMenus/Styling/components/GlobalStylingTab').catch(() => undefined);
  import('../components/OnlineMenus/Styling/components/ColorSchemeEditor').catch(() => undefined);
  import('../components/OnlineMenus/Styling/components/TypographyEditor').catch(() => undefined);
  import('../components/OnlineMenus/Styling/components/BoxStyleEditor').catch(() => undefined);
  import('../components/OnlineMenus/Styling/components/HeaderEditor').catch(() => undefined);

  // Menu import modal
  import('../components/OnlineMenus/MenuImport/ImportMenuModal').catch(() => undefined);

  // Analytics charts
  import('../components/Analytics/components/MenuAnalyticsScreen').catch(() => undefined);
}

/**
 * Preloads all protected route page chunks in the background.
 * Uses requestIdleCallback to avoid blocking the main thread.
 * Call this when the login page mounts so chunks are cached by the time the user logs in.
 */
export function preloadProtectedRoutes(): void {
  if (typeof window === 'undefined') return; // SSR guard

  const preloadRoutes = (): void => {
    preloadCriticalChunks();
    preloadMainPages();
    preloadSettingsPages();
  };

  const scheduleHeavyModules = (): void => {
    if ('requestIdleCallback' in window)
      window.requestIdleCallback(preloadHeavyModules, { timeout: PRELOAD_IDLE_TIMEOUT_MS });
    else setTimeout(preloadHeavyModules, PRELOAD_FALLBACK_DELAY_MS);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadRoutes, { timeout: PRELOAD_IDLE_TIMEOUT_MS });
    setTimeout(scheduleHeavyModules, HEAVY_MODULE_DELAY_MS);
  } else {
    setTimeout(preloadRoutes, PRELOAD_FALLBACK_DELAY_MS);
    setTimeout(scheduleHeavyModules, HEAVY_MODULE_DELAY_MS);
  }
}
