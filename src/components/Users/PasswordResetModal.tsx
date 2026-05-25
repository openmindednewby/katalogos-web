/**
 * Modal for resetting a user's password.
 */
import React from 'react';

import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import ModalShell from '../Shared/ModalShell';

const WHITE_COLOR = '#fff';

const styles = StyleSheet.create({
  modalBody: { padding: 16 },
  modalLabel: { marginBottom: 8, fontWeight: '600' },
  modalInputContainer: { borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  modalInput: { padding: 12, fontSize: 16, width: '100%' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  actionButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontWeight: '600' },
});

interface ThemeColors {
  text: string;
  surface: string;
  border: string;
  primary: string;
}

interface Props {
  visible: boolean;
  newPassword: string;
  isUpdating: boolean;
  colors: ThemeColors;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const PasswordResetModal = ({
  visible,
  newPassword,
  isUpdating,
  colors,
  onPasswordChange,
  onSubmit,
  onCancel,
}: Props): React.ReactElement => {
  const trimmedPassword = newPassword.trim();
  const canSubmit = trimmedPassword.length > 0 && !isUpdating;

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

  return (
    <ModalShell title={FM('users.resetPasswordModalTitle')} visible={visible} onCancel={onCancel}>
      <View style={styles.modalBody}>
        <Text style={labelStyle}>{FM('users.newPassword')}</Text>
        <View style={inputContainerStyle}>
          <TextInput
            secureTextEntry
            accessibilityHint={FM('users.newPasswordHint')}
            accessibilityLabel={FM('users.newPasswordLabel')}
            placeholder={FM('users.newPasswordPlaceholder')}
            style={inputStyle}
            value={newPassword}
            onChangeText={onPasswordChange}
          />
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            accessibilityHint={FM('users.cancelPasswordResetHint')}
            accessibilityLabel={FM('users.cancelLabel')}
            accessibilityRole="button"
            disabled={isUpdating}
            style={cancelButtonStyle}
            onPress={onCancel}
          >
            <Text style={cancelTextStyle}>{FM('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityHint={FM('users.updatePasswordHint')}
            accessibilityLabel={FM('users.updatePasswordLabel')}
            accessibilityRole="button"
            disabled={!canSubmit}
            style={submitButtonStyle}
            onPress={onSubmit}
          >
            {isUpdating ? <ActivityIndicator color={WHITE_COLOR} size="small" /> : null}
            <Text style={submitTextStyle}>{FM('users.updatePassword')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalShell>
  );
};
