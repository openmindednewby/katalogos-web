import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../localization/helpers';

import type { AuthTheme } from '@dloizides/auth-web';

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
  otpActive: boolean;
  theme: AuthTheme;
  testIdPrefix: string;
  onSelectPassword: () => void;
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
