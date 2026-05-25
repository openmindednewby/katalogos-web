import type { ReactElement } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import {
  BUTTON_BORDER_RADIUS,
  CARD_BORDER_RADIUS,
} from '../constants';

interface Props {
  titleKey: string;
  descriptionKey: string;
  ctaTextKey: string;
  ctaHintKey: string;
  ctaRoute: string;
}

const CARD_PADDING = 32;
const DEFAULT_BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 22;
const DESC_FONT_SIZE = 15;
const CTA_FONT_SIZE = 15;
const CTA_PADDING_HORIZONTAL = 24;
const CTA_PADDING_VERTICAL = 12;
const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: DEFAULT_BORDER_WIDTH,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    flex: 1,
  },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', marginBottom: 12 },
  description: { fontSize: DESC_FONT_SIZE, lineHeight: 24, marginBottom: 24 },
  ctaButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: CTA_PADDING_HORIZONTAL,
    paddingVertical: CTA_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  ctaText: { fontSize: CTA_FONT_SIZE, fontWeight: '600' },
});

/**
 * Service showcase card used on the brand hub page.
 * Displays a title, description, and CTA button linking to a service landing page.
 */
const ServiceCard = ({ titleKey, descriptionKey, ctaTextKey, ctaHintKey, ctaRoute }: Props): ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();

  const colors = theme.colors;
  const primaryColor = theme.palette.primary[500];

  function handlePress(): void {
    router.push(ctaRoute);
  }

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={TestIds.LANDING_SERVICE_CARD}
    >
      <Text style={[styles.title, { color: colors.text }]}>{FM(titleKey)}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{FM(descriptionKey)}</Text>
      <TouchableOpacity
        accessibilityHint={FM(ctaHintKey)}
        accessibilityLabel={FM(ctaTextKey)}
        accessibilityRole="button"
        style={[styles.ctaButton, { backgroundColor: primaryColor }]}
        onPress={handlePress}
      >
        <Text style={[styles.ctaText, { color: colors.surface }]}>{FM(ctaTextKey)}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ServiceCard;
