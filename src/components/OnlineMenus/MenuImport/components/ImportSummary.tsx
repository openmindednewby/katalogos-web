/**
 * Import summary card: shows results after a successful import.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { menuImportStyles as modalStyles } from '../utils/menuImportStyles';

import type { ImportSummary as ImportSummaryData } from '../utils/buildMenuContents';

interface Props {
  summary: ImportSummaryData;
  textColor: string;
  borderColor: string;
}

const summaryStyles = StyleSheet.create({
  card: { borderWidth: 1 },
  title: { fontWeight: '600', marginBottom: 8 },
});

const ImportSummaryCard: React.FC<Props> = ({ summary, textColor, borderColor }) => (
  <View style={[modalStyles.summaryCard, summaryStyles.card, { borderColor }]} testID={TestIds.MENU_IMPORT_SUMMARY}>
    <Text style={[modalStyles.summaryLabel, summaryStyles.title, { color: textColor }]}>
      {FM('menuImport.summary.importComplete')}
    </Text>
    <View style={modalStyles.summaryRow}>
      <Text style={[modalStyles.summaryLabel, { color: textColor }]}>{FM('menuImport.summary.itemsImported', String(summary.itemCount))}</Text>
    </View>
    <View style={modalStyles.summaryRow}>
      <Text style={[modalStyles.summaryLabel, { color: textColor }]}>{FM('menuImport.summary.categoriesCreated', String(summary.categoryCount))}</Text>
    </View>
    {summary.skippedCount > 0 ? (
      <View style={modalStyles.summaryRow}>
        <Text style={[modalStyles.summaryLabel, { color: textColor }]}>{FM('menuImport.summary.rowsSkipped', String(summary.skippedCount))}</Text>
      </View>
    ) : null}
  </View>
);

export default ImportSummaryCard;
