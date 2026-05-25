import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { OTP } from '../../shared/constants';
import { useTheme } from '../../theme/hooks/useTheme';
import { FormField, FormSwitch, ChipSelector } from '../Forms';

const AUTH_METHOD_OPTIONS = [
  { value: 0, label: 'Username/Password' },
  { value: 1, label: 'Phone OTP' },
  { value: 2, label: 'Email OTP' },
];

const styles = StyleSheet.create({
  authConfigContainer: { marginTop: 8 },
  authConfigTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  authMethodContainer: { marginBottom: 12 },
});

interface TenantAuthConfigProps {
  primaryAuthMethod: number;
  onPrimaryAuthMethodChange: (value: number) => void;
  allowPhoneAuth: boolean;
  onAllowPhoneAuthChange: (value: boolean) => void;
  allowEmailAuth: boolean;
  onAllowEmailAuthChange: (value: boolean) => void;
  otpCodeLength: string;
  onOtpCodeLengthChange: (value: string) => void;
  otpExpiryMinutes: string;
  onOtpExpiryMinutesChange: (value: string) => void;
  smsProvider: string;
  onSmsProviderChange: (value: string) => void;
  requireSmsVerification: boolean;
  onRequireSmsVerificationChange: (value: boolean) => void;
}

const TenantAuthConfig: React.FC<TenantAuthConfigProps> = ({
  primaryAuthMethod,
  onPrimaryAuthMethodChange,
  allowPhoneAuth,
  onAllowPhoneAuthChange,
  allowEmailAuth,
  onAllowEmailAuthChange,
  otpCodeLength,
  onOtpCodeLengthChange,
  otpExpiryMinutes,
  onOtpExpiryMinutesChange,
  smsProvider,
  onSmsProviderChange,
  requireSmsVerification,
  onRequireSmsVerificationChange,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.authConfigContainer}>
      <Text style={[styles.authConfigTitle, { color: colors.text }]}>
        {FM('tenants.authConfigTitle')}
      </Text>

      <ChipSelector
        containerStyle={styles.authMethodContainer}
        label={FM('tenants.primaryAuthMethod')}
        options={AUTH_METHOD_OPTIONS}
        value={primaryAuthMethod}
        onChange={onPrimaryAuthMethodChange}
      />

      <FormSwitch
        label={FM('tenants.allowPhoneAuth')}
        value={allowPhoneAuth}
        onValueChange={onAllowPhoneAuthChange}
      />

      <FormSwitch
        label={FM('tenants.allowEmailAuth')}
        value={allowEmailAuth}
        onValueChange={onAllowEmailAuthChange}
      />

      <FormField
        keyboardType="numeric"
        label={`OTP Code Length (${OTP.MIN_LENGTH}-${OTP.MAX_LENGTH})`}
        placeholder={String(OTP.DEFAULT_LENGTH)}
        value={otpCodeLength}
        onChangeText={onOtpCodeLengthChange}
      />

      <FormField
        keyboardType="numeric"
        label={FM('tenants.otpExpiryMinutes')}
        placeholder="5"
        value={otpExpiryMinutes}
        onChangeText={onOtpExpiryMinutesChange}
      />

      <FormField
        label={FM('tenants.smsProvider')}
        placeholder={FM('tenants.smsProviderPlaceholder')}
        value={smsProvider}
        onChangeText={onSmsProviderChange}
      />

      <FormSwitch
        description={FM('tenants.requireSmsVerificationDesc')}
        label={FM('tenants.requireSmsVerification')}
        value={requireSmsVerification}
        onValueChange={onRequireSmsVerificationChange}
      />
    </View>
  );
};

export default TenantAuthConfig;
