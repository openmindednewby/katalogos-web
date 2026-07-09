/**
 * Login route — unified-auth Phase 5 cutover + unified-login Increment 3 Batch 3.
 *
 * Renders the shared themeable `<LoginForm>` from `@dloizides/auth-web`,
 * mapping the tenant theme into an `AuthTheme` via {@link mapAppThemeToAuthTheme}.
 * Credentials are POSTed to the same-origin `bff-katalogos`, which terminates
 * auth server-side and sets the httpOnly session cookie — no Keycloak redirect.
 *
 * Increment 3 Batch 3 adds two shared-package surfaces, both driven by the
 * methods + per-device state the BFF advertises via `GET /bff/config`
 * ({@link useBffLoginConfig}):
 *   - **Device-PIN unlock gate** — a returning, logged-OUT user whose device is
 *     remembered (`hasPin` + a `rememberedUsername`) sees a PIN-only screen
 *     ({@link DevicePinUnlockScreen}) instead of the `<LoginForm>`, unless they
 *     tap "sign in with password instead" (which bypasses the gate this visit).
 *   - **Passkey button** — when the BFF advertises the `passkey` method, a
 *     `<PasskeyLoginButton>` is shown below the form.
 *
 * Both shared components are react-query-FREE by design, so they are safe on
 * this route, which renders BEFORE the LazyQueryProvider activates — do NOT add
 * any react-query usage here.
 *
 * "Forgot password?" (rendered by `<LoginForm>` via `onForgotPassword`) opens
 * `<ForgotPasswordModal>`, which submits via `bffAuthClient.forgotPassword`
 * directly — no react-query, so it works on this provider-less login route.
 *
 * `LoginForm.onSuccess` (and the unlock gate's `onSignedIn`) fire after the BFF
 * returns the user. Three side effects must run there: (1) reflect the new
 * session into Redux via `applyBffSession`; (2) warm the dashboard data cache so
 * it's hot when the new route mounts; (3) route by role via
 * `resolvePostLoginDestination`.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Platform, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import {
  AuthScreen,
  PasskeyLoginButton,
  PreferredMethodHint,
  useBffLoginConfig,
  readCachedPreferredMethod,
  syncPreferredMethodFromServer,
  DEVICE_PIN_DEFAULT_DIGITS,
} from '@dloizides/auth-web';


import { useAuth } from '../../src/auth/AuthProvider';
import { mapAppThemeToAuthTheme } from '../../src/auth/authThemeMapping';
import { bffAuthClient } from '../../src/auth/bffClient';
import { BffLoginMethod } from '../../src/auth/BffLoginMethod';
import { claimBagToBffUser } from '../../src/auth/bffUserMapping';
import { resolvePostLoginDestination } from '../../src/auth/postLoginRoutes';
import { preferencesClient } from '../../src/auth/preferencesClient';
import {
  useDevicePinUnlockLabels,
  usePasskeyLoginLabels,
  usePreferredMethodHintLabels,
} from '../../src/auth/useAuthLabels';
import { DevicePinUnlockGate } from '../../src/components/Auth/DevicePinUnlockGate';
import { ForgotPasswordModal } from '../../src/components/Auth/ForgotPasswordModal';
import { LoginCredentialForms } from '../../src/components/Auth/LoginCredentialForms';
import SaveButton from '../../src/components/Buttons/SaveButton';
import { preloadProtectedRoutes } from '../../src/config/routePreloader';
import { prefetchDashboardData } from '../../src/features/dashboard/utils/prefetchDashboardData';
import { notifySignOut } from '../../src/lib/notifications';
import { FM } from '../../src/localization/helpers';
import { usePWAInstall } from '../../src/pwa/usePWAInstall';
import { STORAGE_KEYS } from '../../src/shared/constants';
import { useTheme } from '../../src/theme/hooks/useTheme';
import themeStyles from '../../src/theme/utils/styles';
import { isNotEmptyString } from '../../src/utils/is';

import type { BffUser } from '@dloizides/auth-client';
import type { DevicePinUnlockedUser } from '@dloizides/auth-web';

const PWA_PROMPTS_FLAG = (process.env.EXPO_PUBLIC_ENABLE_PWA_PROMPTS ?? 'false') === 'true';

/** App root — the passkey ceremony returns here and routes onward to dashboard. */
const PASSKEY_RETURN_URL = '/';

// Login card max width (dp) — matches Kefi's auth card. Passed to the shared
// `<AuthScreen>` composition, which owns the single card the auth controls share.
const LOGIN_CARD_MAX_WIDTH = 460;

// Styles declared up front so they're in scope for the component below — the
// ESLint config flags use-before-define for module-level constants.
//
// The card GROUPING that once had to be hand-rolled here (P1-04) is now provided
// by the shared `<AuthScreen>` from `@dloizides/auth-web`: it owns the centered,
// auto-height card surface (border/radius/padding/maxWidth) and the forms render
// `chromeless` INTO it. The only local styles left are the vertical spacing for
// the passkey / PWA / routing rows that sit below the credential form on the card.
const styles = StyleSheet.create({
  passkey: {
    marginTop: 16,
  },
  pwa: {
    marginTop: 16,
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
  const { config, loading: configLoading } = useBffLoginConfig(bffAuthClient);
  const unlockLabels = useDevicePinUnlockLabels();
  const passkeyLabels = usePasskeyLoginLabels();
  const preferredMethodHintLabels = usePreferredMethodHintLabels();

  const [routing, setRouting] = useState<boolean>(false);
  const [forgotVisible, setForgotVisible] = useState<boolean>(false);
  // The device-local cached preferred method (seeded after a prior login).
  // Read once on mount; drives the login-screen "you usually sign in with…" hint.
  const preferredMethod = useMemo<string | null>(() => readCachedPreferredMethod(), []);
  // When the returning user taps "sign in with password instead", drop the
  // device-PIN unlock gate for the rest of this visit and show the form.
  const [bypassDevicePin, setBypassDevicePin] = useState<boolean>(false);

  useClearStaleAuthStorageOnMount();
  useSessionExpiredNotice();

  // Preload protected route page chunks in the background while the user
  // enters credentials. Uses requestIdleCallback internally — zero main-thread
  // blocking. Pre-existing, preserved.
  useEffect(() => {
    preloadProtectedRoutes();
  }, []);

  // Map the tenant `ResolvedTheme` onto `AuthTheme` once per theme change.
  // Memoised so the auth components don't see a new theme reference on every
  // render (which would defeat their `useMemo` chains downstream).
  const authTheme = useMemo(() => mapAppThemeToAuthTheme(theme), [theme]);

  const handleSignedIn = useCallback(
    (user: BffUser): void => {
      setRouting(true);
      // Bridge the new session into Redux so other components see isLoggedIn=true
      // immediately — see {@link AuthContextType.applyBffSession}.
      applyBffSession(user);
      // Seed the device-local preferred-method cache from the server so the NEXT
      // visit's login hint reflects the user's cross-device choice. Fire-and-
      // forget — `syncPreferredMethodFromServer` never rejects (D5).
      syncPreferredMethodFromServer(preferencesClient).catch(() => undefined);
      // Warm the dashboard data cache; fire-and-forget — failures are OK because
      // the dashboard will refetch on mount anyway.
      prefetchDashboardData();
      router.replace(resolvePostLoginDestination(user));
    },
    [applyBffSession, router],
  );

  // The unlock screen hands back a claim bag (the `/bff/me` shape); narrow it to
  // a typed `BffUser` and route it through the same post-login path.
  const handleUnlocked = useCallback(
    (user: DevicePinUnlockedUser): void => {
      handleSignedIn(claimBagToBffUser(user));
    },
    [handleSignedIn],
  );

  if (loading) return <Text style={themeStyles.loadingText}>{FM('loading')}</Text>;

  const showPwaInstallPrompt =
    PWA_PROMPTS_FLAG && Platform.OS === 'web' && showInstallPrompt && !isInstalled;

  // Device-PIN unlock gate: a returning, logged-OUT user whose device is
  // remembered sees a PIN-only screen instead of the form, unless they chose
  // "password instead". `configLoading` gates it so the form doesn't flash first.
  const showDevicePinUnlock =
    !configLoading
    && !bypassDevicePin
    && config.deviceState.hasPin
    && isNotEmptyString(config.deviceState.rememberedUsername);

  if (showDevicePinUnlock)
    return (
      <DevicePinUnlockGate
        authTheme={authTheme}
        backgroundColor={theme.colors.background}
        digits={config.deviceState.pinDigits ?? DEVICE_PIN_DEFAULT_DIGITS}
        labels={unlockLabels}
        rememberedUsername={config.deviceState.rememberedUsername ?? ''}
        routing={routing}
        onSignedIn={handleUnlocked}
        onUsePassword={(): void => setBypassDevicePin(true)}
      />
    );

  const showPasskey = !configLoading && config.methods.includes(BffLoginMethod.Passkey);

  return (
    <>
      <AuthScreen
        cardTestID="katalogos-login-card"
        maxWidth={LOGIN_CARD_MAX_WIDTH}
        testID="katalogos-login-page"
        theme={authTheme}
      >
        <PreferredMethodHint
          labels={preferredMethodHintLabels}
          method={preferredMethod}
          testIdPrefix="katalogos"
          theme={authTheme}
        />

        <LoginCredentialForms
          methods={config.methods}
          theme={authTheme}
          onForgotPassword={(): void => setForgotVisible(true)}
          onSignUp={(): void => router.push('/(auth)/register')}
          onSuccess={handleSignedIn}
        />

        {showPasskey ? (
          <View style={styles.passkey}>
            <PasskeyLoginButton
              labels={passkeyLabels}
              returnUrl={PASSKEY_RETURN_URL}
              testIdPrefix="katalogos"
              theme={authTheme}
            />
          </View>
        ) : null}

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
      </AuthScreen>

      <ForgotPasswordModal
        theme={authTheme}
        visible={forgotVisible}
        onClose={(): void => setForgotVisible(false)}
      />
    </>
  );
};

export default LoginScreen;
