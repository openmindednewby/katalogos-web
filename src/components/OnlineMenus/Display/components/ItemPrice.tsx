

/**
 * ItemPrice - Renders the price display with formatting options.
 *
 * Supports "from $X" display when variants exist (showFromPrefix=true).
 */
import React from 'react';

import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import CurrencyPosition from '../../../../types/enums/CurrencyPosition';
import FontWeight from '../../../../types/enums/FontWeight';
import PricePosition from '../../../../types/enums/PricePosition';
import { formatPrice, styles, DEFAULT_PRICE_FONT_SIZE } from '../utils/menuItemDisplayStyles';

import type { PriceStyle } from '../../../../types/menuStyleTypes';

interface Props {
  price: number;
  priceStyle?: PriceStyle;
  isAvailable: boolean;
  textColor: string;
  testID: string;
  /** When true, displays "from $X" prefix (used when variants exist). */
  showFromPrefix?: boolean;
}

/**
 * Resolves price display settings from optional style overrides.
 */
function resolvePriceSettings(priceStyle: PriceStyle | undefined, textColor: string): {
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  showCurrency: boolean;
  currencyPosition: CurrencyPosition;
  showStrikethrough: boolean;
  position: PricePosition | undefined;
} {
  return {
    fontSize: priceStyle?.fontSize ?? DEFAULT_PRICE_FONT_SIZE,
    fontWeight: priceStyle?.fontWeight ?? FontWeight.Bold,
    color: priceStyle?.color ?? textColor,
    showCurrency: priceStyle?.showCurrency ?? true,
    currencyPosition: priceStyle?.currencyPosition ?? CurrencyPosition.Before,
    showStrikethrough: priceStyle?.strikethroughWhenUnavailable ?? true,
    position: priceStyle?.position,
  };
}

/**
 * Gets the additional style for price positioning.
 */
function getPricePositionStyle(position?: PricePosition): StyleProp<TextStyle> {
  if (position === PricePosition.BelowName) return styles.priceBelowName;
  if (position === PricePosition.BelowDescription) return styles.priceBelowDescription;
  return null;
}

/**
 * Renders a formatted price with optional strikethrough for unavailable items.
 */
const ItemPrice: React.FC<Props> = ({
  price,
  priceStyle,
  isAvailable,
  textColor,
  testID,
  showFromPrefix = false,
}) => {
  const { fontSize, fontWeight, color, showCurrency, currencyPosition, showStrikethrough, position } =
    resolvePriceSettings(priceStyle, textColor);

  const formattedPrice = formatPrice({
    price,
    showCurrency,
    currencyPosition,
    prefix: priceStyle?.prefix,
    suffix: priceStyle?.suffix,
  });

  const displayText = showFromPrefix
    ? FM('onlineMenus.variants.fromPrice', formattedPrice)
    : formattedPrice;

  const shouldStrike = !isAvailable && showStrikethrough;
  const positionStyle = getPricePositionStyle(position);

  const priceTextStyle: StyleProp<TextStyle> = [
    styles.priceText,
    { fontSize, fontWeight, color },
    shouldStrike && styles.priceStrikethrough,
    positionStyle,
  ];

  return (
    <Text
      accessibilityHint={FM('onlineMenus.priceHint', displayText)}
      accessibilityLabel={displayText}
      style={priceTextStyle}
      testID={testID}
    >
      {displayText}
    </Text>
  );
};

export default ItemPrice;
