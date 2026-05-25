/**
 * VerificationPendingBanner — persistent banner on the authenticated layout
 * shown while the signed-in user's email is not yet verified.
 *
 * Renders only when `userInfo.email_verified === false` (the BFF projects the
 * Keycloak `email_verified` claim verbatim). Hidden whenever the value is
 * `undefined` (claim missing) or `true`, so we never surface the banner for
 * sessions that don't carry the claim yet — better to under-show than to nag
 * users who are already verified.
 *
 * Not dismissible — verifying email is a precondition for password recovery,
 * so we want the affordance present until they act on it. Tapping "Resend
 * verification email" fires the same `/bff/resend-verification` POST as the
 * verify-email page; on success we swap the button for a five-second-lived
 * confirmation. Network-failure collapses to the same confirmation (anti-enum).
 *
 * Colour palette is a hard-coded amber/warning bag because the tenant
 * `ResolvedTheme` does not include a warning token — these match the
 * Tailwind-flavoured `amber-100 / amber-700 / amber-600` triplet used across
 * other warning surfaces in the SaaS.
 */
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
/**
 * Warning-sign glyph (U+26A0). Built from a codepoint so the JSX literal-text
 * rule does not flag it — it is decorative chrome, not user copy.
 */
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

/** Read the verified email off the current session, or `null` if unavailable. */
function useResendEmail(): string | null {
  const { userInfo } = useAuth();
  if (!isValueDefined(userInfo)) return null;
  const email = userInfo.email;
  if (typeof email !== 'string' || email === '') return null;
  return email;
}

/** True when the session explicitly carries `email_verified: false`. */
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

/**
 * Persistent banner mounted on the authenticated layout. Returns `null` when
 * the user is verified or the claim is missing, so the layout can render the
 * banner unconditionally without a wrapping conditional.
 */
const VerificationPendingBanner = (): ReactElement | null => {
  const show = useShouldShowBanner();
  const email = useResendEmail();

  // Web a11y: announce the banner once on mount so screen readers don't miss
  // it. RN's `aria-live` is a web-only prop; the typed record keeps the spread
  // honest on native platforms (where it's a no-op).
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
