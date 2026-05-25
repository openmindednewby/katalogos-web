import React, { useMemo } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import TenantAuthConfig from './TenantAuthConfig';
import { useTenantFormState } from './useTenantFormState';
import { OTP } from '../../shared/constants';
import { TenantStatusEnum } from '../../shared/enums/TenantStatus';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import CancelButton from '../Buttons/CancelButton';
import SaveButton from '../Buttons/SaveButton';
import ActionRow from '../core/ActionRow/ActionRow';
import { FormField, ChipSelector } from '../Forms';
import Heading from '../Shared/Heading';

import type { TenantFormPayload } from './useTenantFormState';

interface Props {
  initialName?: string;
  initialStatus?: number;
  initialPrimaryAuthMethod?: number;
  initialAllowPhoneAuth?: boolean;
  initialAllowEmailAuth?: boolean;
  initialOtpCodeLength?: number;
  initialOtpExpiryMinutes?: number;
  initialSmsProvider?: string | null;
  initialRequireSmsVerification?: boolean;
  onCancel?: () => void;
  onSave: (payload: TenantFormPayload) => void;
  saving?: boolean;
  showStatus?: boolean;
  showAuthConfig?: boolean;
}

const styles = StyleSheet.create({
  statusContainer: { marginBottom: 16 },
  errorText: { marginTop: 8 },
});

const TenantForm = ({
  initialName = '',
  initialStatus = TenantStatusEnum.Enabled,
  initialPrimaryAuthMethod = 0,
  initialAllowPhoneAuth = false,
  initialAllowEmailAuth = false,
  initialOtpCodeLength = OTP.DEFAULT_LENGTH,
  initialOtpExpiryMinutes = 5,
  initialSmsProvider = null,
  initialRequireSmsVerification = true,
  onCancel,
  onSave,
  saving,
  showStatus = true,
  showAuthConfig = true,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const errorColor = theme.semantic.error['500'];

  const formStateParams = useMemo(() => ({
    initialName,
    initialStatus,
    initialPrimaryAuthMethod,
    initialAllowPhoneAuth,
    initialAllowEmailAuth,
    initialOtpCodeLength,
    initialOtpExpiryMinutes,
    initialSmsProvider,
    initialRequireSmsVerification,
    showAuthConfig,
    onSave,
  }), [initialName, initialStatus, initialPrimaryAuthMethod, initialAllowPhoneAuth, initialAllowEmailAuth, initialOtpCodeLength, initialOtpExpiryMinutes, initialSmsProvider, initialRequireSmsVerification, showAuthConfig, onSave]);
  const formState = useTenantFormState(formStateParams);

  const { authState } = formState;

  return (
    <ScrollView>
      <View>
        <Heading text={FM('tenants.title')} />
        <FormField
          required
          error={formState.nameError}
          label={FM('tenants.name')}
          placeholder={FM('tenants.namePlaceholder')}
          value={formState.name}
          onChangeText={formState.setName}
        />

        {showStatus ? (
          <ChipSelector
            containerStyle={styles.statusContainer}
            label={FM('tenants.statusLabel')}
            options={formState.translatedStatusOptions}
            value={formState.status}
            onChange={formState.setStatus}
          />
        ) : null}

        {showAuthConfig ? (
          <TenantAuthConfig
            allowEmailAuth={authState.allowEmailAuth}
            allowPhoneAuth={authState.allowPhoneAuth}
            otpCodeLength={authState.otpCodeLength}
            otpExpiryMinutes={authState.otpExpiryMinutes}
            primaryAuthMethod={authState.primaryAuthMethod}
            requireSmsVerification={authState.requireSmsVerification}
            smsProvider={authState.smsProvider}
            onAllowEmailAuthChange={authState.setAllowEmailAuth}
            onAllowPhoneAuthChange={authState.setAllowPhoneAuth}
            onOtpCodeLengthChange={authState.setOtpCodeLength}
            onOtpExpiryMinutesChange={authState.setOtpExpiryMinutes}
            onPrimaryAuthMethodChange={authState.setPrimaryAuthMethod}
            onRequireSmsVerificationChange={authState.setRequireSmsVerification}
            onSmsProviderChange={authState.setSmsProvider}
          />
        ) : null}

        {isValueDefined(formState.error) ? <Text style={[styles.errorText, { color: errorColor }]}>{formState.error}</Text> : null}

        <ActionRow>
          <SaveButton disabled={Boolean(saving)} title={FM('tenants.save')} onPress={formState.handleSave} />
          <CancelButton title={FM('tenants.cancel')} onPress={onCancel} />
        </ActionRow>
      </View>
    </ScrollView>
  );
};

export default TenantForm;
