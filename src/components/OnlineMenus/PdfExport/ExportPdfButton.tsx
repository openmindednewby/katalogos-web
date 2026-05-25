/**
 * Button that triggers menu PDF export.
 * Shows a spinner while the PDF is being generated.
 */
import React, { useMemo } from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';

import { useMenuPdfExport } from './hooks/useMenuPdfExport';
import { TestIds } from '../../../shared/testIds';

import type { MenuContents } from '../../../types/menuTypes';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});

interface Props {
  menuName: string;
  restaurantName: string;
  contents: MenuContents | null | undefined;
  borderColor: string;
  textColor: string;
}

const ExportPdfButton = ({
  menuName,
  restaurantName,
  contents,
  borderColor,
  textColor,
}: Props): React.ReactElement => {
  const exportParams = useMemo(() => ({ menuName, restaurantName, contents }), [menuName, restaurantName, contents]);
  const { isExporting, exportPdf } = useMenuPdfExport(exportParams);

  return (
    <TouchableOpacity
      accessibilityHint={FM('onlineMenus.pdfExport.exportAsPdfHint')}
      accessibilityLabel={FM('onlineMenus.pdfExport.exportAsPdf')}
      accessibilityRole="button"
      disabled={isExporting}
      style={[styles.button, { borderColor }]}
      testID={TestIds.MENU_EXPORT_PDF_BUTTON}
      onPress={exportPdf}
    >
      {isExporting
        ? <ActivityIndicator color={textColor} size="small" />
        : null}
      <Text style={[styles.text, { color: textColor }]}>
        {isExporting ? FM('onlineMenus.pdfExport.generating') : FM('onlineMenus.pdfExport.exportAsPdf')}
      </Text>
    </TouchableOpacity>
  );
};

export default ExportPdfButton;
