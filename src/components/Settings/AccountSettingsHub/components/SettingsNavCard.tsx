/**
 * Navigation card for the Account Settings Hub.
 * Renders a tappable card with title, description, and chevron icon.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  SECTION_SPACING,
  TITLE_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  SMALL_SPACING,
  MEDIUM_SPACING,
} from '../../constants';

const CHEVRON_FONT_SIZE = 18;
const TITLE_FONT_WEIGHT = '600' as const;
const CARD_BORDER_WIDTH = 1;
const CARD_BORDER_RADIUS = 8;
const CHEVRON_SYMBOL = '\u203A';

interface SettingsNavCardProps {
  title: string;
  description: string;
  testID: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SECTION_SPACING,
    borderWidth: CARD_BORDER_WIDTH,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: MEDIUM_SPACING,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT,
  },
  description: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginTop: SMALL_SPACING,
  },
  chevron: {
    fontSize: CHEVRON_FONT_SIZE,
    marginLeft: MEDIUM_SPACING,
  },
});

const SettingsNavCard = ({
  title,
  description,
  testID,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: SettingsNavCardProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <TouchableOpacity
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
      testID={testID}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>{CHEVRON_SYMBOL}</Text>
    </TouchableOpacity>
  );
};

export default SettingsNavCard;
