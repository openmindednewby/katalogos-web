

import React from 'react';

import { Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { isValidHexColor } from '../utils/colorSchemeConstants';
import { formatPricePreview } from '../utils/priceStyleConstants';
import { priceStyleEditorStyles as styles } from '../utils/priceStyleEditorStyles';

import type { CurrencyPosition, FontWeight } from '../../../../types/menuStyleTypes';

interface Props {
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  showCurrency: boolean;
  currencyPosition: CurrencyPosition;
  showStrikethrough: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
}

const PriceStylePreview: React.FC<Props> = ({
  fontSize,
  fontWeight,
  color,
  showCurrency,
  currencyPosition,
  showStrikethrough,
  textColor,
  textSecondary,
  borderColor,
  bgColor,
}) => {

  const previewText = formatPricePreview(showCurrency, currencyPosition);
  const displayColor = isValidHexColor(color) ? color : textColor;

  return (
    <View style={[styles.previewContainer, { borderColor, backgroundColor: bgColor }]}>
      <Text style={[styles.previewLabel, { color: textSecondary }]}>
        {FM('priceStyle.preview')}
      </Text>
      <Text
        style={[
          styles.previewPrice,
          { fontSize, fontWeight, color: displayColor },
          showStrikethrough && styles.previewStrikethrough,
        ]}
        testID={TestIds.PRICE_STYLE_PREVIEW}
      >
        {previewText}
      </Text>
    </View>
  );
};

export default PriceStylePreview;
