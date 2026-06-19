// Bootstrap imports - must be first to configure environment before other modules load
import '../src/bootstrap/logBoxConfig';

import type { ReactElement } from 'react';
import React, { Suspense, useEffect } from 'react';

import { Platform } from 'react-native';

import { Stack, useRouter } from 'expo-router';

import { Provider, useSelector } from 'react-redux';

import { AuthProvider } from '../src/auth/AuthProvider';
import { AnalyticsErrorBoundary, ErrorBoundary } from '../src/components/ErrorBoundary';
import Notifier from '../src/components/Notifications/Notifier';
import FeedbackUiAdapter from '../src/components/Providers/FeedbackUiAdapter';
import LazyQueryProvider from '../src/components/Providers/LazyQueryProvider';
import TenantThemeConnector from '../src/components/Providers/TenantThemeConnector';
import { SEOHead } from '../src/components/Shared/SEOHead';
import { featureFlags } from '../src/config/featureFlags';
import TooltipOverlay from '../src/features/tooltipTour/components/TooltipOverlay';
import { TooltipProvider } from '../src/features/tooltipTour/components/TooltipProvider';
import { AnalyticsProvider, useAnalyticsIdentify, usePageTracking, useWebVitalsTracking } from '../src/lib/analytics';
import { useCustomDomainRedirect } from '../src/lib/customDomain/useCustomDomainRedirect';
import { initSentry, useSentryUser } from '../src/lib/monitoring';
import { setRedirectHandler } from '../src/lib/navigation';
import { setupTestNotificationApi } from '../src/lib/notifications';
import i18n from '../src/localization/i18n';
import { IOSAddToHomePrompt } from '../src/pwa/IOSAddToHomePrompt';
import { PWAInstallPrompt } from '../src/pwa/PWAInstallPrompt';
import { useIOSAddToHome } from '../src/pwa/useIOSAddToHome';
import { usePWAInstall } from '../src/pwa/usePWAInstall';
import { useServiceWorker } from '../src/pwa/useServiceWorker';
import { customInstance } from '../src/server/httpClient';
import { contentInstance } from '../src/server/httpClientContent';
import { identityInstance } from '../src/server/httpClientIdentity';
import { notificationInstance } from '../src/server/httpClientNotification';
import { paymentInstance } from '../src/server/httpClientPayment';
import { questionerInstance } from '../src/server/httpClientQuestioner';
import { registerMutators } from '../src/server/mutators';
import { reduxStore, type RootState } from '../src/store/reduxStore';
import ThemeProvider from '../src/theme/components/ThemeProvider';
import { logger } from '../src/utils/logger';

// Lazy-load CookieConsentBanner: only shown on first visit, returns null after consent
const CookieConsentBanner = React.lazy(async () => import('../src/components/CookieConsent/CookieConsentBanner'));

// Setup test notification API for E2E testing (only in non-production)
setupTestNotificationApi();

// Register HTTP client mutators for Orval-generated hooks
// NOTE: This MUST run synchronously before any component renders.
// Deferring via requestIdleCallback causes race conditions where API calls
// fire before HTTP clients are configured, breaking auth and data loading.
registerMutators({
  customInstance,
  identityInstance,
  questionerInstance,
  contentInstance,
  notificationInstance,
  paymentInstance,
});

// Initialise Sentry error monitoring. No-op when DSN is empty (dev/test).
initSentry();

/** Headless component that runs analytics side-effects (page tracking + user identity). */
const AnalyticsEffects = (): null => {
  usePageTracking();
  useAnalyticsIdentify();
  useWebVitalsTracking();
  return null;
};

/** Headless component that keeps the Sentry user scope in sync with auth state. */
const SentryEffects = (): null => {
  useSentryUser();
  return null;
};

const InnerApp = (): ReactElement => {
  const locale = useSelector((s: RootState) => s.ui.locale);
  const router = useRouter();
  const enablePwaPrompts = (process.env.EXPO_PUBLIC_ENABLE_PWA_PROMPTS ?? 'false') === 'true';
  const shouldShowInstallPrompts = enablePwaPrompts && featureFlags.enableInstallPrompt && Platform.OS === 'web';

  // Register service worker on web; the hook internally guards by platform and flag
  useServiceWorker();

  // Custom-domain resolve-glue: on a tenant's bring-your-own host, resolve → public menu.
  useCustomDomainRedirect(router);

  // Install prompts
  const { showInstallPrompt, handleInstall, closePrompt } = usePWAInstall();
  const { showIOSPrompt, closeIOSPrompt } = useIOSAddToHome();

  useEffect(() => {
    // register redirect handler for native apps so non-UI code can navigate
    setRedirectHandler((p: string) => {
      try {
        router.replace(p);
      } catch (routerError) {
        logger.warn('_layout', 'Failed to redirect via router', routerError);
      }
    });
  }, [router]);

  useEffect(() => {
    if (locale === '') return;
    i18n.changeLanguage(locale).catch((e: unknown) => logger.warn('_layout', 'Failed to set language', e));
  }, [locale]);

  // Ensure a manifest link exists even if +html.tsx isn't applied (dev safety net)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const existing = document.querySelector('link[rel="manifest"]');
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
      logger.debug('_layout', 'Injected manifest link /manifest.json');
    }

    // Remove post-build loading spinner once React has mounted
    const FADE_DURATION_MS = 200;
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = `opacity ${FADE_DURATION_MS}ms`;
      setTimeout(() => { loader.style.display = 'none'; }, FADE_DURATION_MS);
    }
  }, []);

  return (
    <FeedbackUiAdapter>
      <LazyQueryProvider>
      <TenantThemeConnector />
      <AuthProvider>
        <AnalyticsProvider>
          <AnalyticsErrorBoundary>
            <TooltipProvider>
              <AnalyticsEffects />
              <SentryEffects />
              <SEOHead />
              <Notifier />
              <Stack screenOptions={{ headerShown: false }} />
              <TooltipOverlay />
              {shouldShowInstallPrompts ? (
                <>
                  <PWAInstallPrompt visible={showInstallPrompt} onCancel={closePrompt} onInstall={handleInstall} />
                  <IOSAddToHomePrompt visible={showIOSPrompt} onClose={closeIOSPrompt} />
                </>
              ) : null}
              <Suspense>
                <CookieConsentBanner />
              </Suspense>
            </TooltipProvider>
          </AnalyticsErrorBoundary>
        </AnalyticsProvider>
      </AuthProvider>
      </LazyQueryProvider>
    </FeedbackUiAdapter>
  );
};

const RootLayout = (): ReactElement => {
  return (
    <Provider store={reduxStore}>
      <ErrorBoundary>
        <ThemeProvider>
          <InnerApp />
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
};

export default RootLayout;
