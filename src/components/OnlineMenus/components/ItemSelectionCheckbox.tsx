/** ItemSelectionCheckbox - Checkbox for selecting a menu item in bulk mode. */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ItemSelectionCheckboxProps {
  isSelected: boolean;
  onToggle: () => void;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  borderColor: string;
  primaryColor: string;
  textOnPrimary: string;
}

const CHECKBOX_SIZE = 24;
const CHECKBOX_BORDER_WIDTH = 2;
const CHECKMARK_CHAR = '\u2713';

const styles = StyleSheet.create({
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderWidth: CHECKBOX_BORDER_WIDTH,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: { fontSize: 14, fontWeight: 'bold' },
});

const ItemSelectionCheckbox: React.FC<ItemSelectionCheckboxProps> = ({
  isSelected, onToggle, testID, accessibilityLabel, accessibilityHint,
  borderColor, primaryColor, textOnPrimary,
}) => {
  const bgColor = isSelected ? primaryColor : undefined;
  const bdColor = isSelected ? primaryColor : borderColor;

  return (
    <TouchableOpacity
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      style={[styles.checkbox, { borderColor: bdColor, backgroundColor: bgColor }]}
      testID={testID}
      onPress={onToggle}
    >
      {isSelected ? <Text style={[styles.checkmark, { color: textOnPrimary }]}>{CHECKMARK_CHAR}</Text> : null}
    </TouchableOpacity>
  );
};

export default ItemSelectionCheckbox;
