/**
 * Style builders and constants for MenuContentView.
 *
 * Extracted to keep the component file under 200 lines.
 */
import type { TextStyle, ViewStyle } from 'react-native';

import type { PublicMenuTheme } from './publicMenuThemeTypes';
import type { ResponsiveLayout } from './responsiveStyles';

// =============================================================================
// Constants
// =============================================================================

const EMPTY_CONTAINER_PADDING = 40;
const TITLE_MARGIN_BOTTOM = 8;
const DESCRIPTION_MARGIN_BOTTOM = 16;

/**
 * UI chrome colors for the ShareButton component.
 * These are NOT part of the PublicMenuTheme because they represent fixed UI
 * feedback states (copy-success, button contrast text) rather than restaurant
 * branding. PublicMenuColors covers content theming only (background, text,
 * accent, borders). If a future theme redesign needs branded share buttons,
 * add `success` and `textOnPrimary` to PublicMenuColors.
 */
export const TEXT_ON_PRIMARY_BUTTON = '#ffffff';
export const SHARE_SUCCESS_FEEDBACK = '#059669';

export const EMPTY_CONTAINER_STYLE: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: EMPTY_CONTAINER_PADDING,
};

export const HEADER_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

export const FLEX_ONE_STYLE: TextStyle = { flex: 1 };

// =============================================================================
// Style Builders
// =============================================================================

/** Builds container style from theme. */
export function buildContainerStyle(theme: PublicMenuTheme): ViewStyle {
  return { flex: 1, backgroundColor: theme.colors.background };
}

/** Builds header styles from theme and responsive layout. */
export function buildHeaderStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): ViewStyle {
  return {
    padding: responsive.spacing.headerPadding,
    borderBottomWidth: theme.borders.showCategoryDividers ? theme.borders.dividerWidth : 0,
    borderBottomColor: theme.colors.divider,
    alignItems: responsive.maxWidth > 0 ? 'center' : 'flex-start',
  };
}

/** Builds the inner wrapper that constrains max width on desktop. */
export function buildInnerWrapper(responsive: ResponsiveLayout): ViewStyle {
  if (responsive.maxWidth > 0)
    return { width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' };

  return { width: '100%' };
}

/** Builds title text style from theme and responsive layout. */
export function buildTitleStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): TextStyle {
  return {
    fontFamily: theme.typography.headingFont,
    fontSize: responsive.fontSizes.title,
    fontWeight: theme.typography.titleWeight,
    letterSpacing: theme.typography.headingLetterSpacing,
    color: theme.colors.text,
    marginBottom: TITLE_MARGIN_BOTTOM,
  };
}

/** Builds description text style from theme and responsive layout. */
export function buildDescriptionStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    fontWeight: '400',
    letterSpacing: theme.typography.bodyLetterSpacing,
    lineHeight: responsive.fontSizes.description * theme.typography.bodyLineHeight,
    color: theme.colors.textSecondary,
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
  };
}

/** Builds empty state text style. */
export function buildEmptyTextStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  };
}

/** Builds content area style from responsive layout. */
export function buildContentStyle(responsive: ResponsiveLayout): ViewStyle {
  return { padding: responsive.spacing.pagePadding };
}
