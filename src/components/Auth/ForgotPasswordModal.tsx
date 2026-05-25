/**
 * Modal that captures an email address and POSTs to `/bff/forgot-password`.
 *
 * Shown from the login screen when the user clicks "Forgot password?". On
 * submit, displays a generic success message regardless of whether the email
 * is registered (the backend never confirms enumeration).
 *
 * Unified-auth Phase 1c: the form *logic* comes from `@dloizides/auth-web`'s
 * `useBffForgotPassword` hook (client-injected — passed the app's shared
 * `bffAuthClient`). This modal stays app-specific: it is a `ModalShell` surface
 * with app copy and is shown inline from the login screen, so it deliberately
 * does NOT adopt the package's screen-shaped `<ForgotPasswordForm>` (which would
 * change the modal into a route). The request body is extended with
 * `resetUrlTemplate` (the SPA's own host) so the backend can build the email
 * link without hardcoding any frontend URL.
 */
import React, { useMemo, useState } from 'react';

import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useBffForgotPassword } from '@dloizides/auth-web';

import { bffAuthClient } from '@/auth/bffClient';
import {
  buildResetUrlTemplate,
  type ForgotPasswordRequestWithUrl,
} from '@/auth/forgotPasswordRequest';
import { FM } from '@/localization/helpers';
import { isValueDefined } from '@/utils/is';

import ModalShell from '../Shared/ModalShell';

const WHITE_COLOR = '#fff';
const ERROR_RED = '#d33';

const styles = StyleSheet.create({
  modalBody: { padding: 16 },
  modalLabel: { marginBottom: 8, fontWeight: '600' },
  modalInputContainer: { borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  modalInput: { padding: 12, fontSize: 16, width: '100%' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  actionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontWeight: '600' },
  successMessage: { marginBottom: 16, lineHeight: 22 },
  errorMessage: { marginBottom: 16, color: ERROR_RED, lineHeight: 22 },
});

interface ThemeColors {
  text: string;
  surface: string;
  border: string;
  primary: string;
  textSecondary: string;
}

interface Props {
  visible: boolean;
  colors: ThemeColors;
  onClose: () => void;
}

const isValidEmail = (value: string): boolean => /.+@.+\..+/.test(value);

export const ForgotPasswordModal = ({ visible, colors, onClose }: Props): React.ReactElement => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutationOptions = useMemo(
    () => ({
      // The shared @dloizides/auth-web hook is client-injected (no module-level
      // singleton) — pass the app's same-origin BFF client.
      client: bffAuthClient,
      onSuccess: () => setSubmitted(true),
      onError: (err: Error): void => {
        // Network / 5xx — show a friendly retry message. 200/4xx never reach
        // here because the backend returns 200 on every "did we find an
        // account" branch (no enumeration).
        setErrorMessage(err.message);
      },
    }),
    [],
  );
  const mutation = useBffForgotPassword(mutationOptions);

  const trimmedEmail = email.trim();
  const canSubmit = isValidEmail(trimmedEmail) && mutation.status !== 'pending';

  const handleSubmit = (): void => {
    setErrorMessage(null);
    const request: ForgotPasswordRequestWithUrl = {
      email: trimmedEmail,
      resetUrlTemplate: buildResetUrlTemplate(),
    };
    mutation.mutate(request);
  };

  const handleClose = (): void => {
    setEmail('');
    setSubmitted(false);
    setErrorMessage(null);
    mutation.reset();
    onClose();
  };

  const labelStyle = [styles.modalLabel, { color: colors.text }];
  const inputContainerStyle = [
    styles.modalInputContainer,
    { backgroundColor: colors.surface, borderColor: colors.border },
  ];
  const inputStyle = [styles.modalInput, { color: colors.text }];
  const cancelButtonStyle = [styles.secondaryButton, { borderColor: colors.border }];
  const cancelTextStyle = [styles.buttonText, { color: colors.text }];
  const submitButtonStyle = [
    styles.actionButton,
    { backgroundColor: canSubmit ? colors.primary : colors.border },
  ];
  const submitTextStyle = [styles.buttonText, { color: WHITE_COLOR }];
  const successStyle = [styles.successMessage, { color: colors.textSecondary }];

  return (
    <ModalShell title={FM('forgotPassword.title')} visible={visible} onCancel={handleClose}>
      <View style={styles.modalBody} testID="forgot-password-modal">
        {submitted ? (
          <>
            <Text style={successStyle}>{FM('forgotPassword.successMessage')}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                accessibilityHint={FM('forgotPassword.closeHint')}
                accessibilityLabel={FM('forgotPassword.closeLabel')}
                accessibilityRole="button"
                style={submitButtonStyle}
                testID="forgot-password-close-button"
                onPress={handleClose}
              >
                <Text style={submitTextStyle}>{FM('forgotPassword.close')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={successStyle}>{FM('forgotPassword.description')}</Text>
            <Text style={labelStyle}>{FM('forgotPassword.emailLabel')}</Text>
            <View style={inputContainerStyle}>
              <TextInput
                accessibilityHint={FM('forgotPassword.emailHint')}
                accessibilityLabel={FM('forgotPassword.emailInputLabel')}
                autoCapitalize="none"
                autoCorrect={false}
                editable={mutation.status !== 'pending'}
                keyboardType="email-address"
                placeholder={FM('forgotPassword.emailPlaceholder')}
                style={inputStyle}
                testID="forgot-password-email-input"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {isValueDefined(errorMessage) ? (
              <Text style={styles.errorMessage} testID="forgot-password-error">
                {FM('forgotPassword.networkError')}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                accessibilityHint={FM('forgotPassword.cancelHint')}
                accessibilityLabel={FM('forgotPassword.cancelLabel')}
                accessibilityRole="button"
                disabled={mutation.status === 'pending'}
                style={cancelButtonStyle}
                testID="forgot-password-cancel-button"
                onPress={handleClose}
              >
                <Text style={cancelTextStyle}>{FM('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityHint={FM('forgotPassword.submitHint')}
                accessibilityLabel={FM('forgotPassword.submitLabel')}
                accessibilityRole="button"
                disabled={!canSubmit}
                style={submitButtonStyle}
                testID="forgot-password-submit-button"
                onPress={handleSubmit}
              >
                {mutation.status === 'pending' ? (
                  <ActivityIndicator color={WHITE_COLOR} size="small" />
                ) : null}
                <Text style={submitTextStyle}>{FM('forgotPassword.submit')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ModalShell>
  );
};
