/**
 * Visual indicator for auto-save status.
 * Shows the current save state (saving, saved, error) with appropriate styling.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';
import SaveStatus from '@/shared/enums/SaveStatus';
import { TestIds } from '@/shared/testIds';

const INDICATOR_PADDING_H = 8;
const INDICATOR_PADDING_V = 4;
const FONT_SIZE = 12;
const DOT_SIZE = 6;
const DOT_MARGIN = 6;
const BORDER_RADIUS = 4;

interface AutoSaveIndicatorProps {
  saveStatus: SaveStatus;
  textColor: string;
  errorColor: string;
  successColor: string;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: INDICATOR_PADDING_H, paddingVertical: INDICATOR_PADDING_V, borderRadius: BORDER_RADIUS },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, marginRight: DOT_MARGIN },
  label: { fontSize: FONT_SIZE },
});

function getStatusLabel(status: SaveStatus): string {
  switch (status) {
    case SaveStatus.Idle: return '';
    case SaveStatus.Saving: return FM('onlineMenus.autoSave.saving');
    case SaveStatus.Saved: return FM('onlineMenus.autoSave.saved');
    case SaveStatus.Error: return FM('onlineMenus.autoSave.error');
    default: return '';
  }
}

function getDotColor(status: SaveStatus, textColor: string, errorColor: string, successColor: string): string {
  switch (status) {
    case SaveStatus.Idle: return textColor;
    case SaveStatus.Saving: return textColor;
    case SaveStatus.Saved: return successColor;
    case SaveStatus.Error: return errorColor;
    default: return textColor;
  }
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ saveStatus, textColor, errorColor, successColor }) => {
  if (saveStatus === SaveStatus.Idle) return null;

  const dotColor = getDotColor(saveStatus, textColor, errorColor, successColor);
  const labelColor = saveStatus === SaveStatus.Error ? errorColor : textColor;

  return (
    <View style={styles.container} testID={TestIds.AUTO_SAVE_INDICATOR}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} testID={TestIds.AUTO_SAVE_DOT} />
      <Text style={[styles.label, { color: labelColor }]} testID={TestIds.AUTO_SAVE_STATUS_TEXT}>
        {getStatusLabel(saveStatus)}
      </Text>
    </View>
  );
};

export default AutoSaveIndicator;
