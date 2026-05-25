import React, { useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useSelector } from 'react-redux';

import { KeycloakRoles } from '../../../src/auth/keycloakTypes';
import ModalShell from '../../../src/components/Shared/ModalShell';
import PageHeaderWithActions from '../../../src/components/Shared/PageHeaderWithActions';
import { PasswordResetModal } from '../../../src/components/Users/PasswordResetModal';
import { TenantSelector } from '../../../src/components/Users/TenantSelector';
import UserForm from '../../../src/components/Users/UserForm';
import UserListItem from '../../../src/components/Users/UserListItem';
import {
  useUserQueries, useUsersList, useCreateUser,
  useDeleteUser, useToggleUserEnabled, usePasswordSubmit,
} from '../../../src/hooks/useUserPageHandlers';
import { notify } from '../../../src/lib/notifications';
import { FM } from '../../../src/localization/helpers';
import ThemeMode from '../../../src/shared/enums/ThemeMode';
import { TestIds } from '../../../src/shared/testIds';
import { layoutStyles, themePalette } from '../../../src/theme/utils/styles';
import { isValueDefined } from '../../../src/utils/is';

import type { RootState } from '../../../src/store/reduxStore';

interface TenantsData {
  tenants?: Array<{ tenantId?: string; name?: string }>;
}

interface ThemeColors {
  background: string;
  text: string;
  subtext: string;
  primary: string;
  surface: string;
  border: string;
  error: string;
}

interface UserListContentOptions {
  isLoading: boolean;
  users: Array<{ id: string; [key: string]: unknown }>;
  selectedTenantId: string | null;
  colors: ThemeColors;
  btnStyle: StyleProp<ViewStyle>;
  onShowCreate: () => void;
  deletingUserId: string | null;
  togglingUserId: string | null;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onResetPassword: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

const WHITE_COLOR = '#fff';
const CONTENT_PADDING = 16;
const TEXT_FONT_SIZE = 16;
const TEXT_MARGIN_BOTTOM = 16;
const BUTTON_PADDING_HORIZONTAL = 16;
const BUTTON_PADDING_VERTICAL = 10;
const BUTTON_BORDER_RADIUS = 8;

const staticStyles = StyleSheet.create({
  headerWrapper: { paddingHorizontal: CONTENT_PADDING },
  userListWrapper: { flex: 1, paddingHorizontal: CONTENT_PADDING },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { fontSize: TEXT_FONT_SIZE, marginBottom: TEXT_MARGIN_BOTTOM },
  primaryButton: { paddingHorizontal: BUTTON_PADDING_HORIZONTAL, paddingVertical: BUTTON_PADDING_VERTICAL, borderRadius: BUTTON_BORDER_RADIUS },
  primaryButtonText: { fontWeight: '600', color: WHITE_COLOR },
  listContent: { paddingBottom: CONTENT_PADDING },
  noAccessContainer: { padding: CONTENT_PADDING },
  noAccessText: { fontSize: TEXT_FONT_SIZE },
});

function isTenantsData(value: unknown): value is TenantsData {
  return typeof value === 'object' && isValueDefined(value);
}

function renderNoAccess(containerStyle: StyleProp<ViewStyle>, textColor: string): React.ReactElement {
  return (
    <View style={[containerStyle, staticStyles.noAccessContainer]}>
      <Text style={[staticStyles.noAccessText, { color: textColor }]}>{FM('users.noAccessPermission')}</Text>
    </View>
  );
}

function renderErrorState(opts: {
  containerStyle: StyleProp<ViewStyle>;
  colors: ThemeColors;
  btnStyle: StyleProp<ViewStyle>;
  onRefresh: () => void;
}): React.ReactElement {
  return (
    <View style={opts.containerStyle}>
      <View style={staticStyles.centered}>
        <Text style={[staticStyles.emptyStateText, { color: opts.colors.error }]}>{FM('users.errors.loadFailed')}</Text>
        <TouchableOpacity accessibilityHint={FM('users.errors.retryHint')} accessibilityLabel={FM('common.refresh')} accessibilityRole="button" style={opts.btnStyle} testID={TestIds.USERS_RETRY_BUTTON} onPress={opts.onRefresh}>
          <Text style={staticStyles.primaryButtonText}>{FM('common.refresh')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function renderUserListContent(opts: UserListContentOptions): React.ReactElement | null {
  if (opts.isLoading)
    return (
      <View style={staticStyles.centered}>
        <ActivityIndicator accessibilityHint={FM('loading')} accessibilityLabel={FM('loading')} accessibilityRole="progressbar" size="large" testID={TestIds.LOADING_INDICATOR} />
      </View>
    );

  if (opts.users.length === 0) {
    const emptyLabel = isValueDefined(opts.selectedTenantId) ? FM('users.noUsersForTenant') : FM('users.noUsersFound');
    return (
      <View style={staticStyles.centered}>
        <Text style={[staticStyles.emptyStateText, { color: opts.colors.subtext }]}>{emptyLabel}</Text>
        <TouchableOpacity accessibilityHint={FM('users.createFirstUserHint')} accessibilityLabel={FM('users.createFirstUser')} accessibilityRole="button" style={opts.btnStyle} onPress={opts.onShowCreate}>
          <Text style={staticStyles.primaryButtonText}>{FM('users.createFirstUser')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList contentContainerStyle={staticStyles.listContent} data={opts.users} keyExtractor={(item) => item.id} renderItem={({ item }) => (
      <UserListItem deleting={opts.deletingUserId === item.id} item={item} toggling={opts.togglingUserId === item.id} onDelete={opts.onDelete} onEdit={opts.onEdit} onResetPassword={opts.onResetPassword} onToggleEnabled={opts.onToggleEnabled} />
    )} />
  );
}

const UsersPage = (): React.ReactElement => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const currentUser = useSelector((s: RootState) => s.auth.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [passwordResetUserId, setPasswordResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const isSuperUser = (currentUser?.roles ?? []).includes(KeycloakRoles.SuperUser);

  const queries = useUserQueries();
  const { tenantsQuery, usersQuery, createMutation, deleteMutation, setEnabledMutation, updatePasswordMutation, refetchUsers, refetchTenants } = queries;
  const tenantsData: TenantsData | undefined = isTenantsData(tenantsQuery.data) ? tenantsQuery.data : undefined;
  const tenants = Array.isArray(tenantsData?.tenants) ? tenantsData.tenants : [];
  const users = useUsersList(usersQuery, selectedTenantId);

  const closePasswordModal = useCallback((): void => { setShowPasswordModal(false); setPasswordResetUserId(null); setNewPassword(''); }, []);
  const handleCloseCreateModal = useCallback(() => setShowCreateModal(false), []);
  const createUserCallbacks = useMemo(() => ({ onSuccess: handleCloseCreateModal }), [handleCloseCreateModal]);
  const handleCreateUser = useCreateUser(createMutation, refetchUsers, createUserCallbacks);
  const handleDeleteUser = useDeleteUser(deleteMutation, refetchUsers, useMemo(() => ({ setDeletingUserId }), []));
  const handleToggleEnabled = useToggleUserEnabled(setEnabledMutation, refetchUsers, useMemo(() => ({ setTogglingUserId }), []));
  const passwordState = useMemo(() => ({ passwordResetUserId, newPassword, closeModal: closePasswordModal }), [passwordResetUserId, newPassword, closePasswordModal]);
  const handlePasswordSubmit = usePasswordSubmit(updatePasswordMutation, passwordState);
  const containerStyle = useMemo(() => [layoutStyles.container, { backgroundColor: colors.background }], [colors.background]);
  const handleRefresh = useCallback((): void => { refetchTenants(); refetchUsers(); }, [refetchTenants, refetchUsers]);
  const handleResetPassword = useCallback((userId: string): void => { setPasswordResetUserId(userId); setShowPasswordModal(true); }, []);
  const handleEditUser = useCallback((_id: string): void => { notify('info', { message: FM('users.editNotImplemented') }); }, []);

  if (!isSuperUser) return renderNoAccess(containerStyle, colors.text);

  const btnStyle = [staticStyles.primaryButton, { backgroundColor: colors.primary }];

  if (usersQuery.isError === true) return renderErrorState({ containerStyle, colors, btnStyle, onRefresh: handleRefresh });

  const defaultTenantId = selectedTenantId ?? tenants[0]?.tenantId ?? '';
  const selectorColors = { text: colors.text, subtext: colors.subtext, primary: colors.primary, surface: colors.surface, border: colors.border };
  const pwColors = { text: colors.text, surface: colors.surface, border: colors.border, primary: colors.primary };
  const openCreateModal = (): void => { setShowCreateModal(true); };

  return (
    <View style={containerStyle}>
      <View style={staticStyles.headerWrapper}>
        <PageHeaderWithActions showAdd addLabel={FM('users.addLabel')} refreshing={tenantsQuery.isLoading || usersQuery.isLoading} refreshLabel={FM('common.refresh')} title={FM('users.title')} onAdd={openCreateModal} onRefresh={handleRefresh} />
      </View>

      <TenantSelector colors={selectorColors} isLoading={tenantsQuery.isLoading} selectedTenantId={selectedTenantId} tenants={tenants} onSelectTenant={setSelectedTenantId} />

      <View style={staticStyles.userListWrapper}>
        {renderUserListContent({
          isLoading: usersQuery.isLoading === true,
          users,
          selectedTenantId,
          colors,
          btnStyle,
          onShowCreate: openCreateModal,
          deletingUserId,
          togglingUserId,
          onDelete: handleDeleteUser,
          onEdit: handleEditUser,
          onResetPassword: handleResetPassword,
          onToggleEnabled: handleToggleEnabled,
        })}
      </View>

      <ModalShell title={FM('users.createModalTitle')} visible={showCreateModal} onCancel={handleCloseCreateModal}>
        <UserForm saving={createMutation.status === 'pending'} tenantId={defaultTenantId} tenants={tenants.map((t) => ({ id: t.tenantId ?? '', name: t.name ?? '' }))} onCancel={handleCloseCreateModal} onSave={handleCreateUser} />
      </ModalShell>

      <PasswordResetModal colors={pwColors} isUpdating={updatePasswordMutation.status === 'pending'} newPassword={newPassword} visible={showPasswordModal} onCancel={closePasswordModal} onPasswordChange={setNewPassword} onSubmit={handlePasswordSubmit} />
    </View>
  );
};

export default UsersPage;
