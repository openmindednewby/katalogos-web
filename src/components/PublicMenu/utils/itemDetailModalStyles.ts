/**
 * Style builders for the ItemDetailModal component.
 * Group/option/tag styles are in itemDetailGroupStyles.ts.
 */
import type { TextStyle, ViewStyle } from 'react-native';

import { MODAL_OVERLAY_COLOR as BACKDROP_COLOR } from '../../../shared/constants';

import type { PublicMenuTheme } from './publicMenuThemeTypes';
import type { ResponsiveLayout } from './responsiveStyles';

const MODAL_MAX_WIDTH = 520;
const MODAL_MAX_HEIGHT_PERCENT = 0.9;
const MODAL_BORDER_RADIUS = 16;
const MODAL_PADDING = 24;
const MODAL_MARGIN_MOBILE = 0;
const MODAL_MARGIN_DESKTOP = 24;
const CLOSE_BUTTON_SIZE = 36;
const CLOSE_BUTTON_TOP_DESKTOP = 12;
const CLOSE_BUTTON_TOP_PHONE = 48;
const SAFE_AREA_TOP_PHONE = 44;
const CLOSE_BUTTON_RIGHT = 12;
const CLOSE_BUTTON_RADIUS = 18;
const CLOSE_BUTTON_FONT_SIZE = 20;
const CLOSE_ICON_OPACITY = 0.7;
const NAME_MARGIN_BOTTOM = 4;
const PRICE_MARGIN_BOTTOM = 12;
const DESCRIPTION_MARGIN_BOTTOM = 16;
const SECTION_MARGIN_TOP = 16;
const SECTION_TITLE_MARGIN_BOTTOM = 8;
const BADGE_PADDING_H = 10;
const BADGE_PADDING_V = 4;
const BADGE_RADIUS = 12;
const BADGE_FONT_SIZE = 11;
const BADGE_TEXT_COLOR = '#ffffff';
const NOTE_MARGIN_TOP = 8;
const NOTE_PADDING = 12;
const NOTE_BORDER_RADIUS = 8;
const NOTE_BG_OPACITY = 0.08;
const HEX_BASE = 16;
const MAX_ALPHA = 255;
const PAD_LENGTH = 2;
const BACKDROP_Z_INDEX = 1000;
const CLOSE_Z_INDEX = 1;
const PERCENT_MULTIPLIER = 100;

export const IMAGE_HEIGHT = 240;
export const IMAGE_BORDER_RADIUS = 12;
export const IMAGE_MARGIN_BOTTOM = 16;
export const PRICE_DECIMALS = 2;

export {
  buildGroupContainerStyle, buildGroupHeaderStyle, buildGroupSubtitleStyle,
  buildOptionNameStyle, buildOptionPriceStyle, buildOptionRowStyle, buildTagContainerStyle,
} from './itemDetailGroupStyles';

export function buildBackdropStyle(): ViewStyle {
  return {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: BACKDROP_COLOR, justifyContent: 'center',
    alignItems: 'center', zIndex: BACKDROP_Z_INDEX,
  };
}

export function buildModalContainerStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): ViewStyle {
  if (responsive.isPhone)
    return { flex: 1, width: '100%', backgroundColor: theme.colors.surface, margin: MODAL_MARGIN_MOBILE, paddingTop: SAFE_AREA_TOP_PHONE };
  return {
    width: '100%', maxWidth: MODAL_MAX_WIDTH,
    maxHeight: `${MODAL_MAX_HEIGHT_PERCENT * PERCENT_MULTIPLIER}%`,
    backgroundColor: theme.colors.surface, borderRadius: MODAL_BORDER_RADIUS, margin: MODAL_MARGIN_DESKTOP,
  };
}

export function buildScrollContentStyle(_responsive: ResponsiveLayout): ViewStyle {
  return { padding: MODAL_PADDING };
}

export function buildCloseButtonStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): ViewStyle {
  const topOffset = responsive.isPhone ? CLOSE_BUTTON_TOP_PHONE : CLOSE_BUTTON_TOP_DESKTOP;
  return {
    position: 'absolute', top: topOffset, right: CLOSE_BUTTON_RIGHT,
    width: CLOSE_BUTTON_SIZE, height: CLOSE_BUTTON_SIZE, borderRadius: CLOSE_BUTTON_RADIUS,
    backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', zIndex: CLOSE_Z_INDEX,
  };
}

export function buildCloseButtonTextStyle(theme: PublicMenuTheme): TextStyle {
  return { fontSize: CLOSE_BUTTON_FONT_SIZE, color: theme.colors.text, opacity: CLOSE_ICON_OPACITY };
}

export function buildNameStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): TextStyle {
  return {
    fontFamily: theme.typography.headingFont, fontSize: responsive.fontSizes.category,
    fontWeight: theme.typography.categoryWeight, color: theme.colors.text, marginBottom: NAME_MARGIN_BOTTOM,
  };
}

export function buildPriceStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont, fontSize: responsive.fontSizes.itemPrice,
    fontWeight: theme.typography.priceWeight, color: theme.colors.accent, marginBottom: PRICE_MARGIN_BOTTOM,
  };
}

export function buildDescriptionStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont, fontSize: responsive.fontSizes.body,
    lineHeight: responsive.fontSizes.body * theme.typography.bodyLineHeight,
    letterSpacing: theme.typography.bodyLetterSpacing, color: theme.colors.textSecondary,
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
  };
}

export function buildSectionTitleStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): TextStyle {
  return {
    fontFamily: theme.typography.headingFont, fontSize: responsive.fontSizes.itemName,
    fontWeight: theme.typography.itemNameWeight, color: theme.colors.text,
    marginTop: SECTION_MARGIN_TOP, marginBottom: SECTION_TITLE_MARGIN_BOTTOM,
  };
}

export function buildStaffBadgeStyle(theme: PublicMenuTheme): ViewStyle {
  return {
    backgroundColor: theme.colors.accent, paddingHorizontal: BADGE_PADDING_H,
    paddingVertical: BADGE_PADDING_V, borderRadius: BADGE_RADIUS,
    alignSelf: 'flex-start', marginBottom: NAME_MARGIN_BOTTOM,
  };
}

export function buildStaffBadgeTextStyle(theme: PublicMenuTheme): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont, fontSize: BADGE_FONT_SIZE,
    fontWeight: '700', color: BADGE_TEXT_COLOR, textTransform: 'uppercase',
  };
}

export function buildStaffNoteStyle(theme: PublicMenuTheme): ViewStyle {
  const alphaHex = Math.round(NOTE_BG_OPACITY * MAX_ALPHA).toString(HEX_BASE).padStart(PAD_LENGTH, '0');
  return {
    marginTop: NOTE_MARGIN_TOP, padding: NOTE_PADDING,
    borderRadius: NOTE_BORDER_RADIUS, backgroundColor: `${theme.colors.accent}${alphaHex}`,
  };
}

export function buildStaffNoteTextStyle(theme: PublicMenuTheme, responsive: ResponsiveLayout): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont, fontSize: responsive.fontSizes.description,
    fontStyle: 'italic', color: theme.colors.textSecondary,
  };
}
