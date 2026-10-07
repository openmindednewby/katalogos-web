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

const PASSKEY_RETURN_URL = '/';

const LOGIN_CARD_MAX_WIDTH = 460;

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

function useClearStaleAuthStorageOnMount(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_PERSIST);
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    // eslint-disable-next-line no-empty
    } catch {
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_PERSIST);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    // eslint-disable-next-line no-empty
    } catch {
    }
  }, []);
}

function useSessionExpiredNotice(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const wasSessionExpired = sessionStorage.getItem(STORAGE_KEYS.SESSION_EXPIRED);
      if (wasSessionExpired === 'true') {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRED);
        notifySignOut(FM('errors.sessionExpired'));
      }
    // eslint-disable-next-line no-empty
    } catch {
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
  const preferredMethod = useMemo<string | null>(() => readCachedPreferredMethod(), []);
  const [bypassDevicePin, setBypassDevicePin] = useState<boolean>(false);

  useClearStaleAuthStorageOnMount();
  useSessionExpiredNotice();

  useEffect(() => {
    preloadProtectedRoutes();
  }, []);

  const authTheme = useMemo(() => mapAppThemeToAuthTheme(theme), [theme]);

  const handleSignedIn = useCallback(
    (user: BffUser): void => {
      setRouting(true);
      applyBffSession(user);
      syncPreferredMethodFromServer(preferencesClient).catch(() => undefined);
      prefetchDashboardData();
      router.replace(resolvePostLoginDestination(user));
    },
    [applyBffSession, router],
  );

  const handleUnlocked = useCallback(
    (user: DevicePinUnlockedUser): void => {
      handleSignedIn(claimBagToBffUser(user));
    },
    [handleSignedIn],
  );

  if (loading) return <Text style={themeStyles.loadingText}>{FM('loading')}</Text>;

  const showPwaInstallPrompt =
    PWA_PROMPTS_FLAG && Platform.OS === 'web' && showInstallPrompt && !isInstalled;

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
