import type { ReactElement } from 'react';

import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '../../../localization/helpers';
import { TABLET_BREAKPOINT_PX } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import {
  BUTTON_BORDER_RADIUS,
  LANDING_MAX_WIDTH,
  LANDING_SECTION_PADDING_HORIZONTAL,
  LANDING_SECTION_PADDING_VERTICAL,
} from '../constants';

interface Props {
  titleKey: string;
  subtitleKey: string;
  ctaTextKey: string;
  ctaHintKey: string;
  ctaRoute: string;
}

const CTA_TITLE_DESKTOP = 36;
const CTA_TITLE_MOBILE = 28;
const CTA_SUBTITLE_SIZE = 17;
const CTA_BUTTON_FONT_SIZE = 16;
const CTA_BUTTON_PADDING_H = 32;
const CTA_BUTTON_PADDING_V = 16;
const CTA_SUBTITLE_MAX_WIDTH = 520;

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center' },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    paddingVertical: LANDING_SECTION_PADDING_VERTICAL,
    alignItems: 'center',
  },
  title: { fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
    maxWidth: CTA_SUBTITLE_MAX_WIDTH,
  },
  button: {
    marginTop: 32,
    paddingHorizontal: CTA_BUTTON_PADDING_H,
    paddingVertical: CTA_BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: { fontSize: CTA_BUTTON_FONT_SIZE, fontWeight: '700' },
});

/**
 * Call-to-action section used at the bottom of landing pages.
 * Full-width section with heading, subtitle, and CTA button.
 */
const CTASection = ({ titleKey, subtitleKey, ctaTextKey, ctaHintKey, ctaRoute }: Props): ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width <= TABLET_BREAKPOINT_PX;
  const colors = theme.colors;
  const primaryColor = theme.palette.primary[500];

  function handlePress(): void {
    router.push(ctaRoute);
  }

  return (
    <View
      style={[styles.outer, { backgroundColor: colors.surface }]}
      testID={TestIds.LANDING_CTA_SECTION}
    >
      <View style={styles.inner}>
        <Text
          style={[
            styles.title,
            {
              fontSize: isMobile ? CTA_TITLE_MOBILE : CTA_TITLE_DESKTOP,
              color: colors.text,
            },
          ]}
        >
          {FM(titleKey)}
        </Text>
        <Text style={[styles.subtitle, { fontSize: CTA_SUBTITLE_SIZE, color: colors.textSecondary }]}>
          {FM(subtitleKey)}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM(ctaHintKey)}
          accessibilityLabel={FM(ctaTextKey)}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handlePress}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>{FM(ctaTextKey)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CTASection;
