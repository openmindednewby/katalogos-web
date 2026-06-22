import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DISABLED_OPACITY } from '@/shared/constants';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { SvgIcon } from '../Icons';

import type { TenantListItemActionsProps } from './TenantListItemActionsTypes';
import type { IconName } from '../Icons';

const ACTION_ICON_SIZE = 14;
const ACTION_BUTTON_MARGIN_RIGHT = 12;
const ICON_SPACING_MARGIN_RIGHT = 4;
const PHONE_ROW_GAP = 8;

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginRight: ACTION_BUTTON_MARGIN_RIGHT, flexDirection: 'row', alignItems: 'center' },
  disabledButton: { opacity: DISABLED_OPACITY },
  iconSpacing: { marginRight: ICON_SPACING_MARGIN_RIGHT },
});

const phoneActionsStyle = { flexWrap: 'wrap' as const, rowGap: PHONE_ROW_GAP };

interface StatusAwareButtonProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
  label: string;
  activeHint: string;
  disabledHint: string;
  iconName: IconName;
  testID?: string;
  onPress: () => void;
}

/** Button that is disabled when the item is not active. */
const StatusAwareButton = ({
  isActive, activeColor, inactiveColor, label,
  activeHint, disabledHint, iconName, testID, onPress,
}: StatusAwareButtonProps): React.ReactElement => {
  const color = isActive ? activeColor : inactiveColor;
  return (
    <TouchableOpacity
      accessibilityHint={isActive ? activeHint : disabledHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isActive }}
      disabled={!isActive}
      style={[styles.actionButton, !isActive && styles.disabledButton]}
      testID={testID}
      onPress={onPress}
    >
      <View style={styles.iconSpacing}>
        <SvgIcon color={color} name={iconName} size={ACTION_ICON_SIZE} />
      </View>
      <Text style={{ color }}>{label}</Text>
    </TouchableOpacity>
  );
};

/**
 * The three status-aware actions (open-external / QR / embed), extracted so the
 * main actions row stays under the cyclomatic-complexity budget.
 */
const StatusAwareActions = (props: TenantListItemActionsProps): React.ReactElement => {
  const {
    itemID, colors, isCurrentlyActive,
    openExternalLabel, qrCodeLabel, embedLabel,
    openExternalHint, openExternalDisabledHint, qrCodeHint, qrCodeDisabledHint, embedHint, embedDisabledHint,
    shouldShowOpenExternal, shouldShowQrCode, shouldShowEmbed,
    openExternalButtonTestID, qrCodeButtonTestID, embedButtonTestID,
    onOpenExternal, onQrCode, onEmbed,
  } = props;
  return (
    <>
      {shouldShowOpenExternal && onOpenExternal ? (
        <StatusAwareButton activeColor={colors.primary} activeHint={openExternalHint} disabledHint={openExternalDisabledHint} iconName="link" inactiveColor={colors.textSecondary} isActive={isCurrentlyActive} label={openExternalLabel} testID={openExternalButtonTestID} onPress={() => onOpenExternal(itemID)} />
      ) : null}
      {shouldShowQrCode && onQrCode ? (
        <StatusAwareButton activeColor={colors.primary} activeHint={qrCodeHint} disabledHint={qrCodeDisabledHint} iconName="qrCode" inactiveColor={colors.textSecondary} isActive={isCurrentlyActive} label={qrCodeLabel} testID={qrCodeButtonTestID} onPress={() => onQrCode(itemID)} />
      ) : null}
      {shouldShowEmbed && onEmbed ? (
        <StatusAwareButton activeColor={colors.primary} activeHint={embedHint} disabledHint={embedDisabledHint} iconName="code" inactiveColor={colors.textSecondary} isActive={isCurrentlyActive} label={embedLabel} testID={embedButtonTestID} onPress={() => onEmbed(itemID)} />
      ) : null}
    </>
  );
};

const TenantListItemActions = (props: TenantListItemActionsProps): React.ReactElement => {
  const {
    itemID, title, colors,
    viewLabel, editLabel, deleteLabel, activateLabel, previewLabel, duplicateLabel,
    viewHint, editHint, deleteHint, activateHint, previewHint, duplicateHint,
    shouldShowView, shouldShowActivate, shouldShowPreview, shouldShowDuplicate,
    isCurrentlyActive, rawStatus,
    viewButtonTestID, editButtonTestID, deleteButtonTestID, activateToggleTestID,
    previewButtonTestID, duplicateButtonTestID,
    onView, onEdit, onDelete, onActivate, onPreview, onDuplicate,
  } = props;
  const { isPhone } = useBreakpoint();

  return (
    <View style={[styles.actionsRow, isPhone && phoneActionsStyle]}>
      {shouldShowView && onView ? (
        <TouchableOpacity accessibilityHint={viewHint} accessibilityLabel={viewLabel} accessibilityRole="button" style={styles.actionButton} testID={viewButtonTestID} onPress={() => onView(itemID)}>
          <View style={styles.iconSpacing}><SvgIcon color={colors.primary} name="eye" size={ACTION_ICON_SIZE} /></View>
          <Text style={{ color: colors.primary }}>{viewLabel}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity accessibilityHint={editHint} accessibilityLabel={editLabel} accessibilityRole="button" style={styles.actionButton} testID={editButtonTestID} onPress={() => onEdit(itemID, title)}>
        <View style={styles.iconSpacing}><SvgIcon color={colors.primary} name="edit" size={ACTION_ICON_SIZE} /></View>
        <Text style={{ color: colors.primary }}>{editLabel}</Text>
      </TouchableOpacity>
      {shouldShowActivate && onActivate ? (
        <TouchableOpacity accessibilityHint={activateHint} accessibilityLabel={activateLabel} accessibilityRole="button" style={styles.actionButton} testID={activateToggleTestID} onPress={() => onActivate(itemID, rawStatus)}>
          <View style={styles.iconSpacing}><SvgIcon color={colors.secondary} name={isCurrentlyActive ? 'refresh' : 'lightning'} size={ACTION_ICON_SIZE} /></View>
          <Text style={{ color: colors.secondary }}>{activateLabel}</Text>
        </TouchableOpacity>
      ) : null}
      {shouldShowPreview && onPreview ? (
        <TouchableOpacity accessibilityHint={previewHint} accessibilityLabel={previewLabel} accessibilityRole="button" style={styles.actionButton} testID={previewButtonTestID} onPress={() => onPreview(itemID)}>
          <View style={styles.iconSpacing}><SvgIcon color={colors.primary} name="eye" size={ACTION_ICON_SIZE} /></View>
          <Text style={{ color: colors.primary }}>{previewLabel}</Text>
        </TouchableOpacity>
      ) : null}
      {shouldShowDuplicate && onDuplicate ? (
        <TouchableOpacity accessibilityHint={duplicateHint} accessibilityLabel={duplicateLabel} accessibilityRole="button" style={styles.actionButton} testID={duplicateButtonTestID} onPress={() => onDuplicate(itemID)}>
          <View style={styles.iconSpacing}><SvgIcon color={colors.primary} name="copy" size={ACTION_ICON_SIZE} /></View>
          <Text style={{ color: colors.primary }}>{duplicateLabel}</Text>
        </TouchableOpacity>
      ) : null}
      <StatusAwareActions {...props} />
      <TouchableOpacity accessibilityHint={deleteHint} accessibilityLabel={deleteLabel} accessibilityRole="button" style={styles.actionButton} testID={deleteButtonTestID} onPress={() => onDelete(itemID)}>
        <View style={styles.iconSpacing}><SvgIcon color={colors.error} name="trash" size={ACTION_ICON_SIZE} /></View>
        <Text style={{ color: colors.error }}>{deleteLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TenantListItemActions;
