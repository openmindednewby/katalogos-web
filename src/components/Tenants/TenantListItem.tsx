import React from 'react';

import { View } from 'react-native';

import { FM } from '@/localization/helpers';

import TenantListItemActions from './TenantListItemActions';
import { deriveActivateState, deriveRawStatusForActions, extractItemData } from './TenantListItemHelpers';
import { getActionLabels, HeadingWithOptionalTestID, IdDisplay, StatusDisplay, UserDisplay } from './TenantListItemParts';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

interface Props<T> {
  item: T;
  onEdit: (id: string, name?: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  onPreview?: (id: string) => void;
  onOpenExternal?: (id: string) => void;
  onQrCode?: (id: string) => void;
  onEmbed?: (id: string) => void;
  titleKey?: keyof T;
  statusKey?: keyof T;
  idKey?: keyof T;
  onActivate?: (id: string, current?: boolean | number) => void;
  translationNs?: string;
  testID?: string;
  nameTestID?: string;
  editButtonTestID?: string;
  deleteButtonTestID?: string;
  activateButtonTestID?: string;
  deactivateButtonTestID?: string;
  previewButtonTestID?: string;
  openExternalButtonTestID?: string;
  qrCodeButtonTestID?: string;
  embedButtonTestID?: string;
  statusBadgeTestID?: string;
  showId?: boolean;
  idTestID?: string;
}

const TenantListItem = <T,>({
  item,
  onEdit,
  onDelete,
  onView,
  onPreview,
  onOpenExternal,
  onQrCode,
  onEmbed,
  titleKey,
  statusKey,
  idKey,
  onActivate,
  translationNs = 'tenants',
  testID,
  nameTestID,
  editButtonTestID,
  deleteButtonTestID,
  activateButtonTestID,
  deactivateButtonTestID,
  previewButtonTestID,
  openExternalButtonTestID,
  qrCodeButtonTestID,
  embedButtonTestID,
  statusBadgeTestID,
  showId = false,
  idTestID,
}: Props<T>): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const actionColors = {
    primary: theme.palette.primary['500'],
    secondary: theme.palette.secondary['500'],
    error: theme.semantic.error['500'],
    textSecondary: colors.textSecondary,
  };

  const resolvedTitleKey = titleKey ?? 'name';
  const resolvedStatusKey = statusKey ?? 'tenantStatus';
  const resolvedIdKey = idKey ?? 'externalId';
  const { title, rawStatus, itemID, numericStatus, userDisplay, showUser } = extractItemData(item, resolvedTitleKey, resolvedStatusKey, resolvedIdKey);
  const { isCurrentlyActive, activateToggleTestID } = deriveActivateState(rawStatus, activateButtonTestID, deactivateButtonTestID);

  const useGenericBadge = translationNs !== 'tenants';
  const finalTestID = testID ?? TestIds.TENANT_LIST_ITEM;
  const labels = getActionLabels(translationNs);

  return (
    <View style={[layoutStyles.listItem, { borderBottomColor: colors.border }]} testID={finalTestID}>
      <HeadingWithOptionalTestID testID={nameTestID} text={title} />
      <IdDisplay colors={colors} idTestID={idTestID} itemID={itemID} label={FM(`.id`)} showId={showId} />
      <UserDisplay colors={colors} showUser={showUser} userDisplay={userDisplay} />
      <StatusDisplay numericStatus={numericStatus} statusBadgeTestID={statusBadgeTestID} translationNs={translationNs} useGenericBadge={useGenericBadge} />
      <TenantListItemActions
        activateHint={labels.activateHint}
        activateLabel={labels.activateLabel}
        activateToggleTestID={activateToggleTestID}
        colors={actionColors}
        deleteButtonTestID={deleteButtonTestID}
        deleteHint={labels.deleteHint}
        deleteLabel={labels.deleteLabel}
        editButtonTestID={editButtonTestID}
        editHint={labels.editHint}
        editLabel={labels.editLabel}
        embedButtonTestID={embedButtonTestID}
        embedDisabledHint={labels.embedDisabledHint}
        embedHint={labels.embedHint}
        embedLabel={labels.embedLabel}
        isCurrentlyActive={isCurrentlyActive}
        itemID={itemID}
        openExternalButtonTestID={openExternalButtonTestID}
        openExternalDisabledHint={labels.openExternalDisabledHint}
        openExternalHint={labels.openExternalHint}
        openExternalLabel={labels.openExternalLabel}
        previewButtonTestID={previewButtonTestID}
        previewHint={labels.previewHint}
        previewLabel={labels.previewLabel}
        qrCodeButtonTestID={qrCodeButtonTestID}
        qrCodeDisabledHint={labels.qrCodeDisabledHint}
        qrCodeHint={labels.qrCodeHint}
        qrCodeLabel={labels.qrCodeLabel}
        rawStatus={deriveRawStatusForActions(rawStatus)}
        shouldShowActivate={typeof onActivate === 'function'}
        shouldShowEmbed={typeof onEmbed === 'function'}
        shouldShowOpenExternal={typeof onOpenExternal === 'function'}
        shouldShowPreview={typeof onPreview === 'function'}
        shouldShowQrCode={typeof onQrCode === 'function'}
        shouldShowView={typeof onView === 'function'}
        title={title}
        viewHint={labels.viewHint}
        viewLabel={labels.viewLabel}
        onActivate={onActivate}
        onDelete={onDelete}
        onEdit={onEdit}
        onEmbed={onEmbed}
        onOpenExternal={onOpenExternal}
        onPreview={onPreview}
        onQrCode={onQrCode}
        onView={onView}
      />
    </View>
  );
};

export default TenantListItem;
