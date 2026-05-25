/**
 * Displays a diff comparison between a selected version and the current version.
 * Shows changes grouped by path with color-coded change types.
 */
import React from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { useCompareMenuVersions } from '@/server/customHooks/useCompareMenuVersions';
import { useMenuVersions } from '@/server/customHooks/useMenuVersions';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { isValueDefined } from '@/utils/is';

import { formatVersionPath, getChangeSemanticKey, getChangeSummary, truncateValue } from './utils/versionDiffHelpers';
import {
  BUTTON_RADIUS, ENTRY_PADDING, ENTRY_RADIUS, MAX_VALUE_LENGTH,
  BADGE_FONT_SIZE, BADGE_FONT_WEIGHT, BADGE_PADDING_H, BADGE_PADDING_V, BADGE_RADIUS,
  CONTAINER_PADDING, HEADER_MARGIN_BOTTOM, TITLE_FONT_SIZE,
  SUMMARY_FONT_SIZE, SUMMARY_MARGIN_BOTTOM, ENTRY_MARGIN_BOTTOM,
  ENTRY_FONT_SIZE, ENTRY_FONT_WEIGHT, ENTRY_PATH_MARGIN_BOTTOM, ENTRY_BADGE_MARGIN_BOTTOM,
  VALUE_LABEL_WIDTH, VALUE_LABEL_FONT_WEIGHT, VALUE_FONT_SIZE, VALUE_MARGIN_TOP,
  EMPTY_TEXT_MARGIN_TOP, EMPTY_TEXT_FONT_SIZE,
  BACK_BUTTON_PADDING_V, BACK_BUTTON_PADDING_H, BACK_BUTTON_MARGIN_RIGHT,
} from './versioningConstants';

import type { MenuVersionListDto } from '../types';

const styles = StyleSheet.create({
  container: { flex: 1, padding: CONTAINER_PADDING },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: HEADER_MARGIN_BOTTOM },
  backButton: { paddingVertical: BACK_BUTTON_PADDING_V, paddingHorizontal: BACK_BUTTON_PADDING_H, borderRadius: BUTTON_RADIUS, marginRight: BACK_BUTTON_MARGIN_RIGHT },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: 'bold', flex: 1 },
  summaryText: { fontSize: SUMMARY_FONT_SIZE, marginBottom: SUMMARY_MARGIN_BOTTOM },
  entryContainer: { padding: ENTRY_PADDING, borderRadius: ENTRY_RADIUS, borderWidth: 1, marginBottom: ENTRY_MARGIN_BOTTOM },
  entryPath: { fontSize: ENTRY_FONT_SIZE, fontWeight: ENTRY_FONT_WEIGHT, marginBottom: ENTRY_PATH_MARGIN_BOTTOM },
  entryBadge: { alignSelf: 'flex-start', paddingHorizontal: BADGE_PADDING_H, paddingVertical: BADGE_PADDING_V, borderRadius: BADGE_RADIUS, marginBottom: ENTRY_BADGE_MARGIN_BOTTOM },
  entryBadgeText: { fontSize: BADGE_FONT_SIZE, fontWeight: BADGE_FONT_WEIGHT },
  valueRow: { flexDirection: 'row', marginTop: VALUE_MARGIN_TOP },
  valueLabel: { fontWeight: VALUE_LABEL_FONT_WEIGHT, fontSize: VALUE_FONT_SIZE, width: VALUE_LABEL_WIDTH },
  valueText: { fontSize: VALUE_FONT_SIZE, flex: 1 },
  emptyText: { textAlign: 'center', marginTop: EMPTY_TEXT_MARGIN_TOP, fontSize: EMPTY_TEXT_FONT_SIZE },
});

interface Props {
  menuId: string;
  version: MenuVersionListDto;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  backgroundColor: string;
  onBack: () => void;
}

function useCurrentVersionId(menuId: string): string {
  const { data } = useMenuVersions(menuId, 1, 1);
  const currentVersion = data?.items.find((v) => v.isCurrent);
  return currentVersion?.externalId ?? '';
}

const VersionDiffView: React.FC<Props> = ({
  menuId, version, textColor, borderColor, primaryColor, backgroundColor: _backgroundColor, onBack,
}) => {
  const currentVersionId = useCurrentVersionId(menuId);
  const { data: comparison, isLoading } = useCompareMenuVersions(menuId, version.externalId, currentVersionId);
  const { theme } = useTheme();

  const summary = isValueDefined(comparison) ? getChangeSummary(comparison.differences) : null;

  return (
    <View style={styles.container} testID={TestIds.VERSION_DIFF_VIEW}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.versioning.diffBackHint')}
          accessibilityLabel={FM('onlineMenus.versioning.backToList')}
          accessibilityRole="button"
          style={[styles.backButton, { backgroundColor: borderColor }]}
          testID={TestIds.VERSION_DIFF_BACK_BUTTON}
          onPress={onBack}
        >
          <Text style={{ color: textColor }}>{FM('onlineMenus.versioning.backToList')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>
          {FM('onlineMenus.versioning.diffTitle')}
        </Text>
      </View>

      {isLoading ? <ActivityIndicator /> : null}

      {!isLoading && isValueDefined(comparison) && comparison.differences.length === 0 && (
        <Text style={[styles.emptyText, { color: textColor }]} testID={TestIds.VERSION_DIFF_EMPTY}>
          {FM('onlineMenus.versioning.diffEmpty')}
        </Text>
      )}

      {isValueDefined(summary) && isValueDefined(comparison) && comparison.differences.length > 0 && (
        <>
          <Text style={[styles.summaryText, { color: primaryColor }]} testID={TestIds.VERSION_DIFF_SUMMARY}>
            {FM(
              'onlineMenus.versioning.diffSummary',
              String(summary.additions),
              String(summary.removals),
              String(summary.modifications),
            )}
          </Text>
          <ScrollView>
            {comparison.differences.map((diff, index) => {
              const semanticKey = getChangeSemanticKey(diff.changeType);
              const badgeBg = theme.semantic[semanticKey]['500'];
              const badgeFg = theme.colors.surfaceElevated;
              const changeLabel = FM(`onlineMenus.versioning.change${diff.changeType}`);
              return (
                <View
                  key={`${diff.path}-${String(index)}`}
                  style={[styles.entryContainer, { borderColor }]}
                  testID={TestIds.VERSION_DIFF_ENTRY}
                >
                  <Text style={[styles.entryPath, { color: textColor }]}>
                    {formatVersionPath(diff.path)}
                  </Text>
                  <View style={[styles.entryBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.entryBadgeText, { color: badgeFg }]}>{changeLabel}</Text>
                  </View>
                  {isValueDefined(diff.oldValue) && (
                    <View style={styles.valueRow}>
                      <Text style={[styles.valueLabel, { color: textColor }]}>
                        {FM('onlineMenus.versioning.oldValue')}
                      </Text>
                      <Text style={[styles.valueText, { color: textColor }]}>
                        {truncateValue(diff.oldValue, MAX_VALUE_LENGTH)}
                      </Text>
                    </View>
                  )}
                  {isValueDefined(diff.newValue) && (
                    <View style={styles.valueRow}>
                      <Text style={[styles.valueLabel, { color: textColor }]}>
                        {FM('onlineMenus.versioning.newValue')}
                      </Text>
                      <Text style={[styles.valueText, { color: textColor }]}>
                        {truncateValue(diff.newValue, MAX_VALUE_LENGTH)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default VersionDiffView;
