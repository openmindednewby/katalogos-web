import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import ModalShell from '../../../src/components/Shared/ModalShell';
import PageHeaderWithActions from '../../../src/components/Shared/PageHeaderWithActions';
import TenantForm from '../../../src/components/Tenants/TenantForm';
import { TenantListRenderer } from '../../../src/components/Tenants/TenantListRenderer';
import { useGetRole } from '../../../src/hooks/useGetRole';
import { useTenantActions } from '../../../src/hooks/useTenantActions';
import { FM } from '../../../src/localization/helpers';
import { OTP } from '../../../src/shared/constants';
import ThemeMode from '../../../src/shared/enums/ThemeMode';
import { TestIds } from '../../../src/shared/testIds';
import { layoutStyles, themePalette } from '../../../src/theme/utils/styles';

import type { RootState } from '../../../src/store/reduxStore';

const WHITE_COLOR = '#fff';
const HEADER_PADDING_HORIZONTAL = 16;
const HEADER_MARGIN_BOTTOM = 12;
const ERROR_TEXT_FONT_SIZE = 16;
const ERROR_TEXT_MARGIN_BOTTOM = 16;
const BUTTON_PADDING_HORIZONTAL = 16;
const BUTTON_PADDING_VERTICAL = 10;
const BUTTON_BORDER_RADIUS = 8;
const OTP_EXPIRY_MINUTES = 5;
/** Primary auth method index: email-based authentication */
const AUTH_METHOD_EMAIL = 0;
/** Tenant status index: active */
const TENANT_STATUS_ACTIVE = 1;

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: HEADER_PADDING_HORIZONTAL, marginBottom: HEADER_MARGIN_BOTTOM },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: ERROR_TEXT_FONT_SIZE, textAlign: 'center', marginBottom: ERROR_TEXT_MARGIN_BOTTOM },
  retryButton: { paddingHorizontal: BUTTON_PADDING_HORIZONTAL, paddingVertical: BUTTON_PADDING_VERTICAL, borderRadius: BUTTON_BORDER_RADIUS },
  retryButtonText: { color: WHITE_COLOR, fontWeight: '600' },
});

const TenantsPage = (): React.ReactElement => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const { isSuperAdmin } = useGetRole();
  const tenantActionsArgs = useMemo(() => ({ enabled: isSuperAdmin }), [isSuperAdmin]);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const colorStyles = useMemo(
    () => ({
      container: { backgroundColor: colors.background },
      accessDenied: { color: colors.error, padding: 20 },
    }),
    [colors.background, colors.error],
  );

  const {
    tenants,
    isLoading,
    isError,
    editingId,
    showCreateModal,
    isCreating,
    isUpdating,
    handleRefetch,
    handleDelete,
    handleStartEdit,
    handleCancelEdit,
    handleUpdate,
    handleCreate,
    handleShowCreateModal,
    handleHideCreateModal,
  } = useTenantActions(tenantActionsArgs);

  // Show access denied if user is not a superAdmin
  if (!isSuperAdmin) 
    return (
      <View style={[layoutStyles.container, colorStyles.container]}>
        <Text style={colorStyles.accessDenied}>
          {FM('tenants.accessDenied')}
        </Text>
      </View>
    );

  if (isError)
    return (
      <View style={[layoutStyles.container, colorStyles.container]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {FM('tenants.errors.loadFailed')}
          </Text>
          <TouchableOpacity
            accessibilityHint={FM('tenants.errors.retryHint')}
            accessibilityLabel={FM('common.refresh')}
            accessibilityRole="button"
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            testID={TestIds.TENANTS_RETRY_BUTTON}
            onPress={handleRefetch}
          >
            <Text style={styles.retryButtonText}>{FM('common.refresh')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <View style={[layoutStyles.container, colorStyles.container]}>
      <View style={styles.headerWrap}>
        <PageHeaderWithActions
          showAdd
          addLabel={FM('tenants.addLabel')}
          refreshing={isLoading}
          refreshLabel={FM('common.refresh')}
          title={FM('tenants.title')}
          onAdd={handleShowCreateModal}
          onRefresh={handleRefetch}
        />
      </View>

      {/* Create Tenant Modal */}
      <ModalShell title={FM('tenants.createModalTitle')} visible={showCreateModal} onCancel={handleHideCreateModal}>
        <TenantForm
          initialRequireSmsVerification
          initialAllowEmailAuth={false}
          initialAllowPhoneAuth={false}
          initialName=""
          initialOtpCodeLength={OTP.DEFAULT_LENGTH}
          initialOtpExpiryMinutes={OTP_EXPIRY_MINUTES}
          initialPrimaryAuthMethod={AUTH_METHOD_EMAIL}
          initialSmsProvider={null}
          initialStatus={TENANT_STATUS_ACTIVE}
          saving={isCreating}
          onCancel={handleHideCreateModal}
          onSave={handleCreate}
        />
      </ModalShell>

      <TenantListRenderer
        editingId={editingId}
        isLoading={isLoading}
        isUpdating={isUpdating}
        listItemBorderColor={String(colors.border)}
        tenants={tenants}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        onStartEdit={handleStartEdit}
        onUpdate={handleUpdate}
      />
    </View>
  );
};

export default TenantsPage;
