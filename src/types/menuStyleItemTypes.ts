/**
 * Menu Style Types for Item-Level Styling
 *
 * Types for menu item typography, price display, layout, and badges.
 * Split from menuStyleTypes.ts to keep file sizes under 200 lines.
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */

import BadgePosition from './enums/BadgePosition';
import CurrencyPosition from './enums/CurrencyPosition';
import ItemImagePosition from './enums/ItemImagePosition';
import ItemLayoutVariant from './enums/ItemLayoutVariant';
import PricePosition from './enums/PricePosition';

import type { FontWeight, ContentAlignment } from './menuStyleTypes';

export { BadgePosition, CurrencyPosition, ItemImagePosition, ItemLayoutVariant, PricePosition };

// =============================================================================
// Item Styling
// =============================================================================

/** Typography settings specific to menu items. */
export interface ItemTypography {
  nameFontSize?: number;
  nameFontWeight?: FontWeight;
  nameColor?: string;
  descriptionFontSize?: number;
  descriptionFontWeight?: FontWeight;
  descriptionColor?: string;
  descriptionVisible?: boolean;
  descriptionMaxLines?: number;
}

/** Styling for price display. */
export interface PriceStyle {
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  position?: PricePosition;
  prefix?: string;
  suffix?: string;
  showCurrency?: boolean;
  currencyPosition?: CurrencyPosition;
  strikethroughWhenUnavailable?: boolean;
}

/** Layout settings specific to items. */
export interface ItemLayout {
  variant?: ItemLayoutVariant;
  imagePosition?: ItemImagePosition;
  contentAlignment?: ContentAlignment;
  minHeight?: number;
  maxWidth?: number;
}

// =============================================================================
// Badge Styling
// =============================================================================

/** Styling for availability badges. */
export interface AvailabilityBadgeStyle {
  show?: boolean;
  position?: BadgePosition;
  unavailableText?: string;
  unavailableColor?: string;
  unavailableBackgroundColor?: string;
}

/** Custom badge definition. */
export interface Badge {
  text: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
}
