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
  theme: AuthTheme;
  onClose: () => void;
}

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
