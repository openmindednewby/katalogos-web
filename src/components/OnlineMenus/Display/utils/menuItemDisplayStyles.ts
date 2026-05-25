import { StyleSheet } from 'react-native';
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

import CurrencyPosition from '../../../../types/enums/CurrencyPosition';
import MediaPosition from '../../../../types/enums/MediaPosition';


// =============================================================================
// Style Constants
// =============================================================================

export const ITEM_MIN_HEIGHT = 80;
export const ITEM_IMAGE_SIZE_SMALL = 60;
export const ITEM_IMAGE_SIZE_MEDIUM = 100;
export const ITEM_IMAGE_SIZE_LARGE = 150;
export const DEFAULT_BORDER_RADIUS = 8;
export const DEFAULT_PADDING = 12;
export const DEFAULT_PRICE_FONT_SIZE = 16;
export const BADGE_PADDING_HORIZONTAL = 8;
export const BADGE_PADDING_VERTICAL = 4;
export const BADGE_BORDER_RADIUS = 4;
export const BADGE_FONT_SIZE = 12;
export const UNAVAILABLE_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.4)';
export const CURRENCY_SYMBOL = '$';
export const DEFAULT_NAME_FONT_SIZE = 16;
export const DEFAULT_DESCRIPTION_FONT_SIZE = 14;
export const DEFAULT_IMAGE_BORDER_RADIUS = 8;

// =============================================================================
// Style Helpers
// =============================================================================

/**
 * Gets the flex direction for a media position.
 */
export function getFlexDirection(position: MediaPosition): ViewStyle['flexDirection'] {
  if (position === MediaPosition.Left) return 'row';
  if (position === MediaPosition.Right) return 'row-reverse';
  if (position === MediaPosition.Bottom) return 'column-reverse';
  return 'column';
}

/**
 * Options for formatting a price.
 */
export interface FormatPriceOptions {
  price: number;
  showCurrency: boolean;
  currencyPosition: CurrencyPosition;
  prefix?: string;
  suffix?: string;
}

/**
 * Formats a price with currency symbol based on settings.
 */
export function formatPrice(options: FormatPriceOptions): string {
  const { price, showCurrency, currencyPosition, prefix, suffix } = options;
  const priceText = price.toFixed(2);
  const prefixStr = prefix ?? '';
  const suffixStr = suffix ?? '';

  if (!showCurrency) return `${prefixStr}${priceText}${suffixStr}`;

  const currencyIsAfter = currencyPosition === CurrencyPosition.After;
  if (currencyIsAfter) return `${prefixStr}${priceText}${CURRENCY_SYMBOL}${suffixStr}`;
  return `${prefixStr}${CURRENCY_SYMBOL}${priceText}${suffixStr}`;
}

/**
 * Gets the image size based on media settings.
 */
export function getImageSize(size?: string): number {
  if (size === 'small' || size === 'thumbnail') return ITEM_IMAGE_SIZE_SMALL;
  if (size === 'large' || size === 'full') return ITEM_IMAGE_SIZE_LARGE;
  return ITEM_IMAGE_SIZE_MEDIUM;
}

// =============================================================================
// Base Styles
// =============================================================================

export const styles = StyleSheet.create({
  container: {
    borderRadius: DEFAULT_BORDER_RADIUS,
    padding: DEFAULT_PADDING,
    minHeight: ITEM_MIN_HEIGHT,
    overflow: 'hidden',
  },
  containerBackground: {
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verticalLayout: {
    flexDirection: 'column',
  },
  imageContainer: {
    overflow: 'hidden',
  },
  imageHorizontal: {
    marginRight: 12,
  },
  imageVertical: {
    marginBottom: 8,
    width: '100%',
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    fontSize: 14,
  },
  priceText: {
    fontSize: DEFAULT_PRICE_FONT_SIZE,
    fontWeight: 'bold',
  },
  priceStrikethrough: {
    textDecorationLine: 'line-through',
  },
  priceBelowName: {
    marginTop: 4,
  },
  priceBelowDescription: {
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
    position: 'absolute',
  },
  badgeTopLeft: {
    top: 8,
    left: 8,
  },
  badgeTopRight: {
    top: 8,
    right: 8,
  },
  badgeBottomLeft: {
    bottom: 8,
    left: 8,
  },
  badgeBottomRight: {
    bottom: 8,
    right: 8,
  },
  badgeText: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '600',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: UNAVAILABLE_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DEFAULT_BORDER_RADIUS,
  },
});

// =============================================================================
// Style Type Exports
// =============================================================================

export type ContainerStyle = ViewStyle;
export type TextStyleType = TextStyle;
export type ImageStyleType = ImageStyle;
