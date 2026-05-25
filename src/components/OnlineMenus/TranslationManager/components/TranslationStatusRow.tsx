/**
 * A single row in the translation status grid.
 * Shows language name, status badge, and action buttons.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';
import ThemeMode from '@/shared/enums/ThemeMode';
import { TestIds } from '@/shared/testIds';
import type { RootState } from '@/store/reduxStore';
import { themePalette } from '@/theme/utils/styles';

import TranslationStatus from '../../../../shared/enums/TranslationStatus';

import type { MenuTranslationSummary } from '../../../../types/menuTypes';

const ACTION_PADDING_H = 12;
const ACTION_PADDING_V = 6;
const BADGE_PADDING_H = 8;
const BADGE_PADDING_V = 4;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  languageName: { flex: 1, fontSize: 16, fontWeight: '500' },
  statusBadge: { paddingHorizontal: BADGE_PADDING_H, paddingVertical: BADGE_PADDING_V, borderRadius: 4, marginRight: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: ACTION_PADDING_H, paddingVertical: ACTION_PADDING_V, borderRadius: 6 },
  actionText: { fontSize: 13, fontWeight: '600' },
});

function getStatusLabel(status: TranslationStatus): string {
  const labels: Record<TranslationStatus, string> = {
    [TranslationStatus.Pending]: FM('translations.statusPending'),
    [TranslationStatus.InProgress]: FM('translations.statusInProgress'),
    [TranslationStatus.Completed]: FM('translations.statusCompleted'),
    [TranslationStatus.Failed]: FM('translations.statusFailed'),
    [TranslationStatus.Stale]: FM('translations.statusStale'),
  };
  return labels[status];
}

interface StatusColors {
  success: string;
  error: string;
  warning: string;
  muted: string;
}

function getStatusColor(status: TranslationStatus, statusColors: StatusColors): string {
  const colorMap: Record<TranslationStatus, string> = {
    [TranslationStatus.Pending]: statusColors.muted,
    [TranslationStatus.InProgress]: statusColors.muted,
    [TranslationStatus.Completed]: statusColors.success,
    [TranslationStatus.Failed]: statusColors.error,
    [TranslationStatus.Stale]: statusColors.warning,
  };
  return colorMap[status];
}

interface Props {
  translation: MenuTranslationSummary;
  borderColor: string;
  textColor: string;
  primaryColor: string;
  onEdit: (languageCode: string) => void;
  onDelete: (languageCode: string) => void;
  onRetranslate: (languageCode: string) => void;
}

export const TranslationStatusRow: React.FC<Props> = ({
  translation,
  borderColor,
  textColor,
  primaryColor,
  onEdit,
  onDelete,
  onRetranslate,
}) => {
  const themeMode = useSelector((s: RootState) => s.ui.theme);
  const paletteColors = themeMode === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const textOnPrimary = String(paletteColors.textOnPrimary);

  const statusColors: StatusColors = {
    success: String(paletteColors.success),
    error: String(paletteColors.error),
    warning: String(paletteColors.gamboge),
    muted: String(paletteColors.subtext),
  };

  const statusColor = getStatusColor(translation.status, statusColors);
  const isCompleted = translation.status === TranslationStatus.Completed;
  const canRetranslate = translation.status === TranslationStatus.Stale || translation.status === TranslationStatus.Failed;

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]} testID={TestIds.TRANSLATION_STATUS_ROW}>
      <Text style={[styles.languageName, { color: textColor }]}>{translation.languageName}</Text>

      <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(translation.status)}</Text>
      </View>

      <View style={styles.actions}>
        {isCompleted ? (
          <TouchableOpacity
            accessibilityHint={FM('translations.editHint')}
            accessibilityLabel={FM('translations.edit')}
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            testID={TestIds.TRANSLATION_EDIT_BUTTON}
            onPress={() => { onEdit(translation.languageCode); }}
          >
            <Text style={[styles.actionText, { color: textOnPrimary }]}>{FM('translations.edit')}</Text>
          </TouchableOpacity>
        ) : null}

        {canRetranslate ? (
          <TouchableOpacity
            accessibilityHint={FM('translations.retranslateHint')}
            accessibilityLabel={FM('translations.retranslate')}
            style={[styles.actionButton, { backgroundColor: statusColor }]}
            testID={`retranslate-${translation.languageCode}`}
            onPress={() => { onRetranslate(translation.languageCode); }}
          >
            <Text style={[styles.actionText, { color: textOnPrimary }]}>{FM('translations.retranslate')}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          accessibilityHint={FM('translations.deleteHint')}
          accessibilityLabel={FM('translations.delete')}
          style={[styles.actionButton, { backgroundColor: statusColors.error }]}
          testID={TestIds.TRANSLATION_DELETE_BUTTON}
          onPress={() => { onDelete(translation.languageCode); }}
        >
          <Text style={[styles.actionText, { color: textOnPrimary }]}>{FM('translations.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
