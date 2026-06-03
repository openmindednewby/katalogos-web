/**
 * Menu Style Generator Utility
 *
 * Converts menu styling settings to React Native StyleSheet objects.
 * Used by the Menu Customization Feature to dynamically apply tenant styling.
 *
 * Helpers and constants are in menuStyleGeneratorHelpers.ts.
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */

import type { TextStyle, ViewStyle } from 'react-native';

import {
  DEFAULT_TYPOGRAPHY,
  DEFAULT_COLOR_SCHEME,
} from './menuDefaults';
import {
  DEFAULT_BOX_STYLING,
  DEFAULT_CATEGORY_TYPOGRAPHY,
  DEFAULT_CATEGORY_LAYOUT,
  DEFAULT_CATEGORY_IMAGE_SETTINGS,
  DEFAULT_ITEM_TYPOGRAPHY,
  DEFAULT_ITEM_IMAGE_SETTINGS,
  DEFAULT_PRICE_STYLE,
  DEFAULT_ITEM_LAYOUT,
} from './menuDefaultsEntityLevel';
import {
  getColorWithFallback,
  getAlignmentFromLayout,
  buildContainerStyle,
  buildItemContainerStyle,
  buildTextStyle,
  buildGlobalTextStyle,
  generateMediaStyles,
} from './menuStyleGeneratorHelpers';
import ContentAlignment from '../types/enums/ContentAlignment';

import type {
  CategoryStyles,
  ItemStyles,
  TypographyStyles,
} from './menuStyleGeneratorHelpers';
import type {
  GlobalTypography,
  BoxStyling,
  CategoryTypography,
  CategoryLayout,
  ItemTypography,
  PriceStyle,
  ItemLayout,
  ColorScheme,
} from '../types/menuStyleTypes';
import type { Category, MenuItem } from '../types/menuTypes';

// Re-export types and generateMediaStyles for backward compatibility
export { generateMediaStyles } from './menuStyleGeneratorHelpers';

// =============================================================================
// Main Generator Functions
// =============================================================================

/** Generates styles for a category based on its styling settings. */
export function generateCategoryStyles(
  category: Category | undefined,
  colorScheme?: ColorScheme
): CategoryStyles {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const typography = { ...DEFAULT_CATEGORY_TYPOGRAPHY, ...category?.typography };
  const layout = { ...DEFAULT_CATEGORY_LAYOUT, ...category?.layout };
  const styling = { ...DEFAULT_BOX_STYLING, ...category?.styling };
  const imageSettings = category?.imageSettings
    ? { ...DEFAULT_CATEGORY_IMAGE_SETTINGS, ...category.imageSettings }
    : DEFAULT_CATEGORY_IMAGE_SETTINGS;

  const textAlign = getAlignmentFromLayout(layout, ContentAlignment.Left);
  const titleColor = getColorWithFallback(typography.titleColor, colors.text);
  const descColor = getColorWithFallback(typography.descriptionColor, colors.textSecondary);

  return {
    container: buildContainerStyle(styling, colors),
    title: buildTextStyle(typography.titleFontSize, typography.titleFontWeight, titleColor, textAlign),
    description: buildTextStyle(typography.descriptionFontSize, typography.descriptionFontWeight, descColor, textAlign),
    image: generateMediaStyles(imageSettings),
  };
}

/** Generates styles for a menu item based on its styling settings. */
export function generateItemStyles(
  item: MenuItem | undefined,
  colorScheme?: ColorScheme
): ItemStyles {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const typography = { ...DEFAULT_ITEM_TYPOGRAPHY, ...item?.typography };
  const priceStyle = { ...DEFAULT_PRICE_STYLE, ...item?.priceStyle };
  const layout = { ...DEFAULT_ITEM_LAYOUT, ...item?.layout };
  const styling = { ...DEFAULT_BOX_STYLING, ...item?.styling };
  const imageSettings = item?.imageSettings
    ? { ...DEFAULT_ITEM_IMAGE_SETTINGS, ...item.imageSettings }
    : DEFAULT_ITEM_IMAGE_SETTINGS;

  const textAlign = getAlignmentFromLayout(layout, ContentAlignment.Left);
  const nameColor = getColorWithFallback(typography.nameColor, colors.text);
  const descColor = getColorWithFallback(typography.descriptionColor, colors.textSecondary);
  const prColor = getColorWithFallback(priceStyle.color, colors.price);
  const container = buildItemContainerStyle(styling, layout, colors);

  return {
    container,
    name: buildTextStyle(typography.nameFontSize, typography.nameFontWeight, nameColor, textAlign),
    description: buildTextStyle(typography.descriptionFontSize, typography.descriptionFontWeight, descColor, textAlign),
    price: buildTextStyle(priceStyle.fontSize, priceStyle.fontWeight, prColor, undefined),
    image: generateMediaStyles(imageSettings),
  };
}

/** Generates text styles from global typography settings. */
export function generateTypographyStyles(
  typography: GlobalTypography | undefined,
  colorScheme?: ColorScheme
): TypographyStyles {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const typo = { ...DEFAULT_TYPOGRAPHY, ...typography };

  return {
    title: buildGlobalTextStyle(typo.titleFont, typo.titleFontSize, typo.titleFontWeight, colors.text),
    body: buildGlobalTextStyle(typo.bodyFont, typo.bodyFontSize, typo.bodyFontWeight, colors.text),
    price: buildGlobalTextStyle(typo.priceFont, typo.priceFontSize, typo.priceFontWeight, colors.price),
  };
}

/** Generates container styles from box styling settings. */
export function generateBoxStyles(box: BoxStyling | undefined, colorScheme?: ColorScheme): ViewStyle {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const styling = { ...DEFAULT_BOX_STYLING, ...box };
  return buildContainerStyle(styling, colors);
}

// =============================================================================
// Category-Specific Style Generators
// =============================================================================

/** Generates category typography styles only. */
export function generateCategoryTypographyStyles(
  typography: CategoryTypography | undefined,
  layout: CategoryLayout | undefined,
  colorScheme?: ColorScheme
): { title: TextStyle; description: TextStyle } {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const typo = { ...DEFAULT_CATEGORY_TYPOGRAPHY, ...typography };
  const textAlign = getAlignmentFromLayout(layout, ContentAlignment.Left);
  const titleColor = getColorWithFallback(typo.titleColor, colors.text);
  const descColor = getColorWithFallback(typo.descriptionColor, colors.textSecondary);

  return {
    title: buildTextStyle(typo.titleFontSize, typo.titleFontWeight, titleColor, textAlign),
    description: buildTextStyle(typo.descriptionFontSize, typo.descriptionFontWeight, descColor, textAlign),
  };
}

// =============================================================================
// Item-Specific Style Generators
// =============================================================================

/** Generates item typography styles only. */
export function generateItemTypographyStyles(
  typography: ItemTypography | undefined,
  layout: ItemLayout | undefined,
  colorScheme?: ColorScheme
): { name: TextStyle; description: TextStyle } {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const typo = { ...DEFAULT_ITEM_TYPOGRAPHY, ...typography };
  const textAlign = getAlignmentFromLayout(layout, ContentAlignment.Left);
  const nameColor = getColorWithFallback(typo.nameColor, colors.text);
  const descColor = getColorWithFallback(typo.descriptionColor, colors.textSecondary);

  return {
    name: buildTextStyle(typo.nameFontSize, typo.nameFontWeight, nameColor, textAlign),
    description: buildTextStyle(typo.descriptionFontSize, typo.descriptionFontWeight, descColor, textAlign),
  };
}

/** Generates price styles only. */
export function generatePriceStyles(priceStyle: PriceStyle | undefined, colorScheme?: ColorScheme): TextStyle {
  const colors = { ...DEFAULT_COLOR_SCHEME, ...colorScheme };
  const style = { ...DEFAULT_PRICE_STYLE, ...priceStyle };
  const prColor = getColorWithFallback(style.color, colors.price);

  return { fontSize: style.fontSize, fontWeight: style.fontWeight, color: prColor };
}
