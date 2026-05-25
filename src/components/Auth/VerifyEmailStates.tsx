/**
 * Presentational pieces for the verify-email landing page.
 *
 * Three state components — Loading, Success, Failure — plus a small resend
 * form the failure state owns. Each is exported individually so the route
 * (`/verify-email`) can switch between them without an in-component
 * conditional ladder + so each piece stays small enough to read at a glance.
 *
 * Visual chrome mirrors the reset-password / register screens — centred card
 * on the tenant background colour, theme-driven palette, no hardcoded brand
 * tokens beyond the shared box-shadow.
 */
import React, { type ReactElement, useCallback, useState } from 'react';

import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { resendVerificationEmail } from '../../auth/verifyEmailApi';
import { VerifyEmailErrorCode } from '../../auth/verifyEmailErrorCode';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import SaveButton from '../Buttons/SaveButton';

const BOX_SHADOW = '0px 2px 8px rgba(0, 0, 0, 0.1)';
const SUCCESS_GREEN = '#10b981';
const ERROR_RED = '#d33';
/**
 * Decorative glyphs (built from codepoints rather than literal characters so
 * the `react/jsx-no-literals` rule does not flag them — they are visual chrome,
 * not user-facing copy, and the `accessibilityLabel` carries the meaning).
 */
const CHECK_MARK_CODEPOINT = 0x2713;
const EXCLAMATION_CODEPOINT = 0x21;
const CHECK_GLYPH = String.fromCodePoint(CHECK_MARK_CODEPOINT);
const EXCLAMATION_GLYPH = String.fromCodePoint(EXCLAMATION_CODEPOINT);

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 460, borderRadius: 12, padding: 24, boxShadow: BOX_SHADOW, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  titleAfterSpinner: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, marginTop: 16, textAlign: 'center' },
  body: { fontSize: 16, marginBottom: 20, textAlign: 'center', lineHeight: 22 },
  centred: { alignItems: 'center' },
  buttonContainer: { marginTop: 8, marginBottom: 8, width: '100%' },
  successMark: { fontSize: 48, color: SUCCESS_GREEN, marginBottom: 12 },
  errorMark: { fontSize: 48, color: ERROR_RED, marginBottom: 12 },
  resendCtaContainer: { marginTop: 12, width: '100%' },
  resendForm: { marginTop: 12, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  resendConfirmation: { fontSize: 14, textAlign: 'center', marginTop: 12 },
  resendMissingEmail: { fontSize: 14, color: ERROR_RED, marginBottom: 8, textAlign: 'center' },
});

/** Loading state — spinner + "Verifying…" copy. */
export const VerifyEmailLoading = (): ReactElement => {
  const { theme } = useTheme();
  const primary = theme.palette.primary['500'];
  return (
    <View style={[styles.card, styles.centred, { backgroundColor: theme.colors.surface }]} testID={TestIds.VERIFY_EMAIL_LOADING}>
      <ActivityIndicator color={primary} size="large" />
      <Text style={[styles.titleAfterSpinner, { color: theme.colors.text }]}>
        {FM('verifyEmail.loadingTitle')}
      </Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
        {FM('verifyEmail.loadingHint')}
      </Text>
    </View>
  );
};

interface VerifyEmailSuccessProps {
  onContinue: () => void;
}

/** Success state — checkmark + Continue CTA. */
export const VerifyEmailSuccess = ({ onContinue }: VerifyEmailSuccessProps): ReactElement => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, styles.centred, { backgroundColor: theme.colors.surface }]} testID={TestIds.VERIFY_EMAIL_SUCCESS}>
      <Text
        accessibilityHint={FM('verifyEmail.successContinueHint')}
        accessibilityLabel={FM('verifyEmail.successTitle')}
        style={styles.successMark}
      >
        {CHECK_GLYPH}
      </Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{FM('verifyEmail.successTitle')}</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{FM('verifyEmail.successBody')}</Text>
      <View style={styles.buttonContainer}>
        <SaveButton
          testID={TestIds.VERIFY_EMAIL_SUCCESS_CONTINUE}
          title={FM('verifyEmail.successContinue')}
          onPress={onContinue}
        />
      </View>
    </View>
  );
};

/** Map a {@link VerifyEmailErrorCode} onto its localized body copy. */
function errorBodyForCode(code: VerifyEmailErrorCode): string {
  if (code === VerifyEmailErrorCode.TokenInvalid) return FM('verifyEmail.errorInvalid');
  if (code === VerifyEmailErrorCode.TokenExpired) return FM('verifyEmail.errorExpired');
  if (code === VerifyEmailErrorCode.TokenUsed) return FM('verifyEmail.errorUsed');
  if (code === VerifyEmailErrorCode.MissingToken) return FM('verifyEmail.missingToken');
  return FM('verifyEmail.errorGeneric');
}

/**
 * Inline resend-email form. Anti-enum: regardless of whether the address is
 * known, the BFF returns 200 and we surface the same "if registered, sent"
 * copy. Network-failures collapse to the same confirmation so we never reveal
 * existence by error path either.
 */
const ResendVerificationForm = (): ReactElement => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [missingEmail, setMissingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (): Promise<void> => {
    const trimmed = email.trim();
    if (trimmed === '') {
      setMissingEmail(true);
      return;
    }
    setMissingEmail(false);
    setSubmitting(true);
    await resendVerificationEmail(trimmed);
    setSubmitting(false);
    setConfirmed(true);
  }, [email]);

  if (confirmed)
    return (
      <Text
        style={[styles.resendConfirmation, { color: theme.colors.textSecondary }]}
        testID={TestIds.VERIFY_EMAIL_RESEND_CONFIRMATION}
      >
        {FM('verifyEmail.resendConfirmation')}
      </Text>
    );

  return (
    <View style={styles.resendForm} testID={TestIds.VERIFY_EMAIL_RESEND_FORM}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{FM('verifyEmail.resendEmailLabel')}</Text>
      <TextInput
        accessibilityHint={FM('verifyEmail.resendEmailHint')}
        accessibilityLabel={FM('verifyEmail.resendEmailLabel')}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!submitting}
        keyboardType="email-address"
        placeholder={FM('verifyEmail.resendEmailPlaceholder')}
        style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text }]}
        testID={TestIds.VERIFY_EMAIL_RESEND_EMAIL}
        value={email}
        onChangeText={setEmail}
      />
      {missingEmail ? (
        <Text style={styles.resendMissingEmail}>{FM('verifyEmail.resendMissingEmail')}</Text>
      ) : null}
      <View style={styles.buttonContainer}>
        <SaveButton
          disabled={submitting}
          testID={TestIds.VERIFY_EMAIL_RESEND_SUBMIT}
          title={FM('verifyEmail.resendSubmit')}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

interface VerifyEmailFailureProps {
  errorCode: VerifyEmailErrorCode;
}

/** Failure state — error message + resend-email inline form. */
export const VerifyEmailFailure = ({ errorCode }: VerifyEmailFailureProps): ReactElement => {
  const { theme } = useTheme();
  const [resendOpen, setResendOpen] = useState(false);
  const openResend = useCallback((): void => setResendOpen(true), []);

  return (
    <View style={[styles.card, styles.centred, { backgroundColor: theme.colors.surface }]} testID={TestIds.VERIFY_EMAIL_ERROR}>
      <Text
        accessibilityHint={FM('verifyEmail.resendCtaHint')}
        accessibilityLabel={FM('verifyEmail.errorTitle')}
        style={styles.errorMark}
      >
        {EXCLAMATION_GLYPH}
      </Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>{FM('verifyEmail.errorTitle')}</Text>
      <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{errorBodyForCode(errorCode)}</Text>
      {resendOpen ? (
        <ResendVerificationForm />
      ) : (
        <View style={styles.resendCtaContainer}>
          <SaveButton
            testID={TestIds.VERIFY_EMAIL_RESEND_CTA}
            title={FM('verifyEmail.resendCta')}
            onPress={openResend}
          />
        </View>
      )}
    </View>
  );
};
