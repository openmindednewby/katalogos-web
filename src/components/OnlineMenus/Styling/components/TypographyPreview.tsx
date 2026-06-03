


// =============================================================================
// Props Interface
// =============================================================================

import React, { useMemo } from 'react';

import { Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { FONT_SIZE_LIMITS, getCssFontFamily, getNumericFontWeight } from '../utils/typographyConstants';
import { typographyEditorStyles as styles } from '../utils/typographyEditorStyles';

import type { GlobalTypography } from '../../../../types/menuStyleTypes';

interface TypographyPreviewProps {
  value: GlobalTypography;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
}

// =============================================================================
// Constants
// =============================================================================

const PREVIEW_TITLE_TEXT = 'Sample Title';
const PREVIEW_BODY_TEXT = 'This is body text for your menu items.';
const PREVIEW_PRICE_TEXT = '$12.99';

// =============================================================================
// Component
// =============================================================================

export const TypographyPreview = ({
  value,
  textColor,
  textSecondary,
  borderColor,
  bgColor,
}: TypographyPreviewProps): React.JSX.Element => {

  const titlePreviewStyle = useMemo(() => ({
    fontFamily: getCssFontFamily(value.titleFont),
    fontSize: value.titleFontSize ?? FONT_SIZE_LIMITS.title.default,
    fontWeight: getNumericFontWeight(value.titleFontWeight),
    color: textColor,
  }), [value.titleFont, value.titleFontSize, value.titleFontWeight, textColor]);

  const bodyPreviewStyle = useMemo(() => ({
    fontFamily: getCssFontFamily(value.bodyFont),
    fontSize: value.bodyFontSize ?? FONT_SIZE_LIMITS.body.default,
    fontWeight: getNumericFontWeight(value.bodyFontWeight),
    color: textSecondary,
  }), [value.bodyFont, value.bodyFontSize, value.bodyFontWeight, textSecondary]);

  const pricePreviewStyle = useMemo(() => ({
    fontFamily: getCssFontFamily(value.priceFont),
    fontSize: value.priceFontSize ?? FONT_SIZE_LIMITS.price.default,
    fontWeight: getNumericFontWeight(value.priceFontWeight),
    color: textColor,
  }), [value.priceFont, value.priceFontSize, value.priceFontWeight, textColor]);

  return (
    <View
      style={[styles.previewContainer, { borderColor, backgroundColor: bgColor }]}
      testID={TestIds.TYPOGRAPHY_PREVIEW}
    >
      <Text style={[styles.previewLabel, { color: textSecondary }]}>
        {FM('typography.preview')}
      </Text>
      <Text style={[styles.previewTitle, titlePreviewStyle]}>
        {PREVIEW_TITLE_TEXT}
      </Text>
      <Text style={[styles.previewBody, bodyPreviewStyle]}>
        {PREVIEW_BODY_TEXT}
      </Text>
      <Text style={[styles.previewPrice, pricePreviewStyle]}>
        {PREVIEW_PRICE_TEXT}
      </Text>
    </View>
  );
};
