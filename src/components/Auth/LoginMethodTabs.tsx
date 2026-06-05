/**
 * `<LoginMethodTabs>` — the inline method picker shown on the login screen when
 * the BFF advertises more than one inline credential method (password +
 * email-OTP), unified-login parity (#172).
 *
 * Presentational only: it renders a two-tab row (Password / Email code) and
 * reports the selection back via callbacks. The screen owns the active-method
 * state and decides which form (`<LoginForm>` / `<OtpForm>`) to render below.
 *
 * Passkey + device-PIN are NOT tabs here — passkey is a button below the form
 * and device-PIN is a full-screen unlock gate, so only password/OTP need a tab.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../localization/helpers';

import type { AuthTheme } from '@dloizides/auth-web';

// Declared before the component so the ESLint config's use-before-define +
// enforce-function-style rules (constants precede functions) are satisfied.
const styles = StyleSheet.create({
  tab: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    maxWidth: 460,
    width: '100%',
  },
});

interface LoginMethodTabsProps {
  /** True when the email-OTP tab is the active one. */
  otpActive: boolean;
  /** The auth surface theme — drives the active/inactive tab colours. */
  theme: AuthTheme;
  /** Prefix applied to each tab's `testID`. */
  testIdPrefix: string;
  /** Called when the user taps the password tab. */
  onSelectPassword: () => void;
  /** Called when the user taps the email-OTP tab. */
  onSelectOtp: () => void;
}

/** The Password / Email-code tab row for the login screen. */
export const LoginMethodTabs = ({
  otpActive,
  theme,
  testIdPrefix,
  onSelectPassword,
  onSelectOtp,
}: Readonly<LoginMethodTabsProps>): React.ReactElement => (
  <View accessibilityRole="tablist" style={styles.tabs}>
    <TouchableOpacity
      accessibilityHint={FM('auth.methods.passwordHint')}
      accessibilityLabel={FM('auth.methods.passwordTab')}
      accessibilityRole="tab"
      accessibilityState={{ selected: !otpActive }}
      style={[
        styles.tab,
        {
          backgroundColor: otpActive ? theme.colors.surface : theme.colors.primary,
          borderColor: otpActive ? theme.colors.border : theme.colors.primary,
        },
      ]}
      testID={`${testIdPrefix}-login-tab-password`}
      onPress={onSelectPassword}
    >
      <Text
        style={[styles.tabText, { color: otpActive ? theme.colors.text : theme.colors.onPrimary }]}
      >
        {FM('auth.methods.passwordTab')}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      accessibilityHint={FM('auth.methods.otpHint')}
      accessibilityLabel={FM('auth.methods.otpTab')}
      accessibilityRole="tab"
      accessibilityState={{ selected: otpActive }}
      style={[
        styles.tab,
        {
          backgroundColor: otpActive ? theme.colors.primary : theme.colors.surface,
          borderColor: otpActive ? theme.colors.primary : theme.colors.border,
        },
      ]}
      testID={`${testIdPrefix}-login-tab-otp`}
      onPress={onSelectOtp}
    >
      <Text
        style={[styles.tabText, { color: otpActive ? theme.colors.onPrimary : theme.colors.text }]}
      >
        {FM('auth.methods.otpTab')}
      </Text>
    </TouchableOpacity>
  </View>
);
