import type { ReactElement } from 'react';

import { Platform, Text } from 'react-native';

import { TestIds } from '../../../shared/testIds';
import {
  MARKETING_PALETTE,
  MARKETING_WORDMARK_FONT_FAMILY,
  MARKETING_WORDMARK_LETTER_SPACING,
  MARKETING_WORDMARK_WEIGHT,
} from '../utils/brand';

interface Props {
  text: string;
  size: number;
  color?: string;
}

const WORDMARK_LINE_HEIGHT_RATIO = 1.2;

/** Per-app marketing wordmark. */
const Wordmark = ({ text, size, color }: Props): ReactElement => {
  const resolvedColor = color ?? MARKETING_PALETTE.gray900;

  const fontFamily = Platform.select({
    web: MARKETING_WORDMARK_FONT_FAMILY,
    default: undefined,
  });

  return (
    <Text
      style={{
          fontSize: size,
          lineHeight: size * WORDMARK_LINE_HEIGHT_RATIO,
          fontWeight: MARKETING_WORDMARK_WEIGHT,
          letterSpacing: MARKETING_WORDMARK_LETTER_SPACING,
          color: resolvedColor,
          fontFamily,
        }}
      testID={TestIds.LANDING_WORDMARK}
    >
      {text}
    </Text>
  );
};

export default Wordmark;
