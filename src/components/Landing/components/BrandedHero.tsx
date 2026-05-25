import type { ReactElement } from 'react';

import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { useRouter } from 'expo-router';

import Wordmark from './Wordmark';
import { FM } from '../../../localization/helpers';
import { TABLET_BREAKPOINT_PX } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import {
  BUTTON_BORDER_RADIUS,
  LANDING_MAX_WIDTH,
  LANDING_SECTION_PADDING_HORIZONTAL,
} from '../constants';
import { MARKETING_PALETTE } from '../utils/brand';

interface Props {
  wordmarkKey: string;
  taglineKey: string;
  subheadKey: string;
  primaryCtaKey: string;
  primaryCtaHintKey: string;
  primaryCtaRoute: string;
  secondaryCtaKey: string;
  secondaryCtaHintKey: string;
  secondaryCtaRoute: string;
}

const HERO_VERTICAL_PADDING_DESKTOP = 96;
const HERO_VERTICAL_PADDING_MOBILE = 56;
const WORDMARK_SIZE_DESKTOP = 96;
const WORDMARK_SIZE_MOBILE = 60;
const TAGLINE_SIZE_DESKTOP = 24;
const TAGLINE_SIZE_MOBILE = 18;
const SUBHEAD_SIZE_DESKTOP = 18;
const SUBHEAD_SIZE_MOBILE = 16;
const SUBHEAD_LINE_HEIGHT = 28;
const SUBHEAD_MAX_WIDTH = 640;
const TAGLINE_MARGIN_TOP = 28;
const SUBHEAD_MARGIN_TOP = 16;
const CTA_ROW_MARGIN_TOP = 36;
const CTA_GAP = 12;
const CTA_FONT_SIZE = 15;
const CTA_PADDING_HORIZONTAL = 22;
const CTA_PADDING_VERTICAL = 14;
const DEFAULT_BORDER_WIDTH = 1;
const TAGLINE_LETTER_SPACING = -0.24;
const HERO_BACKGROUND = MARKETING_PALETTE.gray100;
const HERO_PRIMARY_TEXT_ON_BG = '#ffffff';

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center', backgroundColor: HERO_BACKGROUND },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: TAGLINE_LETTER_SPACING,
    marginTop: TAGLINE_MARGIN_TOP,
    maxWidth: SUBHEAD_MAX_WIDTH,
  },
  subhead: {
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: SUBHEAD_LINE_HEIGHT,
    marginTop: SUBHEAD_MARGIN_TOP,
    maxWidth: SUBHEAD_MAX_WIDTH,
  },
  ctaRow: { flexDirection: 'row', gap: CTA_GAP, marginTop: CTA_ROW_MARGIN_TOP, flexWrap: 'wrap', justifyContent: 'center' },
  ctaPrimary: {
    paddingHorizontal: CTA_PADDING_HORIZONTAL,
    paddingVertical: CTA_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  ctaSecondary: {
    paddingHorizontal: CTA_PADDING_HORIZONTAL,
    paddingVertical: CTA_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: DEFAULT_BORDER_WIDTH,
  },
  ctaText: { fontSize: CTA_FONT_SIZE, fontWeight: '600' },
});

/**
 * Branded marketing hero for the Katalogos landing.
 * Uses the locked P-01 Terracotta Warm palette tokens directly (cream background,
 * clay-primary CTA button) to give the marketing landing its distinct identity.
 */
const BrandedHero = (props: Props): ReactElement => {
  const {
    wordmarkKey,
    taglineKey,
    subheadKey,
    primaryCtaKey,
    primaryCtaHintKey,
    primaryCtaRoute,
    secondaryCtaKey,
    secondaryCtaHintKey,
    secondaryCtaRoute,
  } = props;
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width <= TABLET_BREAKPOINT_PX;
  const wordmarkSize = isMobile ? WORDMARK_SIZE_MOBILE : WORDMARK_SIZE_DESKTOP;
  const taglineSize = isMobile ? TAGLINE_SIZE_MOBILE : TAGLINE_SIZE_DESKTOP;
  const subheadSize = isMobile ? SUBHEAD_SIZE_MOBILE : SUBHEAD_SIZE_DESKTOP;
  const verticalPadding = isMobile ? HERO_VERTICAL_PADDING_MOBILE : HERO_VERTICAL_PADDING_DESKTOP;

  function goToPrimary(): void {
    router.push(primaryCtaRoute);
  }

  function goToSecondary(): void {
    router.push(secondaryCtaRoute);
  }

  return (
    <View style={[styles.outer, { paddingVertical: verticalPadding }]} testID={TestIds.LANDING_HERO}>
      <View style={styles.inner}>
        <Wordmark size={wordmarkSize} text={FM(wordmarkKey)} />
        <Text style={[styles.tagline, { fontSize: taglineSize, color: MARKETING_PALETTE.gray700 }]}>
          {FM(taglineKey)}
        </Text>
        <Text style={[styles.subhead, { fontSize: subheadSize, color: MARKETING_PALETTE.gray700 }]}>
          {FM(subheadKey)}
        </Text>
        <View style={styles.ctaRow}>
          <TouchableOpacity
            accessibilityHint={FM(primaryCtaHintKey)}
            accessibilityLabel={FM(primaryCtaKey)}
            accessibilityRole="button"
            style={[styles.ctaPrimary, { backgroundColor: MARKETING_PALETTE.primary }]}
            testID={TestIds.LANDING_NAV_REGISTER_BUTTON}
            onPress={goToPrimary}
          >
            <Text style={[styles.ctaText, { color: HERO_PRIMARY_TEXT_ON_BG }]}>{FM(primaryCtaKey)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityHint={FM(secondaryCtaHintKey)}
            accessibilityLabel={FM(secondaryCtaKey)}
            accessibilityRole="button"
            style={[styles.ctaSecondary, { borderColor: MARKETING_PALETTE.gray300 }]}
            onPress={goToSecondary}
          >
            <Text style={[styles.ctaText, { color: MARKETING_PALETTE.gray900 }]}>{FM(secondaryCtaKey)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default BrandedHero;
