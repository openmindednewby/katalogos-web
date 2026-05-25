/**
 * Undo/Redo toolbar for the Menu Editor.
 * Renders two buttons that call the provided undo/redo callbacks.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { DISABLED_OPACITY } from '@/shared/constants';
import { TestIds } from '@/shared/testIds';

const ENABLED_OPACITY = 1;
const ICON_FONT_SIZE = 18;
const BUTTON_PADDING_H = 12;
const BUTTON_PADDING_V = 6;
const BUTTON_RADIUS = 6;
const BAR_GAP = 8;
const BAR_MARGIN_BOTTOM = 12;

interface UndoRedoBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  borderColor: string;
  textColor: string;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: BAR_GAP, marginBottom: BAR_MARGIN_BOTTOM },
  button: { paddingHorizontal: BUTTON_PADDING_H, paddingVertical: BUTTON_PADDING_V, borderRadius: BUTTON_RADIUS, borderWidth: 1 },
  enabled: { opacity: ENABLED_OPACITY },
  disabled: { opacity: DISABLED_OPACITY },
  label: { fontSize: ICON_FONT_SIZE, fontWeight: '600' },
});

const UndoRedoBar: React.FC<UndoRedoBarProps> = ({ canUndo, canRedo, onUndo, onRedo, borderColor, textColor }) => (
  <View style={styles.bar} testID={TestIds.MENU_EDITOR_UNDO_REDO_BAR}>
    <TouchableOpacity
      accessibilityHint={canUndo ? FM('onlineMenus.undoHint') : FM('onlineMenus.undoDisabledHint')}
      accessibilityLabel={FM('onlineMenus.undo')}
      accessibilityRole="button"
      disabled={!canUndo}
      style={[styles.button, canUndo ? styles.enabled : styles.disabled, { borderColor }]}
      testID={TestIds.MENU_EDITOR_UNDO_BUTTON}
      onPress={onUndo}
    >
      <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.undo')}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      accessibilityHint={canRedo ? FM('onlineMenus.redoHint') : FM('onlineMenus.redoDisabledHint')}
      accessibilityLabel={FM('onlineMenus.redo')}
      accessibilityRole="button"
      disabled={!canRedo}
      style={[styles.button, canRedo ? styles.enabled : styles.disabled, { borderColor }]}
      testID={TestIds.MENU_EDITOR_REDO_BUTTON}
      onPress={onRedo}
    >
      <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.redo')}</Text>
    </TouchableOpacity>
  </View>
);

export default UndoRedoBar;
