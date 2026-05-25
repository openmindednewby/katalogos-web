import type { ReactElement } from 'react';

import { Platform, StyleSheet, Text } from 'react-native';

import { TestIds } from '../../../shared/testIds';
import {
  MARKETING_PALETTE,
  MARKETING_WORDMARK_FONT_FAMILY,
  MARKETING_WORDMARK_LETTER_SPACING,
  MARKETING_WORDMARK_WEIGHT,
} from '../utils/brand';

interface Props {
  /** Translation key resolved by FM. Caller passes the resolved string. */
  text: string;
  /** Pixel size for the wordmark glyph. */
  size: number;
  /** Optional override colour — defaults to the locked Katalogos gray-900. */
  color?: string;
}

const styles = StyleSheet.create({
  base: {
    lineHeight: 1,
  },
});

/**
 * Per-app marketing wordmark.
 *
 * Renders the product name (e.g. "Erevna" / "Katalogos") in the locked brand font
 * (Outfit / Manrope respectively) with the locked weight + letter-spacing.
 *
 * On web the font-family is loaded via Google Fonts (see app/+html.tsx).
 * On native the font falls back to the system font — the wordmark is web-first.
 *
 * Default colour for Katalogos is the locked gray-900 (#1c1410), giving the wordmark
 * the warm-dark contrast against the cream landing background.
 */
const Wordmark = ({ text, size, color }: Props): ReactElement => {
  const resolvedColor = color ?? MARKETING_PALETTE.gray900;

  const fontFamily = Platform.select({
    web: MARKETING_WORDMARK_FONT_FAMILY,
    default: undefined,
  });

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: size,
          fontWeight: MARKETING_WORDMARK_WEIGHT,
          letterSpacing: MARKETING_WORDMARK_LETTER_SPACING,
          color: resolvedColor,
          fontFamily,
        },
      ]}
      testID={TestIds.LANDING_WORDMARK}
    >
      {text}
    </Text>
  );
};

export default Wordmark;
