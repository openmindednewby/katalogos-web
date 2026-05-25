/**
 * Modal for inviting a new team member.
 * Includes email input and role selector.
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FM } from '../../../../localization/helpers';
import { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';
import TeamRole from '../../../../shared/enums/TeamRole';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  MODAL_MAX_WIDTH, MODAL_PADDING, MODAL_BORDER_RADIUS,
  BORDER_WIDTH, BADGE_BORDER_RADIUS, BADGE_PADDING_HORIZONTAL, BADGE_PADDING_VERTICAL,
  BADGE_FONT_WEIGHT, ACTION_BUTTON_GAP, EMAIL_FONT_SIZE, SECONDARY_FONT_SIZE,
  MODAL_TITLE_FONT_SIZE, MODAL_TITLE_FONT_WEIGHT, MODAL_TITLE_MARGIN_BOTTOM,
  LABEL_MARGIN_BOTTOM, INPUT_PADDING, INPUT_MARGIN_BOTTOM,
  BUTTON_PADDING_VERTICAL, BUTTON_PADDING_HORIZONTAL, BUTTON_MIN_WIDTH, DISABLED_OPACITY,
} from '../constants';

const MANAGER_ROLE_VALUE: number = TeamRole.Manager;
const STAFF_ROLE_VALUE: number = TeamRole.Staff;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  visible: boolean;
  loading: boolean;
  onSubmit: (email: string, role: number) => void;
  onClose: () => void;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: MODAL_OVERLAY_COLOR, justifyContent: 'center', alignItems: 'center', padding: MODAL_PADDING },
  dialog: { width: '100%', maxWidth: MODAL_MAX_WIDTH, borderRadius: MODAL_BORDER_RADIUS, padding: MODAL_PADDING },
  title: { fontSize: MODAL_TITLE_FONT_SIZE, fontWeight: MODAL_TITLE_FONT_WEIGHT, marginBottom: MODAL_TITLE_MARGIN_BOTTOM },
  label: { fontSize: EMAIL_FONT_SIZE, fontWeight: '500', marginBottom: LABEL_MARGIN_BOTTOM },
  input: { borderWidth: BORDER_WIDTH, borderRadius: BADGE_BORDER_RADIUS, padding: INPUT_PADDING, fontSize: EMAIL_FONT_SIZE, marginBottom: INPUT_MARGIN_BOTTOM },
  errorText: { fontSize: SECONDARY_FONT_SIZE, marginBottom: INPUT_MARGIN_BOTTOM },
  roleRow: { flexDirection: 'row', gap: ACTION_BUTTON_GAP, marginBottom: INPUT_MARGIN_BOTTOM },
  roleOption: { paddingHorizontal: BADGE_PADDING_HORIZONTAL, paddingVertical: BADGE_PADDING_VERTICAL, borderRadius: BADGE_BORDER_RADIUS, borderWidth: BORDER_WIDTH },
  roleText: { fontSize: SECONDARY_FONT_SIZE, fontWeight: BADGE_FONT_WEIGHT },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: ACTION_BUTTON_GAP },
  button: { paddingVertical: BUTTON_PADDING_VERTICAL, paddingHorizontal: BUTTON_PADDING_HORIZONTAL, borderRadius: BADGE_BORDER_RADIUS, minWidth: BUTTON_MIN_WIDTH, alignItems: 'center' },
  cancelButton: { borderWidth: BORDER_WIDTH },
  buttonText: { fontSize: EMAIL_FONT_SIZE, fontWeight: '600' },
  disabledButton: { opacity: DISABLED_OPACITY },
});

const InviteTeamMemberModal = ({ visible, loading, onSubmit, onClose }: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const { colors } = theme;

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<number>(STAFF_ROLE_VALUE);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(FM('settings.team.messages.invalidEmail'));
      return;
    }
    setEmailError('');
    onSubmit(trimmed, selectedRole);
  }, [email, selectedRole, onSubmit]);

  const handleClose = useCallback(() => {
    setEmail('');
    setSelectedRole(STAFF_ROLE_VALUE);
    setEmailError('');
    onClose();
  }, [onClose]);

  const isManagerSelected = selectedRole === MANAGER_ROLE_VALUE;
  const isStaffSelected = selectedRole === STAFF_ROLE_VALUE;

  const submitButtonStyle = useMemo(
    () => [styles.button, { backgroundColor: theme.palette.primary['500'] }, loading ? styles.disabledButton : undefined],
    [theme.palette.primary, loading],
  );

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay} testID={TestIds.TEAM_INVITE_MODAL}>
        <View accessibilityViewIsModal role="dialog" style={[styles.dialog, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.title, { color: colors.text }]}>{FM('settings.team.inviteMember')}</Text>

          <Text style={[styles.label, { color: colors.text }]}>{FM('settings.team.email')}</Text>
          <TextInput
            accessibilityHint={FM('settings.team.emailHint')}
            accessibilityLabel={FM('settings.team.email')}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={FM('settings.team.emailPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            testID={TestIds.TEAM_INVITE_EMAIL_INPUT}
            value={email}
            onChangeText={setEmail}
          />

          {emailError !== '' ? (
            <Text style={[styles.errorText, { color: theme.semantic.error['500'] }]}>{emailError}</Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text }]}>{FM('settings.team.role')}</Text>
          <View style={styles.roleRow} testID={TestIds.TEAM_INVITE_ROLE_SELECT}>
            <TouchableOpacity
              accessibilityHint={FM('settings.team.roleHint')}
              accessibilityLabel={FM('settings.team.roleManager')}
              accessibilityRole="button"
              accessibilityState={{ selected: isManagerSelected }}
              style={[styles.roleOption, {
                borderColor: isManagerSelected ? theme.palette.primary['500'] : colors.border,
                backgroundColor: isManagerSelected ? theme.palette.primary['100'] : colors.surface,
              }]}
              onPress={() => setSelectedRole(MANAGER_ROLE_VALUE)}
            >
              <Text style={[styles.roleText, { color: isManagerSelected ? theme.palette.primary['700'] : colors.text }]}>
                {FM('settings.team.roleManager')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityHint={FM('settings.team.roleHint')}
              accessibilityLabel={FM('settings.team.roleStaff')}
              accessibilityRole="button"
              accessibilityState={{ selected: isStaffSelected }}
              style={[styles.roleOption, {
                borderColor: isStaffSelected ? theme.palette.primary['500'] : colors.border,
                backgroundColor: isStaffSelected ? theme.palette.primary['100'] : colors.surface,
              }]}
              onPress={() => setSelectedRole(STAFF_ROLE_VALUE)}
            >
              <Text style={[styles.roleText, { color: isStaffSelected ? theme.palette.primary['700'] : colors.text }]}>
                {FM('settings.team.roleStaff')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityHint={FM('settings.team.inviteMemberHint')}
              accessibilityLabel={FM('common.cancel')}
              accessibilityRole="button"
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              testID={TestIds.TEAM_INVITE_CANCEL_BUTTON}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>{FM('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityHint={FM('settings.team.sendInviteHint')}
              accessibilityLabel={FM('settings.team.sendInvite')}
              accessibilityRole="button"
              disabled={loading}
              style={submitButtonStyle}
              testID={TestIds.TEAM_INVITE_SEND_BUTTON}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color={colors.surfaceElevated} size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: colors.surfaceElevated }]}>{FM('settings.team.sendInvite')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InviteTeamMemberModal;
