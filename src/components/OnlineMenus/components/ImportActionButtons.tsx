/**
 * Import action buttons for the menu content editor.
 * Includes CSV/Excel import and AI photo import.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

interface Props {
  primaryColor: string;
  textOnPrimary: string;
  onOpenCsvImport: () => void;
  onOpenAiImport: () => void;
}

const styles = StyleSheet.create({
  button: { padding: 10, borderRadius: 6, marginTop: 8 },
  buttonText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

const ImportActionButtons: React.FC<Props> = ({ primaryColor, textOnPrimary, onOpenCsvImport, onOpenAiImport }) => (
  <>
    <TouchableOpacity
      accessibilityHint={FM('menuImport.importMenuHint')}
      accessibilityLabel={FM('menuImport.importMenu')}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor: primaryColor }]}
      testID={TestIds.MENU_IMPORT_BUTTON}
      onPress={onOpenCsvImport}
    >
      <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('menuImport.importMenu')}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      accessibilityHint={FM('aiImport.importFromPhotoHint')}
      accessibilityLabel={FM('aiImport.importFromPhoto')}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor: primaryColor }]}
      testID={TestIds.AI_IMPORT_BUTTON}
      onPress={onOpenAiImport}
    >
      <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('aiImport.importFromPhoto')}</Text>
    </TouchableOpacity>
  </>
);

export default ImportActionButtons;
