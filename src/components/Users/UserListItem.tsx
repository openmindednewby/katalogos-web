import React from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import { sanitizeText } from '../../utils/sanitize';

const STATUS_ENABLED_BACKGROUND_COLOR = '#22c55e20';
const STATUS_DISABLED_BACKGROUND_COLOR = '#ef444420';
const STATUS_ENABLED_TEXT_COLOR = '#22c55e';
const STATUS_DISABLED_TEXT_COLOR = '#ef4444';
const RESET_BUTTON_COLOR = '#3b82f6';
const DELETE_BUTTON_COLOR = '#ef4444';
const ENABLE_BUTTON_COLOR = '#22c55e';
const DISABLE_BUTTON_COLOR = '#f59e0b';
const USERNAME_MAX_LENGTH = 50;
const PHONE_NUMBER_MAX_LENGTH = 30;
const ROLE_MAX_LENGTH = 50;

export interface UserItem {
  id: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  createdTimestamp?: number;
  roles?: string[];
  tenantId?: string;
}

interface Props {
  item: UserItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onResetPassword: (id: string) => void;
  deleting?: boolean;
  toggling?: boolean;
}

const styles = StyleSheet.create({
  container: { padding: 16, marginBottom: 8, borderRadius: 8, borderWidth: 1 },
  infoBlock: { marginBottom: 12 },
  displayName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  line: { fontSize: 14, marginBottom: 2 },
  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 4 },
  statusBlock: { marginBottom: 12 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusEnabled: { backgroundColor: STATUS_ENABLED_BACKGROUND_COLOR },
  statusDisabled: { backgroundColor: STATUS_DISABLED_BACKGROUND_COLOR },
  statusTextEnabled: { color: STATUS_ENABLED_TEXT_COLOR },
  statusTextDisabled: { color: STATUS_DISABLED_TEXT_COLOR },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 14, fontWeight: '600' },
  resetButton: { backgroundColor: RESET_BUTTON_COLOR },
  deleteButton: { backgroundColor: DELETE_BUTTON_COLOR },
  enableButton: { backgroundColor: ENABLE_BUTTON_COLOR },
  disableButton: { backgroundColor: DISABLE_BUTTON_COLOR },
});

/* eslint-disable complexity */
const UserListItem = ({
  item,
  onEdit,
  onDelete,
  onToggleEnabled,
  onResetPassword,
  deleting = false,
  toggling = false,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  const firstName = item.firstName ?? '';
  const lastName = item.lastName ?? '';
  const hasFirst = firstName.length > 0;
  const hasLast = lastName.length > 0;
  const rawDisplayName = hasFirst || hasLast ? `${firstName} ${lastName}`.trim() : item.username;
  const displayName = sanitizeText(rawDisplayName, 100);
  const username = sanitizeText(item.username, USERNAME_MAX_LENGTH);
  const email = isValueDefined(item.email) && item.email.length > 0 ? sanitizeText(item.email, 100) : null;
  const phoneNumber = isValueDefined(item.phoneNumber) && item.phoneNumber.length > 0 ? sanitizeText(item.phoneNumber, PHONE_NUMBER_MAX_LENGTH) : null;
  const roles = item.roles ?? [];

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID="user-item"
    >
      {/* User Info */}
      <View style={styles.infoBlock}>
        <Text style={[styles.displayName, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.line, { color: colors.textSecondary }]}>{FM('users.atUsername', username)}</Text>
        {isValueDefined(email) ? <Text style={[styles.line, { color: colors.textSecondary }]}>{email}</Text> : null}
        {isValueDefined(phoneNumber) ? <Text style={[styles.line, { color: colors.textSecondary }]}>{phoneNumber}</Text> : null}

        {/* Roles */}
        {roles.length > 0 ? <View style={styles.rolesRow}>
            {roles.map((role) => (
              <View
                key={role}
                style={[styles.rolePill, { backgroundColor: `${String(primary)}20` }]}
              >
                <Text style={[styles.statusText, { color: primary }]}>{sanitizeText(role, ROLE_MAX_LENGTH)}</Text>
              </View>
            ))}
          </View> : null}
      </View>

      {/* Status Badge */}
      <View style={styles.statusBlock}>
        <View
          style={[styles.statusPill, item.enabled ? styles.statusEnabled : styles.statusDisabled]}
        >
          <Text style={[styles.statusText, item.enabled ? styles.statusTextEnabled : styles.statusTextDisabled]}>
            {item.enabled ? FM('common.enabled') : FM('common.disabled')}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          accessibilityHint={FM('users.editUserHint')}
          accessibilityLabel={FM('users.editUserLabel')}
          accessibilityRole="button"
          disabled={deleting || toggling}
          style={[styles.actionButton, { backgroundColor: String(primary) }]}
          onPress={() => onEdit(item.id)}
        >
          <Text style={[styles.actionText, { color: String(colors.background) }]}>{FM('common.edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('users.toggleEnabledHint')}
          accessibilityLabel={item.enabled ? FM('users.disableUserLabel') : FM('users.enableUserLabel')}
          accessibilityRole="button"
          disabled={deleting || toggling}
          style={[
            styles.actionButton,
            styles.actionButtonRow,
            item.enabled ? styles.disableButton : styles.enableButton,
          ]}
          onPress={() => onToggleEnabled(item.id, !item.enabled)}
        >
          {toggling ? <ActivityIndicator color={String(colors.textSecondary)} size="small" /> : null}
          <Text style={[styles.actionText, { color: String(colors.textSecondary) }]}>{item.enabled ? FM('common.disable') : FM('common.enable')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('users.resetPasswordHint')}
          accessibilityLabel={FM('users.resetPasswordLabel')}
          accessibilityRole="button"
          disabled={deleting || toggling}
          style={[styles.actionButton, styles.resetButton]}
          onPress={() => onResetPassword(item.id)}
        >
          <Text style={[styles.actionText, { color: String(colors.background) }]}>{FM('users.resetPassword')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('users.deleteUserHint')}
          accessibilityLabel={FM('users.deleteUserLabel')}
          accessibilityRole="button"
          disabled={deleting || toggling}
          style={[styles.actionButton, styles.actionButtonRow, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          {deleting ? <ActivityIndicator color={String(colors.textSecondary)} size="small" /> : null}
          <Text style={[styles.actionText, { color: String(colors.textSecondary) }]}>{FM('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* eslint-enable complexity */
export default UserListItem;
