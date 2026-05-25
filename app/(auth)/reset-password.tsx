/**
 * Reset-password landing page (`/reset-password?token=…`).
 *
 * Reachable while logged out — the route lives under the `(auth)` group which
 * does not gate on session state. The token comes from the email-link query
 * param; on mount we read it once and pass it to the reset-password form hook.
 *
 * On success: navigates to the login screen and emits a success notification.
 * On expired / invalid token (HTTP 400): swaps the form for a CTA that returns
 * the user to login (where they can request a new link).
 *
 * Unified-auth Phase 1c: the form *logic* lives in `@dloizides/auth-web`
 * (`useResetPasswordForm`); this route owns only the token parsing, the
 * navigation, and the `ResetPasswordError → FM()` mapping (the package is
 * i18n-agnostic). The rendered body is the shared `ResetPasswordView` so the
 * UI and its testIds are unchanged from the pre-port screen.
 */
import React, { useCallback, useMemo, type ReactElement } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { ResetPasswordError, useResetPasswordForm } from '@dloizides/auth-web';

import { bffAuthClient } from '../../src/auth/bffClient';
import { ResetPasswordView } from '../../src/components/Auth/ResetPasswordView';
import { notifySuccess } from '../../src/lib/notifications';
import { FM } from '../../src/localization/helpers';
import { isValueDefined } from '../../src/utils/is';

function readQueryToken(raw: string | string[] | undefined): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return '';
}

/** Resolve a `ResetPasswordError` onto its localized message. */
function errorMessage(errorKey: ResetPasswordError | null): string {
  if (!isValueDefined(errorKey)) return '';
  if (errorKey === ResetPasswordError.Empty) return FM('resetPassword.errors.empty');
  if (errorKey === ResetPasswordError.WeakPassword) return FM('resetPassword.errors.weakPassword');
  if (errorKey === ResetPasswordError.Mismatch) return FM('resetPassword.errors.mismatch');
  if (errorKey === ResetPasswordError.TokenInvalid) return FM('resetPassword.errors.tokenInvalid');
  return FM('resetPassword.errors.network');
}

const ResetPasswordScreen = (): ReactElement => {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = readQueryToken(params.token);

  const onSuccess = useCallback((): void => {
    notifySuccess(FM('resetPassword.successToast'));
    router.replace('/(auth)/login');
  }, [router]);

  const onRequestNew = useCallback((): void => {
    router.replace('/(auth)/login');
  }, [router]);

  const formArgs = useMemo(
    () => ({ client: bffAuthClient, token, onSuccess }),
    [token, onSuccess],
  );
  const form = useResetPasswordForm(formArgs);

  return <ResetPasswordView errorMessage={errorMessage} form={form} onRequestNew={onRequestNew} />;
};

export default ResetPasswordScreen;
