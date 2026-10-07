

import type CategoryItemLayout from './enums/CategoryItemLayout';
import type CategoryLayoutType from './enums/CategoryLayoutType';
import type ContentAlignment from './enums/ContentAlignment';
import type FontWeight from './enums/FontWeight';
import type HorizontalPosition from './enums/HorizontalPosition';
import type ItemLayoutType from './enums/ItemLayoutType';
import type LayoutTemplate from './enums/LayoutTemplate';
import type LogoSize from './enums/LogoSize';
import type MediaFit from './enums/MediaFit';
import type MediaPosition from './enums/MediaPosition';
import type MediaSize from './enums/MediaSize';
import type TitlePosition from './enums/TitlePosition';

export { default as FontWeight } from './enums/FontWeight';
export { default as HorizontalPosition } from './enums/HorizontalPosition';
export { default as LogoSize } from './enums/LogoSize';
export { default as MediaPosition } from './enums/MediaPosition';
export { default as MediaSize } from './enums/MediaSize';
export { default as MediaFit } from './enums/MediaFit';
export { default as ContentAlignment } from './enums/ContentAlignment';


/** Global typography settings applied to the entire menu. */
export interface GlobalTypography {
  titleFont?: string;
  titleFontSize?: number;
  titleFontWeight?: FontWeight;
  bodyFont?: string;
  bodyFontSize?: number;
  bodyFontWeight?: FontWeight;
  priceFont?: string;
  priceFontSize?: number;
  priceFontWeight?: FontWeight;
}


/** Color scheme for the menu. All colors are valid CSS color values. */
export interface ColorScheme {
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  accent?: string;
  price?: string;
  border?: string;
  divider?: string;
  unavailable?: string;
}


/** Menu layout settings controlling overall structure. */
export interface MenuLayoutSettings {
  template?: LayoutTemplate;
  categoryLayout?: CategoryLayoutType;
  itemLayout?: ItemLayoutType;
  itemsPerRow?: number;
  showCategoryDividers?: boolean;
  showItemDividers?: boolean;
}


/** Settings for the menu header section. */
export interface HeaderSettings {
  showLogo?: boolean;
  logoPosition?: HorizontalPosition;
  logoSize?: LogoSize;
  logoContentId?: string | null;
  bannerContentId?: string | null;
  bannerHeight?: number;
  showMenuName?: boolean;
  showMenuDescription?: boolean;
  titlePosition?: HorizontalPosition;
}

/** Spacing configuration (values in pixels). */
export interface SpacingSettings {
  pagePadding?: number;
  categorySpacing?: number;
  itemSpacing?: number;
  contentPadding?: number;
}


/** Overlay settings for media. */
export interface OverlaySettings {
  enabled: boolean;
  color: string;
  opacity: number;
}

/** Settings for media display (images and videos). */
export interface MediaSettings {
  position?: MediaPosition;
  size?: MediaSize;
  customWidth?: number;
  customHeight?: number;
  fit?: MediaFit;
  borderRadius?: number;
  opacity?: number;
  overlay?: OverlaySettings;
}


/** Typography settings specific to categories. */
export interface CategoryTypography {
  titleFontSize?: number;
  titleFontWeight?: FontWeight;
  titleColor?: string;
  descriptionFontSize?: number;
  descriptionFontWeight?: FontWeight;
  descriptionColor?: string;
  descriptionVisible?: boolean;
}

/** Layout settings specific to categories. */
export interface CategoryLayout {
  titlePosition?: TitlePosition;
  contentAlignment?: ContentAlignment;
  itemLayout?: CategoryItemLayout;
  itemsPerRow?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/** Box model styling (padding, margin, borders, shadows). */
export interface BoxStyling {
  padding?: number;
  margin?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
}


export {
  CurrencyPosition,
} from './menuStyleItemTypes';

export type {
  ItemTypography,
  PriceStyle,
  ItemLayout,
  AvailabilityBadgeStyle,
  Badge,
} from './menuStyleItemTypes';

export {
  isValidColorScheme,
  isValidMediaSettings,
  isValidTypography,
  isValidFontWeight,
  isValidOverlaySettings,
  isValidBadge,
} from './menuStyleTypeGuards';
