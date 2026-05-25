import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import type { CompletedQuestionerWithUser } from '@/server/customHooks/useCompletedQuestionersWithUsers';
import { useTheme } from '@/theme/hooks/useTheme';

import { generateCsvExport } from './generateCsvExport';
import { generateJsonExport } from './generateJsonExport';


const BUTTON_TEXT_COLOR = '#fff';

/** Full opacity for enabled buttons */
const OPACITY_ENABLED = 1;
/** Reduced opacity for disabled buttons */
const OPACITY_DISABLED = 0.5;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  row: { flexDirection: 'row', marginTop: 8, alignItems: 'center', gap: 8 },
  count: { marginRight: 12 },
  buttonBase: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  csvSpacing: { marginLeft: 8 },
  buttonText: { color: BUTTON_TEXT_COLOR },
});

export enum ExportType {
  JSON = 'json',
  CSV = 'csv',
}

interface Props {
  items?: CompletedQuestionerWithUser[];
}

const ExportButtons = ({ items = [] }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const primary = theme.palette.primary['500'];
  const secondary = theme.palette.secondary['500'];

  const count = items.length;
  const canExport = count > 0;

  const countStyle = useMemo(() => [styles.count, { color: theme.colors.textSecondary }], [theme.colors.textSecondary]);
  const jsonButtonStyle = useMemo(
    () => [styles.buttonBase, { backgroundColor: secondary, opacity: canExport ? OPACITY_ENABLED : OPACITY_DISABLED }],
    [canExport, secondary]
  );
  const csvButtonStyle = useMemo(
    () => [styles.buttonBase, styles.csvSpacing, { backgroundColor: primary, opacity: canExport ? OPACITY_ENABLED : OPACITY_DISABLED }],
    [canExport, primary]
  );

  function handleExport(kind: ExportType): void {
    if (!canExport) return;
    if (kind === ExportType.JSON) generateJsonExport(items);
    if (kind === ExportType.CSV) generateCsvExport(items);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={countStyle}>{FM('quizAnswers.exportCount', String(count))}</Text>
        <TouchableOpacity accessibilityRole="button" disabled={!canExport} onPress={() => handleExport(ExportType.JSON)}>
          <View style={jsonButtonStyle}>
            <Text style={styles.buttonText}>{FM('quizAnswers.exportJson')}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={!canExport} onPress={() => handleExport(ExportType.CSV)}>
          <View style={csvButtonStyle}>
            <Text style={styles.buttonText}>{FM('quizAnswers.exportCsv')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExportButtons;
