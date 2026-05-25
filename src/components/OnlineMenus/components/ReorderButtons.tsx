/**
 * ReorderButtons - A pair of move up/down buttons for reordering list items.
 *
 * Renders compact arrow buttons. Disables "up" on the first item
 * and "down" on the last item.
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { reorderButtonStyles as styles } from './reorderButtonStyles';

interface ReorderButtonsProps {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  moveUpTestId: string;
  moveDownTestId: string;
  moveUpLabel: string;
  moveDownLabel: string;
  moveUpHint: string;
  moveDownHint: string;
  borderColor: string;
  textColor: string;
}

const ReorderButtons: React.FC<ReorderButtonsProps> = ({
  index,
  total,
  onMoveUp,
  onMoveDown,
  moveUpTestId,
  moveDownTestId,
  moveUpLabel,
  moveDownLabel,
  moveUpHint,
  moveDownHint,
  borderColor,
  textColor,
}) => {
  const isFirst = index === 0;
  const lastIndex = total - 1;
  const isLast = index === lastIndex;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityHint={moveUpHint}
        accessibilityLabel={moveUpLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isFirst }}
        disabled={isFirst}
        style={[styles.button, { backgroundColor: borderColor }, isFirst ? styles.buttonDisabled : undefined]}
        testID={moveUpTestId}
        onPress={onMoveUp}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.moveUpArrow')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityHint={moveDownHint}
        accessibilityLabel={moveDownLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLast }}
        disabled={isLast}
        style={[styles.button, { backgroundColor: borderColor }, isLast ? styles.buttonDisabled : undefined]}
        testID={moveDownTestId}
        onPress={onMoveDown}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.moveDownArrow')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReorderButtons;
