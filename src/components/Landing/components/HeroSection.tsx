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

const HERO_TITLE_DESKTOP = 52;
const HERO_TITLE_MOBILE = 36;
const HERO_SUBTITLE_DESKTOP = 20;
const HERO_SUBTITLE_MOBILE = 16;
const HERO_CTA_FONT_SIZE = 16;
const HERO_CTA_PADDING_HORIZONTAL = 32;
const HERO_CTA_PADDING_VERTICAL = 16;
const HERO_MAX_SUBTITLE_WIDTH = 640;
const HERO_VERTICAL_PADDING_DESKTOP = 96;

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center' },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    alignItems: 'center',
  },
  title: { fontWeight: '800', textAlign: 'center', letterSpacing: -1 },
  subtitle: {
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 20,
    maxWidth: HERO_MAX_SUBTITLE_WIDTH,
  },
  ctaButton: {
    marginTop: 36,
    paddingHorizontal: HERO_CTA_PADDING_HORIZONTAL,
    paddingVertical: HERO_CTA_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  ctaText: { fontSize: HERO_CTA_FONT_SIZE, fontWeight: '700' },
});

/**
 * Configurable hero section for landing pages.
 * Renders a large heading, subtitle text, and primary CTA button.
 */
const HeroSection = ({ titleKey, subtitleKey, ctaTextKey, ctaHintKey, ctaRoute }: Props): ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width <= TABLET_BREAKPOINT_PX;
  const colors = theme.colors;
  const primaryColor = theme.palette.primary[500];
  const verticalPadding = isMobile ? LANDING_SECTION_PADDING_VERTICAL : HERO_VERTICAL_PADDING_DESKTOP;

  function handleCtaPress(): void {
    router.push(ctaRoute);
  }

  return (
    <View
      style={[styles.outer, { paddingVertical: verticalPadding }]}
      testID={TestIds.LANDING_HERO}
    >
      <View style={styles.inner}>
        <Text
          style={[
            styles.title,
            {
              fontSize: isMobile ? HERO_TITLE_MOBILE : HERO_TITLE_DESKTOP,
              color: colors.text,
            },
          ]}
        >
          {FM(titleKey)}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: isMobile ? HERO_SUBTITLE_MOBILE : HERO_SUBTITLE_DESKTOP,
              color: colors.textSecondary,
            },
          ]}
        >
          {FM(subtitleKey)}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM(ctaHintKey)}
          accessibilityLabel={FM(ctaTextKey)}
          accessibilityRole="button"
          style={[styles.ctaButton, { backgroundColor: primaryColor }]}
          onPress={handleCtaPress}
        >
          <Text style={[styles.ctaText, { color: colors.surface }]}>
            {FM(ctaTextKey)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeroSection;
