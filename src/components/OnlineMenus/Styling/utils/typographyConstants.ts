/**
 * Constants for the TypographyEditor component.
 */

import { isValueDefined } from '@dloizides/utils';

import NumericFontWeight from '../../../../shared/enums/NumericFontWeight';
import FontWeight from '../../../../types/enums/FontWeight';

/**
 * Maps FontWeight values to numeric font weights.
 */
const FONT_WEIGHT_MAP: Record<FontWeight, NumericFontWeight> = {
  [FontWeight.Normal]: NumericFontWeight.W400,
  [FontWeight.Bold]: NumericFontWeight.W700,
  [FontWeight.W100]: NumericFontWeight.W100,
  [FontWeight.W200]: NumericFontWeight.W200,
  [FontWeight.W300]: NumericFontWeight.W300,
  [FontWeight.W400]: NumericFontWeight.W400,
  [FontWeight.W500]: NumericFontWeight.W500,
  [FontWeight.W600]: NumericFontWeight.W600,
  [FontWeight.W700]: NumericFontWeight.W700,
  [FontWeight.W800]: NumericFontWeight.W800,
  [FontWeight.W900]: NumericFontWeight.W900,
};

export { default as TypographySectionKey } from '../../../../shared/enums/TypographySectionKey';
export { default as NumericFontWeight } from '../../../../shared/enums/NumericFontWeight';

/**
 * Font family options available in the typography editor.
 */
interface FontFamilyOption {
  label: string;
  value: string;
  /** CSS font-family value for preview */
  cssValue: string;
}

/**
 * Font weight options available in the typography editor.
 */
interface FontWeightOption {
  label: string;
  value: FontWeight;
}

/**
 * Number of generic font options at the top of the list.
 */
export const GENERIC_FONT_COUNT = 4;

/**
 * Total number of built-in font family options (generic + Google Fonts).
 */
export const TOTAL_FONT_COUNT = 16;

/**
 * Available font family options.
 * Generic options come first, followed by popular Google Fonts.
 */
export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  // Generic options
  { label: 'System', value: 'System', cssValue: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'Serif', cssValue: 'Georgia, "Times New Roman", serif' },
  { label: 'Sans-serif', value: 'Sans-serif', cssValue: 'Arial, Helvetica, sans-serif' },
  { label: 'Monospace', value: 'Monospace', cssValue: '"Courier New", Courier, monospace' },
  // Google Fonts
  { label: 'Inter', value: 'Inter', cssValue: "'Inter', sans-serif" },
  { label: 'Roboto', value: 'Roboto', cssValue: "'Roboto', sans-serif" },
  { label: 'Open Sans', value: 'Open Sans', cssValue: "'Open Sans', sans-serif" },
  { label: 'Lato', value: 'Lato', cssValue: "'Lato', sans-serif" },
  { label: 'Montserrat', value: 'Montserrat', cssValue: "'Montserrat', sans-serif" },
  { label: 'Poppins', value: 'Poppins', cssValue: "'Poppins', sans-serif" },
  { label: 'Raleway', value: 'Raleway', cssValue: "'Raleway', sans-serif" },
  { label: 'Playfair Display', value: 'Playfair Display', cssValue: "'Playfair Display', serif" },
  { label: 'Oswald', value: 'Oswald', cssValue: "'Oswald', sans-serif" },
  { label: 'Source Sans Pro', value: 'Source Sans Pro', cssValue: "'Source Sans 3', sans-serif" },
  { label: 'Nunito', value: 'Nunito', cssValue: "'Nunito', sans-serif" },
  { label: 'PT Sans', value: 'PT Sans', cssValue: "'PT Sans', sans-serif" },
];

/**
 * Available font weight options.
 */
export const FONT_WEIGHT_OPTIONS: FontWeightOption[] = [
  { label: 'Normal', value: FontWeight.Normal },
  { label: 'Medium', value: FontWeight.W500 },
  { label: 'Semibold', value: FontWeight.W600 },
  { label: 'Bold', value: FontWeight.Bold },
];

/**
 * Font size constraints for different text types.
 */
export const FONT_SIZE_LIMITS = {
  title: { min: 16, max: 48, default: 32 },
  body: { min: 12, max: 24, default: 16 },
  price: { min: 12, max: 32, default: 18 },
} as const;

/**
 * Typography section configuration without type assertions.
 */
interface TypographySectionConfig {
  fontKey: 'titleFont' | 'bodyFont' | 'priceFont';
  sizeKey: 'titleFontSize' | 'bodyFontSize' | 'priceFontSize';
  weightKey: 'titleFontWeight' | 'bodyFontWeight' | 'priceFontWeight';
  label: string;
  translationKey: string;
}

/**
 * Typography property keys grouped by text type.
 */
export const TYPOGRAPHY_SECTIONS: Record<string, TypographySectionConfig> = {
  title: {
    fontKey: 'titleFont',
    sizeKey: 'titleFontSize',
    weightKey: 'titleFontWeight',
    label: 'Title',
    translationKey: 'typography.title',
  },
  body: {
    fontKey: 'bodyFont',
    sizeKey: 'bodyFontSize',
    weightKey: 'bodyFontWeight',
    label: 'Body',
    translationKey: 'typography.body',
  },
  price: {
    fontKey: 'priceFont',
    sizeKey: 'priceFontSize',
    weightKey: 'priceFontWeight',
    label: 'Price',
    translationKey: 'typography.price',
  },
};

/** @see TypographySectionKey enum exported above */

/** Opacity for disabled elements */
export { DISABLED_OPACITY } from '../../../../shared/constants';

/**
 * Gets the CSS font-family value for a font family name.
 * For custom fonts (not in FONT_FAMILY_OPTIONS), returns the raw value.
 */
export function getCssFontFamily(fontFamily: string | undefined): string {
  if (!isValueDefined(fontFamily)) return FONT_FAMILY_OPTIONS[0].cssValue;
  const option = FONT_FAMILY_OPTIONS.find((opt) => opt.value === fontFamily);
  if (isValueDefined(option)) return option.cssValue;
  return fontFamily;
}

/**
 * Gets the display label for a font family value.
 * For built-in fonts, returns the option label. For custom fonts, returns the raw value.
 */
export function getFontFamilyLabel(fontValue: string | undefined): string {
  if (!isValueDefined(fontValue)) return 'System';
  const option = FONT_FAMILY_OPTIONS.find((opt) => opt.value === fontValue);
  return option?.label ?? fontValue;
}

/**
 * Checks whether a font value matches any built-in option label (case-insensitive).
 */
export function hasExactFontMatch(searchText: string): boolean {
  const lowerSearch = searchText.toLowerCase();
  return FONT_FAMILY_OPTIONS.some((opt) => opt.label.toLowerCase() === lowerSearch);
}

/**
 * Gets the numeric font weight for a FontWeight value.
 */
export function getNumericFontWeight(weight: FontWeight | undefined): NumericFontWeight {
  if (!isValueDefined(weight)) return NumericFontWeight.W400;
  return FONT_WEIGHT_MAP[weight];
}
