/**
 * "Forgot password?" modal, launched from the login screen.
 *
 * Thin app-glue around the shared, **react-query-free** `<ForgotPasswordFields>`
 * from `@dloizides/auth-web` (promoted there so katalogos / erevna / kefi stop
 * hand-rolling the identical body — see the feature-reuse roadmap). This wrapper
 * supplies the three app-specific things the package cannot own:
 *  - the app's `ModalShell` chrome (title bar + close affordance),
 *  - the `FM()`-localised copy (the package is i18n-agnostic — copy comes via
 *    the `labels` bag), and
 *  - the same-origin `bffAuthClient` + this SPA's `resetUrlTemplate`.
 *
 * The field, validation, the direct `bffAuthClient.forgotPassword` call and the
 * anti-enumeration success state now all live in the package. It stays
 * react-query-free, so it renders on the provider-less login route.
 */
import React from 'react';

import {
  ForgotPasswordFields,
  type AuthTheme,
  type ForgotPasswordFieldsLabels,
} from '@dloizides/auth-web';

import { bffAuthClient } from '@/auth/bffClient';
import { buildResetUrlTemplate } from '@/auth/forgotPasswordRequest';
import { FM } from '@/localization/helpers';

import ModalShell from '../Shared/ModalShell';

interface Props {
  visible: boolean;
  /** The app theme mapped to the package's `AuthTheme` token bag. */
  theme: AuthTheme;
  onClose: () => void;
}

/** Map the app's localised strings onto the package label bag. */
function forgotLabels(): Partial<ForgotPasswordFieldsLabels> {
  return {
    title: FM('forgotPassword.title'),
    description: FM('forgotPassword.description'),
    emailLabel: FM('forgotPassword.emailLabel'),
    emailPlaceholder: FM('forgotPassword.emailPlaceholder'),
    submit: FM('forgotPassword.submit'),
    submitting: FM('loading'),
    successMessage: FM('forgotPassword.successMessage'),
    networkError: FM('forgotPassword.networkError'),
    cancel: FM('common.cancel'),
    close: FM('forgotPassword.close'),
  };
}

export const ForgotPasswordModal = ({ visible, theme, onClose }: Props): React.ReactElement => (
  <ModalShell title={FM('forgotPassword.title')} visible={visible} onCancel={onClose}>
    <ForgotPasswordFields
      client={bffAuthClient}
      labels={forgotLabels()}
      resetUrlTemplate={buildResetUrlTemplate()}
      theme={theme}
      visible={visible}
      onCancel={onClose}
      onClose={onClose}
    />
  </ModalShell>
);
