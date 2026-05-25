/**
 * Entity-Level Menu Default Constants
 *
 * Default values for category-level and item-level styling properties.
 * Split from menuDefaults.ts to keep file sizes under 200 lines.
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */

import BadgePosition from '../types/enums/BadgePosition';
import CategoryItemLayout from '../types/enums/CategoryItemLayout';
import ContentAlignment from '../types/enums/ContentAlignment';
import CurrencyPosition from '../types/enums/CurrencyPosition';
import FontWeight from '../types/enums/FontWeight';
import ItemImagePosition from '../types/enums/ItemImagePosition';
import ItemLayoutVariant from '../types/enums/ItemLayoutVariant';
import MediaFit from '../types/enums/MediaFit';
import MediaPosition from '../types/enums/MediaPosition';
import MediaSize from '../types/enums/MediaSize';
import PricePosition from '../types/enums/PricePosition';
import TitlePosition from '../types/enums/TitlePosition';

import type {
  MediaSettings,
  CategoryTypography,
  CategoryLayout,
  BoxStyling,
  ItemTypography,
  PriceStyle,
  ItemLayout,
  AvailabilityBadgeStyle,
} from '../types/menuStyleTypes';

// =============================================================================
// Category-Level Default Constants
// =============================================================================

/**
 * Default media settings for category images.
 * Note: overlay is undefined by default (not enabled).
 */
export const DEFAULT_CATEGORY_IMAGE_SETTINGS: MediaSettings = {
  position: MediaPosition.Top,
  size: MediaSize.Large,
  customWidth: undefined,
  customHeight: undefined,
  fit: MediaFit.Cover,
  borderRadius: 8,
  opacity: 1,
  overlay: undefined,
};

/**
 * Default typography settings for categories.
 */
export const DEFAULT_CATEGORY_TYPOGRAPHY: CategoryTypography = {
  titleFontSize: 24,
  titleFontWeight: FontWeight.Bold,
  titleColor: undefined,
  descriptionFontSize: 14,
  descriptionFontWeight: FontWeight.Normal,
  descriptionColor: undefined,
  descriptionVisible: true,
};

/**
 * Default layout settings for categories.
 */
export const DEFAULT_CATEGORY_LAYOUT: Required<CategoryLayout> = {
  titlePosition: TitlePosition.BelowMedia,
  contentAlignment: ContentAlignment.Left,
  itemLayout: CategoryItemLayout.Inherit,
  itemsPerRow: 2,
  collapsible: false,
  defaultCollapsed: false,
};

/**
 * Default box styling for categories and items.
 */
export const DEFAULT_BOX_STYLING: BoxStyling = {
  padding: 16,
  margin: 0,
  borderWidth: 0,
  borderColor: undefined,
  borderRadius: 8,
  shadowEnabled: false,
  shadowColor: undefined,
  shadowBlur: 4,
};

// =============================================================================
// Item-Level Default Constants
// =============================================================================

/**
 * Default media settings for item images.
 * Note: overlay is undefined by default (not enabled).
 */
export const DEFAULT_ITEM_IMAGE_SETTINGS: MediaSettings = {
  position: MediaPosition.Left,
  size: MediaSize.Medium,
  customWidth: undefined,
  customHeight: undefined,
  fit: MediaFit.Cover,
  borderRadius: 4,
  opacity: 1,
  overlay: undefined,
};

/**
 * Default typography settings for menu items.
 */
export const DEFAULT_ITEM_TYPOGRAPHY: ItemTypography = {
  nameFontSize: 18,
  nameFontWeight: FontWeight.W600,
  nameColor: undefined,
  descriptionFontSize: 14,
  descriptionFontWeight: FontWeight.Normal,
  descriptionColor: undefined,
  descriptionVisible: true,
  descriptionMaxLines: 2,
};

/**
 * Default price styling for menu items.
 */
export const DEFAULT_PRICE_STYLE: PriceStyle = {
  fontSize: 18,
  fontWeight: FontWeight.Bold,
  color: undefined,
  position: PricePosition.Right,
  prefix: '',
  suffix: '',
  showCurrency: true,
  currencyPosition: CurrencyPosition.Before,
  strikethroughWhenUnavailable: true,
};

/**
 * Default layout settings for menu items.
 */
export const DEFAULT_ITEM_LAYOUT: ItemLayout = {
  variant: ItemLayoutVariant.Horizontal,
  imagePosition: ItemImagePosition.Left,
  contentAlignment: ContentAlignment.Left,
  minHeight: undefined,
  maxWidth: undefined,
};

/**
 * Default availability badge styling.
 */
export const DEFAULT_AVAILABILITY_BADGE: Required<AvailabilityBadgeStyle> = {
  show: true,
  position: BadgePosition.TopRight,
  unavailableText: 'Unavailable',
  unavailableColor: '#FFFFFF',
  unavailableBackgroundColor: '#FF3B30',
};
