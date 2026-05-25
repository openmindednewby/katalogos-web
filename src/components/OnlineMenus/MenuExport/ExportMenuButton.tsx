/**
 * Export menu data button with format selection (CSV / JSON).
 * Appears alongside the import button in the menu content editor.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useMenuExport } from './hooks/useMenuExport';
import ExportFormat from '../../../shared/enums/ExportFormat';
import { TestIds } from '../../../shared/testIds';

import type { MenuContents } from '../../../types/menuTypes';

interface ExportMenuButtonProps {
  contents: MenuContents | null | undefined;
  menuName?: string;
  primaryColor: string;
  textOnPrimary: string;
  borderColor: string;
  textColor: string;
}

const SELECTED_OPACITY = 1;
const UNSELECTED_OPACITY = 0.5;

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  formatButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1 },
  formatButtonText: { fontSize: 13, fontWeight: '600' },
  exportButton: { padding: 10, borderRadius: 6, flex: 1 },
  exportButtonText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

const ExportMenuButton: React.FC<ExportMenuButtonProps> = ({
  contents, menuName, primaryColor, textOnPrimary, borderColor, textColor,
}) => {
  const exportParams = useMemo(() => ({ contents, menuName }), [contents, menuName]);
  const { selectedFormat, setSelectedFormat, exportMenu, hasData } = useMenuExport(exportParams);

  const handleExport = useCallback(() => { exportMenu(); }, [exportMenu]);
  const selectCsv = useCallback(() => { setSelectedFormat(ExportFormat.Csv); }, [setSelectedFormat]);
  const selectJson = useCallback(() => { setSelectedFormat(ExportFormat.Json); }, [setSelectedFormat]);

  const csvOpacity = selectedFormat === ExportFormat.Csv ? SELECTED_OPACITY : UNSELECTED_OPACITY;
  const jsonOpacity = selectedFormat === ExportFormat.Json ? SELECTED_OPACITY : UNSELECTED_OPACITY;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityHint={FM('menuExport.formatSelectHint')}
        accessibilityLabel={FM('menuExport.formatCsv')}
        accessibilityRole="button"
        style={[styles.formatButton, { borderColor, opacity: csvOpacity }]}
        testID={TestIds.MENU_EXPORT_FORMAT_CSV}
        onPress={selectCsv}
      >
        <Text style={[styles.formatButtonText, { color: textColor }]}>{FM('menuExport.formatCsv')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityHint={FM('menuExport.formatSelectHint')}
        accessibilityLabel={FM('menuExport.formatJson')}
        accessibilityRole="button"
        style={[styles.formatButton, { borderColor, opacity: jsonOpacity }]}
        testID={TestIds.MENU_EXPORT_FORMAT_JSON}
        onPress={selectJson}
      >
        <Text style={[styles.formatButtonText, { color: textColor }]}>{FM('menuExport.formatJson')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityHint={FM('menuExport.exportButtonHint')}
        accessibilityLabel={FM('menuExport.exportMenuData')}
        accessibilityRole="button"
        disabled={!hasData}
        style={[styles.exportButton, { backgroundColor: primaryColor, opacity: hasData ? SELECTED_OPACITY : UNSELECTED_OPACITY }]}
        testID={TestIds.MENU_EXPORT_DOWNLOAD_BUTTON}
        onPress={handleExport}
      >
        <Text style={[styles.exportButtonText, { color: textOnPrimary }]}>{FM('menuExport.exportMenuData')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExportMenuButton;
