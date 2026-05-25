import type { ReactElement } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { CARD_BORDER_RADIUS } from '../constants';

interface Props {
  titleKey: string;
  descriptionKey: string;
}

const TITLE_FONT_SIZE = 17;
const DESC_FONT_SIZE = 14;
const CARD_PADDING = 24;

const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
    flex: 1,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: DESC_FONT_SIZE,
    lineHeight: 22,
  },
});

/**
 * Individual feature highlight card.
 * Displays a heading and description within a bordered card.
 */
const FeatureItem = ({ titleKey, descriptionKey }: Props): ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={TestIds.LANDING_FEATURE_ITEM}
    >
      <Text style={[styles.title, { color: colors.text }]}>{FM(titleKey)}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{FM(descriptionKey)}</Text>
    </View>
  );
};

export default FeatureItem;
