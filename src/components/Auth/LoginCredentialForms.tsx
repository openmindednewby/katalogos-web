/**
 * `<LoginCredentialForms>` — the inline credential surface of the login screen:
 * the method-tab row plus the active form (password or email-OTP),
 * unified-login parity (#172).
 *
 * It owns the active-method state and renders the `<LoginMethodTabs>` picker
 * (only when the BFF advertises `otp`) above either `<LoginForm>` (password) or
 * `<OtpForm>` (email-OTP). When OTP is not advertised the tabs are hidden and
 * the password form renders exactly as the legacy password-only login did.
 *
 * Passkey + the device-PIN unlock gate live on the screen itself, not here —
 * passkey is a button below this surface and device-PIN replaces the whole
 * screen, so neither belongs in the tabbed credential picker.
 *
 * react-query-FREE by design (the login route renders before the
 * LazyQueryProvider activates) — do NOT introduce any react-query usage here.
 */
import React, { useState } from 'react';

import { LoginForm, OtpForm } from '@dloizides/auth-web';

import { LoginMethodTabs } from './LoginMethodTabs';
import { bffAuthClient } from '../../auth/bffClient';
import { BffLoginMethod } from '../../auth/BffLoginMethod';
import { useOtpLabels } from '../../auth/useAuthLabels';

import type { BffUser } from '@dloizides/auth-client';
import type { AuthTheme } from '@dloizides/auth-web';

interface LoginCredentialFormsProps {
  /** The methods the BFF advertises (`config.methods` from `/bff/config`). */
  methods: readonly string[];
  /** The auth surface theme. */
  theme: AuthTheme;
  /** Called with the signed-in user after a successful password / OTP login. */
  onSuccess: (user: BffUser) => void;
  /** Called when the user taps "Forgot password?" in the password form. */
  onForgotPassword: () => void;
  /** Called when the user taps "Create account" in the password form. */
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
          client={bffAuthClient}
          labels={otpLabels}
          testIdPrefix="katalogos"
          theme={theme}
          onSuccess={onSuccess}
        />
      ) : (
        <LoginForm
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
