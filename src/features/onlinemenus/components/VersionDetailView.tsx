/**
 * Displays full details of a single menu version with restore and compare actions.
 * Shows a human-readable summary by default with a toggle for raw JSON.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { notify, notifySuccess } from '@/lib/notifications';
import { FM } from '@/localization/helpers';
import { useMenuVersion } from '@/server/customHooks/useMenuVersion';
import { useRestoreMenuVersion } from '@/server/customHooks/useRestoreMenuVersion';
import { TestIds } from '@/shared/testIds';
import { isValueDefined } from '@/utils/is';

import RestoreConfirmModal from './RestoreConfirmModal';
import { formatSnapshot, parseSnapshotSummary } from './utils/versionSnapshotUtils';
import VersionDiffView from './VersionDiffView';
import {
  CONTAINER_PADDING, HEADER_MARGIN_BOTTOM, TITLE_FONT_SIZE, BUTTON_RADIUS, ACTION_TEXT_FONT_SIZE,
  BACK_BUTTON_PADDING_V, BACK_BUTTON_PADDING_H, BACK_BUTTON_MARGIN_RIGHT,
  ACTION_ROW_GAP, ACTION_ROW_MARGIN_BOTTOM, ACTION_BUTTON_PADDING_V, ACTION_BUTTON_PADDING_H,
  SNAPSHOT_PADDING, SNAPSHOT_RADIUS, SNAPSHOT_FONT_SIZE,
  SNAPSHOT_TITLE_SIZE, SNAPSHOT_TITLE_MARGIN,
} from './versioningConstants';

import type { MenuVersionListDto } from '../types';

const SUMMARY_FONT_SIZE_VALUE = 14;
const SUMMARY_LABEL_FONT_SIZE = 13;
const SUMMARY_ROW_MARGIN = 4;
const SUMMARY_SECTION_PADDING = 12;
const SUMMARY_SECTION_RADIUS = 8;
const TOGGLE_PADDING_V = 8;
const TOGGLE_PADDING_H = 12;

const styles = StyleSheet.create({
  container: { flex: 1, padding: CONTAINER_PADDING },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: HEADER_MARGIN_BOTTOM },
  backButton: { paddingVertical: BACK_BUTTON_PADDING_V, paddingHorizontal: BACK_BUTTON_PADDING_H, borderRadius: BUTTON_RADIUS, marginRight: BACK_BUTTON_MARGIN_RIGHT },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: 'bold', flex: 1 },
  actionRow: { flexDirection: 'row', gap: ACTION_ROW_GAP, marginBottom: ACTION_ROW_MARGIN_BOTTOM },
  actionButton: { paddingVertical: ACTION_BUTTON_PADDING_V, paddingHorizontal: ACTION_BUTTON_PADDING_H, borderRadius: BUTTON_RADIUS },
  actionText: { fontWeight: '600', fontSize: ACTION_TEXT_FONT_SIZE },
  snapshotContainer: { borderRadius: SNAPSHOT_RADIUS, padding: SNAPSHOT_PADDING, borderWidth: 1 },
  snapshotText: { fontFamily: 'monospace', fontSize: SNAPSHOT_FONT_SIZE },
  summarySection: { borderRadius: SUMMARY_SECTION_RADIUS, padding: SUMMARY_SECTION_PADDING, borderWidth: 1, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: SUMMARY_ROW_MARGIN },
  summaryLabel: { fontSize: SUMMARY_LABEL_FONT_SIZE, fontWeight: '600' },
  summaryValue: { fontSize: SUMMARY_FONT_SIZE_VALUE },
  toggleButton: { paddingVertical: TOGGLE_PADDING_V, paddingHorizontal: TOGGLE_PADDING_H, borderRadius: BUTTON_RADIUS, marginTop: 8, alignSelf: 'flex-start' },
  toggleButtonText: { fontSize: SUMMARY_LABEL_FONT_SIZE, fontWeight: '600' },
});

interface Props {
  menuId: string;
  version: MenuVersionListDto;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  backgroundColor: string;
  onBack: () => void;
  onMenuRestored: () => void;
}

const VersionDetailView: React.FC<Props> = ({
  menuId, version, textColor, borderColor, primaryColor, backgroundColor, onBack, onMenuRestored,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const { data: detail, isLoading } = useMenuVersion(menuId, version.externalId);
  const restoreMutation = useRestoreMenuVersion();

  const handleRestore = useCallback(() => { setShowConfirm(true); }, []);
  const handleCancelRestore = useCallback(() => { setShowConfirm(false); }, []);

  const handleConfirmRestore = useCallback(() => {
    setShowConfirm(false);
    restoreMutation.mutate(
      { menuId, versionId: version.externalId },
      {
        onSuccess: () => {
          notifySuccess(FM('onlineMenus.versioning.restoreSuccess', String(version.versionNumber)));
          onMenuRestored();
        },
        onError: () => { notify('error', FM('onlineMenus.versioning.restoreFailed')); },
      },
    );
  }, [menuId, version.externalId, version.versionNumber, restoreMutation, onMenuRestored]);

  const handleCompare = useCallback(() => { setShowDiff(true); }, []);
  const handleBackFromDiff = useCallback(() => { setShowDiff(false); }, []);
  const handleToggleRawData = useCallback(() => { setShowRawData((p) => !p); }, []);

  const summary = useMemo(
    () => isValueDefined(detail) ? parseSnapshotSummary(detail.snapshot) : null,
    [detail],
  );

  if (showDiff)
    return (
      <VersionDiffView
        backgroundColor={backgroundColor} borderColor={borderColor}
        menuId={menuId} primaryColor={primaryColor} textColor={textColor}
        version={version} onBack={handleBackFromDiff}
      />
    );

  return (
    <View style={styles.container} testID={TestIds.VERSION_DETAIL_VIEW}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.versioning.backToListHint')}
          accessibilityLabel={FM('onlineMenus.versioning.backToList')}
          accessibilityRole="button"
          style={[styles.backButton, { backgroundColor: borderColor }]}
          testID={TestIds.VERSION_DETAIL_BACK_BUTTON}
          onPress={onBack}
        >
          <Text style={{ color: textColor }}>{FM('onlineMenus.versioning.backToList')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>
          {FM('onlineMenus.versioning.detailTitle', String(version.versionNumber))}
        </Text>
      </View>

      {!version.isCurrent && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.versioning.restoreHint')}
            accessibilityLabel={FM('onlineMenus.versioning.restore')}
            accessibilityRole="button"
            disabled={restoreMutation.isPending}
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            testID={TestIds.VERSION_RESTORE_BUTTON}
            onPress={handleRestore}
          >
            <Text style={[styles.actionText, { color: backgroundColor }]}>
              {FM('onlineMenus.versioning.restore')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.versioning.compareHint')}
            accessibilityLabel={FM('onlineMenus.versioning.compareWithCurrent')}
            accessibilityRole="button"
            style={[styles.actionButton, { backgroundColor: borderColor }]}
            testID={TestIds.VERSION_COMPARE_BUTTON}
            onPress={handleCompare}
          >
            <Text style={[styles.actionText, { color: textColor }]}>
              {FM('onlineMenus.versioning.compareWithCurrent')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? <ActivityIndicator /> : null}

      {!isLoading && isValueDefined(detail) && (
        <ScrollView testID={TestIds.VERSION_SNAPSHOT_PREVIEW}>
          <Text style={[styles.title, { color: textColor, fontSize: SNAPSHOT_TITLE_SIZE, marginBottom: SNAPSHOT_TITLE_MARGIN }]}>
            {FM('onlineMenus.versioning.summaryTitle')}
          </Text>

          {isValueDefined(summary) ? (
            <View style={[styles.summarySection, { borderColor, backgroundColor }]} testID={TestIds.VERSION_SUMMARY_SECTION}>
              {summary.menuName !== '' ? (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: textColor }]}>
                    {FM('onlineMenus.versioning.summaryMenuName', summary.menuName)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryValue, { color: textColor }]}>
                  {FM('onlineMenus.versioning.summaryCategoryCount', String(summary.categoryCount))}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryValue, { color: textColor }]}>
                  {FM('onlineMenus.versioning.summaryItemCount', String(summary.itemCount))}
                </Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.versioning.showRawDataHint')}
            accessibilityLabel={showRawData ? FM('onlineMenus.versioning.hideRawData') : FM('onlineMenus.versioning.showRawData')}
            accessibilityRole="button"
            style={[styles.toggleButton, { backgroundColor: borderColor }]}
            testID={TestIds.VERSION_RAW_DATA_TOGGLE}
            onPress={handleToggleRawData}
          >
            <Text style={[styles.toggleButtonText, { color: textColor }]}>
              {showRawData ? FM('onlineMenus.versioning.hideRawData') : FM('onlineMenus.versioning.showRawData')}
            </Text>
          </TouchableOpacity>

          {showRawData ? (
            <View style={[styles.snapshotContainer, { borderColor, backgroundColor }]}>
              <Text style={[styles.snapshotText, { color: textColor }]}>
                {formatSnapshot(detail.snapshot)}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <RestoreConfirmModal
        backgroundColor={backgroundColor} borderColor={borderColor}
        primaryColor={primaryColor} textColor={textColor}
        versionNumber={version.versionNumber}
        visible={showConfirm}
        onCancel={handleCancelRestore} onConfirm={handleConfirmRestore}
      />
    </View>
  );
};

export default VersionDetailView;
