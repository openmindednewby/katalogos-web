/**
 * Register screen — a thin wrapper around the shared `<RegisterForm>` from
 * `@dloizides/auth-web`.
 *
 * The app keeps what is product-specific: the request (sent through the app's
 * BFF client, which carries the realm, plus the verify-URL template), the
 * post-signup redirect, analytics, and the `FM()` copy. Form state, validation,
 * the honeypot and the `register-*` testIDs live in the package.
 */
import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'expo-router';

import { RegisterForm, type RegisterErrorCode, type RegisterSubmitValues } from '@dloizides/auth-web';

import { useAuth } from '../../src/auth/AuthProvider';
import { mapAppThemeToAuthTheme } from '../../src/auth/authThemeMapping';
import { resolvePostLoginDestination } from '../../src/auth/postLoginRoutes';
import { registerErrorMessage, useRegisterLabels } from '../../src/auth/useRegisterLabels';
import { buildVerifyUrlTemplate } from '../../src/auth/verifyEmailRequest';
import { AuthFooterMode } from '../../src/components/Auth/AuthFooterMode';
import LoginFooterLinks from '../../src/components/Auth/LoginFooterLinks';
import { useAnalytics } from '../../src/lib/analytics';
import { FM } from '../../src/localization/helpers';
import AnalyticsEventName from '../../src/shared/enums/AnalyticsEventName';
import { useTheme } from '../../src/theme/hooks/useTheme';
import { showAlert } from '../../src/utils/showAlert';

import type { BffUser } from '@dloizides/auth-client';

const PRODUCT = 'katalogos';

const RegisterScreen = (): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { register } = useAuth();
  const { track } = useAnalytics();
  const labels = useRegisterLabels();
  const authTheme = useMemo(() => mapAppThemeToAuthTheme(theme), [theme]);

  const handleSubmit = useCallback(
    async (values: RegisterSubmitValues): Promise<BffUser> =>
      register({ ...values, verifyUrlTemplate: buildVerifyUrlTemplate() }),
    [register]
  );

  const handleSuccess = useCallback(
    (user: BffUser): void => {
      track(AnalyticsEventName.SignupCompleted, { product: PRODUCT });
      router.replace(resolvePostLoginDestination(user));
    },
    [router, track]
  );

  const handleError = useCallback((code: RegisterErrorCode): void => {
    showAlert(registerErrorMessage(code), FM('register.error'));
  }, []);

  const handleAttempt = useCallback((): void => {
    track(AnalyticsEventName.SignupStarted, { product: PRODUCT });
  }, [track]);

  return (
    <RegisterForm
      footer={<LoginFooterLinks mode={AuthFooterMode.Register} />}
      labels={labels}
      theme={authTheme}
      onError={handleError}
      onSubmit={handleSubmit}
      onSubmitAttempt={handleAttempt}
      onSuccess={handleSuccess}
    />
  );
};

export default RegisterScreen;
