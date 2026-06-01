/**
 * Login route — unified-auth Phase 5 cutover.
 *
 * Renders the shared themeable `<LoginForm>` from `@dloizides/auth-web`,
 * mapping the tenant theme into an `AuthTheme` via {@link mapAppThemeToAuthTheme}.
 * Credentials are POSTed to the same-origin `bff-katalogos`, which terminates
 * auth server-side and sets the httpOnly session cookie — no Keycloak redirect.
 *
 * "Forgot password?" (rendered by `<LoginForm>` via `onForgotPassword`) opens
 * `<ForgotPasswordModal>`, which submits via `bffAuthClient.forgotPassword`
 * directly — no react-query, so it works on this provider-less login route.
 * The old "task #23" block is resolved: Bff.AspNetCore 1.2.5 forwards
 * `resetUrlTemplate`.
 *
 * `LoginForm.onSuccess` fires after the BFF returns the user. Three side
 * effects must run there: (1) reflect the new session into Redux via
 * `applyBffSession` — `<LoginForm>` calls `bffAuthClient.login` directly and
 * bypasses the AuthProvider's `loginWithPassword`, so without this the rest of
 * the app stays unaware of the session until a page reload re-bootstraps from
 * `/bff/me`; (2) warm the dashboard data cache so it's hot when the new route
 * mounts; (3) route by role via `resolvePostLoginDestination`.
 */
import React, { useEffect, useMemo, useState } from 'react';

import { Platform, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { LoginForm } from '@dloizides/auth-web';


import { useAuth } from '../../src/auth/AuthProvider';
import { mapAppThemeToAuthTheme } from '../../src/auth/authThemeMapping';
import { bffAuthClient } from '../../src/auth/bffClient';
import { resolvePostLoginDestination } from '../../src/auth/postLoginRoutes';
import { ForgotPasswordModal } from '../../src/components/Auth/ForgotPasswordModal';
import SaveButton from '../../src/components/Buttons/SaveButton';
import { preloadProtectedRoutes } from '../../src/config/routePreloader';
import { prefetchDashboardData } from '../../src/features/dashboard/utils/prefetchDashboardData';
import { notifySignOut } from '../../src/lib/notifications';
import { FM } from '../../src/localization/helpers';
import { usePWAInstall } from '../../src/pwa/usePWAInstall';
import { STORAGE_KEYS } from '../../src/shared/constants';
import { useTheme } from '../../src/theme/hooks/useTheme';
import themeStyles from '../../src/theme/utils/styles';

import type { BffUser } from '@dloizides/auth-client';

const PWA_PROMPTS_FLAG = (process.env.EXPO_PUBLIC_ENABLE_PWA_PROMPTS ?? 'false') === 'true';

// Styles declared up front so they're in scope for the component below — the
// ESLint config flags use-before-define for module-level constants.
const styles = StyleSheet.create({
  pwa: {
    marginTop: 16,
    width: '100%',
    maxWidth: 460,
  },
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  routing: {
    marginTop: 16,
  },
});

/**
 * Clear stale auth state from session/local storage on `/login` mount. Visiting
 * the login page should always wipe any leftover persisted user state to avoid
 * redirect loops + make logout behaviour deterministic for E2E. Pre-existing
 * effect, preserved verbatim from the legacy page.
 */
function useClearStaleAuthStorageOnMount(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_PERSIST);
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      // sessionStorage may be unavailable (private mode etc.) — ignore.
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_PERSIST);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch {
      // localStorage may be unavailable — ignore.
    }
  }, []);
}

/**
 * On the first /login render after a forced sign-out (session-expired event),
 * surface a toast so the user understands why they're here. The flag is set by
 * `AuthProvider.logout()`'s cleanup path. Pre-existing, preserved.
 */
function useSessionExpiredNotice(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const wasSessionExpired = sessionStorage.getItem(STORAGE_KEYS.SESSION_EXPIRED);
      if (wasSessionExpired === 'true') {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRED);
        notifySignOut(FM('errors.sessionExpired'));
      }
    } catch {
      // ignore
    }
  }, []);
}

const LoginScreen = (): React.ReactElement => {
  const { applyBffSession, loading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const { showInstallPrompt, handleInstall, isInstalled } = usePWAInstall();

  const [routing, setRouting] = useState<boolean>(false);
  const [forgotVisible, setForgotVisible] = useState<boolean>(false);

  useClearStaleAuthStorageOnMount();
  useSessionExpiredNotice();

  // Preload protected route page chunks in the background while the user
  // enters credentials. Uses requestIdleCallback internally — zero main-thread
  // blocking. Pre-existing, preserved.
  useEffect(() => {
    preloadProtectedRoutes();
  }, []);

  // Map the tenant `ResolvedTheme` onto `AuthTheme` once per theme change.
  // Memoised so `<LoginForm>` doesn't see a new theme reference on every render
  // (which would defeat its `useMemo` chains downstream).
  const authTheme = useMemo(() => mapAppThemeToAuthTheme(theme), [theme]);

  const handleSignedIn = (user: BffUser): void => {
    setRouting(true);
    // Bridge the new session into Redux so other components see isLoggedIn=true
    // immediately — see {@link AuthContextType.applyBffSession}.
    applyBffSession(user);
    // Warm the dashboard data cache; fire-and-forget — failures are OK because
    // the dashboard will refetch on mount anyway.
    prefetchDashboardData();
    router.replace(resolvePostLoginDestination(user));
  };

  if (loading) return <Text style={themeStyles.loadingText}>{FM('loading')}</Text>;

  const showPwaInstallPrompt =
    PWA_PROMPTS_FLAG && Platform.OS === 'web' && showInstallPrompt && !isInstalled;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]} testID="katalogos-login-page">
      <LoginForm
        client={bffAuthClient}
        theme={authTheme}
        onForgotPassword={(): void => setForgotVisible(true)}
        onSignUp={(): void => router.push('/(auth)/register')}
        onSuccess={handleSignedIn}
      />

      <ForgotPasswordModal
        theme={authTheme}
        visible={forgotVisible}
        onClose={(): void => setForgotVisible(false)}
      />

      {routing ? (
        <Text style={[themeStyles.loadingText, styles.routing]} testID="katalogos-login-routing">
          {FM('loading')}
        </Text>
      ) : null}

      {showPwaInstallPrompt ? (
        <View style={styles.pwa}>
          <SaveButton title={FM('pwa.install')} onPress={handleInstall} />
        </View>
      ) : null}
    </View>
  );
};

export default LoginScreen;
