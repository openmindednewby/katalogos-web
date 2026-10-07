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
