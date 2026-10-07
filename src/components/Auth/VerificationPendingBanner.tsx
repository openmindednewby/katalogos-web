import React, { type ReactElement, useCallback, useEffect, useRef, useState } from 'react';

import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../auth/AuthProvider';
import { resendVerificationEmail } from '../../auth/verifyEmailApi';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';

const BG_AMBER = '#FEF3C7';
const TEXT_AMBER = '#92400E';
const BUTTON_AMBER = '#D97706';
const BUTTON_TEXT = '#FFFFFF';
const CONFIRMATION_VISIBLE_MS = 5000;
const WARNING_SIGN_CODEPOINT = 0x26a0;
const WARNING_GLYPH = String.fromCodePoint(WARNING_SIGN_CODEPOINT);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: BG_AMBER,
  },
  textRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 8 },
  warningIcon: { fontSize: 18, color: BUTTON_AMBER },
  message: { fontSize: 14, fontWeight: '600', color: TEXT_AMBER, flexShrink: 1 },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: BUTTON_AMBER,
  },
  buttonLabel: { color: BUTTON_TEXT, fontSize: 13, fontWeight: '600' },
  confirmation: { color: TEXT_AMBER, fontSize: 13, fontStyle: 'italic' },
});

function useResendEmail(): string | null {
  const { userInfo } = useAuth();
  if (!isValueDefined(userInfo)) return null;
  const email = userInfo.email;
  if (typeof email !== 'string' || email === '') return null;
  return email;
}

function useShouldShowBanner(): boolean {
  const { userInfo, isLoggedIn } = useAuth();
  if (!isLoggedIn) return false;
  if (!isValueDefined(userInfo)) return false;
  return userInfo.email_verified === false;
}

interface ResendActionProps {
  email: string | null;
}

const ResendAction = ({ email }: ResendActionProps): ReactElement => {
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => (): void => {
    if (isValueDefined(timeoutRef.current)) clearTimeout(timeoutRef.current);
  }, []);

  const handlePress = useCallback(async (): Promise<void> => {
    if (!isValueDefined(email)) return;
    setSubmitting(true);
    await resendVerificationEmail(email);
    setSubmitting(false);
    setConfirmed(true);
    if (isValueDefined(timeoutRef.current)) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setConfirmed(false), CONFIRMATION_VISIBLE_MS);
  }, [email]);

  if (confirmed)
    return (
      <Text style={styles.confirmation} testID={TestIds.VERIFICATION_PENDING_RESEND_CONFIRMATION}>
        {FM('verificationPending.resendConfirmation')}
      </Text>
    );

  return (
    <Pressable
      accessibilityHint={FM('verificationPending.resendButtonHint')}
      accessibilityLabel={FM('verificationPending.resendButton')}
      accessibilityRole="button"
      disabled={submitting || !isValueDefined(email)}
      style={styles.button}
      testID={TestIds.VERIFICATION_PENDING_RESEND_BUTTON}
      onPress={handlePress}
    >
      <Text style={styles.buttonLabel}>{FM('verificationPending.resendButton')}</Text>
    </Pressable>
  );
};

/** Persistent banner mounted on the authenticated layout. Returns `null` when */
const VerificationPendingBanner = (): ReactElement | null => {
  const show = useShouldShowBanner();
  const email = useResendEmail();

  const liveProps: Record<string, string> = Platform.OS === 'web' ? { 'aria-live': 'polite' } : {};

  if (!show) return null;

  return (
    <View
      {...liveProps}
      accessibilityRole="alert"
      style={styles.container}
      testID={TestIds.VERIFICATION_PENDING_BANNER}
    >
      <View style={styles.textRow}>
        <Text style={styles.warningIcon}>{WARNING_GLYPH}</Text>
        <Text style={styles.message}>{FM('verificationPending.message')}</Text>
      </View>
      <ResendAction email={email} />
    </View>
  );
};

export default VerificationPendingBanner;
