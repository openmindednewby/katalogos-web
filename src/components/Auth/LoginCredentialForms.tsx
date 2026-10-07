import React, { useState } from 'react';

import { LoginForm, OtpForm } from '@dloizides/auth-web';

import { LoginMethodTabs } from './LoginMethodTabs';
import { bffAuthClient } from '../../auth/bffClient';
import { BffLoginMethod } from '../../auth/BffLoginMethod';
import { useOtpLabels } from '../../auth/useAuthLabels';

import type { BffUser } from '@dloizides/auth-client';
import type { AuthTheme } from '@dloizides/auth-web';

interface LoginCredentialFormsProps {
  methods: readonly string[];
  theme: AuthTheme;
  onSuccess: (user: BffUser) => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

/** The tabbed password / email-OTP credential surface for the login screen. */
export const LoginCredentialForms = ({
  methods,
  theme,
  onSuccess,
  onForgotPassword,
  onSignUp,
}: Readonly<LoginCredentialFormsProps>): React.ReactElement => {
  const [activeMethod, setActiveMethod] = useState<BffLoginMethod>(BffLoginMethod.Password);
  const otpLabels = useOtpLabels();

  const showOtp = methods.includes(BffLoginMethod.Otp);
  const otpActive = showOtp && activeMethod === BffLoginMethod.Otp;

  return (
    <>
      {showOtp ? (
        <LoginMethodTabs
          otpActive={otpActive}
          testIdPrefix="katalogos"
          theme={theme}
          onSelectOtp={(): void => setActiveMethod(BffLoginMethod.Otp)}
          onSelectPassword={(): void => setActiveMethod(BffLoginMethod.Password)}
        />
      ) : null}

      {otpActive ? (
        <OtpForm
          chromeless
          client={bffAuthClient}
          labels={otpLabels}
          testIdPrefix="katalogos"
          theme={theme}
          onSuccess={onSuccess}
        />
      ) : (
        <LoginForm
          chromeless
          client={bffAuthClient}
          theme={theme}
          onForgotPassword={onForgotPassword}
          onSignUp={onSignUp}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};
