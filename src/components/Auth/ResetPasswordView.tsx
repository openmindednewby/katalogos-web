/**
 * Presentational reset-password screen body.
 *
 * Unified-auth Phase 1c: the reset-password form *logic* lives in the shared
 * `@dloizides/auth-web` `useResetPasswordForm` hook; this component is the
 * app-specific render layer it feeds. Split out of the route so the route stays
 * thin and the rendered UI / testIds / localized copy are unchanged from the
 * pre-port screen.
 *
 * It has two states:
 *  - `hasInvalidToken` → a "request a new link" CTA.
 *  - otherwise → the two-field new-password form.
 *
 * `errorMessage` is injected so the route owns the `ResetPasswordError → FM()`
 * mapping (the package is i18n-agnostic).
 */
import React, { type ReactElement } from 'react';

import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '../../localization/helpers';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import SaveButton from '../Buttons/SaveButton';

import type { ResetPasswordError, UseResetPasswordFormResult } from '@dloizides/auth-web';

const BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.1)';
const ERROR_RED = '#d33';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    boxShadow: BOX_SHADOW,
    elevation: 5,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 24, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  buttonContainer: { marginTop: 8, marginBottom: 16 },
  errorMessage: { color: ERROR_RED, marginBottom: 16, lineHeight: 22 },
  policyNote: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
});

interface ResetPasswordViewProps {
  /**
   * The form state + callbacks from the active reset-password hook. Both the
   * unified (`@dloizides/auth-web`) and legacy local hooks return this same
   * `UseResetPasswordFormResult` shape — the legacy hook now re-exports the
   * package's `ResetPasswordError`, so there is one enum identity.
   */
  form: UseResetPasswordFormResult;
  /** Maps a `ResetPasswordError` onto its localized message. */
  errorMessage: (errorKey: ResetPasswordError | null) => string;
  /** Invoked when the user taps "request a new link" on the invalid-token CTA. */
  onRequestNew: () => void;
}

/** Shared presentational reset-password screen body. */
export const ResetPasswordView = ({
  form,
  errorMessage,
  onRequestNew,
}: ResetPasswordViewProps): ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primaryColor = theme.palette.primary['500'];

  const containerStyle = [styles.container, { backgroundColor: colors.background }];
  const formContainerStyle = [styles.formContainer, { backgroundColor: colors.surface }];
  const titleStyle = [styles.title, { color: colors.text }];
  const subtitleStyle = [styles.subtitle, { color: colors.textSecondary }];
  const labelStyle = [styles.label, { color: colors.text }];
  const inputStyle = [
    styles.input,
    { borderColor: colors.border, backgroundColor: colors.background, color: colors.text },
  ];
  const policyNoteStyle = [styles.policyNote, { color: colors.textSecondary }];

  if (form.hasInvalidToken)
    return (
      <View style={containerStyle}>
        <View style={formContainerStyle} testID="reset-password-invalid">
          <Text style={titleStyle}>{FM('resetPassword.invalidTitle')}</Text>
          <Text style={subtitleStyle}>{FM('resetPassword.invalidMessage')}</Text>
          <View style={styles.buttonContainer}>
            <SaveButton
              testID="reset-password-request-new"
              title={FM('resetPassword.requestNew')}
              onPress={onRequestNew}
            />
          </View>
        </View>
      </View>
    );

  return (
    <View style={containerStyle}>
      <View style={formContainerStyle} testID="reset-password-form">
        <Text style={titleStyle}>{FM('resetPassword.title')}</Text>
        <Text style={subtitleStyle}>{FM('resetPassword.subtitle')}</Text>
        <Text style={policyNoteStyle}>{FM('resetPassword.policyNote')}</Text>

        <View style={styles.inputContainer}>
          <Text style={labelStyle}>{FM('resetPassword.newPasswordLabel')}</Text>
          <TextInput
            secureTextEntry
            accessibilityHint={FM('resetPassword.newPasswordHint')}
            accessibilityLabel={FM('resetPassword.newPasswordInputLabel')}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!form.isSubmitting}
            placeholder={FM('resetPassword.newPasswordPlaceholder')}
            style={inputStyle}
            testID="reset-password-new-input"
            value={form.newPassword}
            onChangeText={form.setNewPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={labelStyle}>{FM('resetPassword.confirmPasswordLabel')}</Text>
          <TextInput
            secureTextEntry
            accessibilityHint={FM('resetPassword.confirmPasswordHint')}
            accessibilityLabel={FM('resetPassword.confirmPasswordInputLabel')}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!form.isSubmitting}
            placeholder={FM('resetPassword.confirmPasswordPlaceholder')}
            style={inputStyle}
            testID="reset-password-confirm-input"
            value={form.confirmPassword}
            onChangeText={form.setConfirmPassword}
          />
        </View>

        {isValueDefined(form.errorKey) ? (
          <Text style={styles.errorMessage} testID="reset-password-error">
            {errorMessage(form.errorKey)}
          </Text>
        ) : null}

        <View style={styles.buttonContainer}>
          {form.isSubmitting ? (
            <ActivityIndicator color={primaryColor} size="large" />
          ) : (
            <SaveButton
              testID="reset-password-submit"
              title={FM('resetPassword.submit')}
              onPress={form.submit}
            />
          )}
        </View>
      </View>
    </View>
  );
};
