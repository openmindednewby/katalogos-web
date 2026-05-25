/**
 * Small, reusable "Forgot password?" link rendered below the password input
 * on the login form. Extracted so the login route stays under the 200-line
 * `max-lines` cap and so any future signin surface (e.g. account-hub re-auth
 * modal) can drop the same control in.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});

interface Props {
  color: string;
  disabled: boolean;
  onPress: () => void;
}

export const ForgotPasswordLink = ({ color, disabled, onPress }: Props): React.ReactElement => (
  <View style={styles.container}>
    <TouchableOpacity
      accessibilityHint={FM('login.forgotPasswordHint')}
      accessibilityLabel={FM('login.forgotPasswordLabel')}
      accessibilityRole="button"
      disabled={disabled}
      testID="login-forgot-password-link"
      onPress={onPress}
    >
      <Text style={[styles.link, { color }]}>{FM('login.forgotPassword')}</Text>
    </TouchableOpacity>
  </View>
);
