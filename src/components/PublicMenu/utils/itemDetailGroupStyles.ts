/**
 * Style builders for variant/modifier groups and tag containers
 * in the ItemDetailModal. Split from itemDetailModalStyles.ts
 * to keep files under 200 lines.
 */
import type { TextStyle, ViewStyle } from 'react-native';

import type { PublicMenuTheme } from './publicMenuThemeTypes';
import type { ResponsiveLayout } from './responsiveStyles';

// =============================================================================
// Constants
// =============================================================================

const GROUP_MARGIN_BOTTOM = 12;
const GROUP_HEADER_MARGIN_BOTTOM = 4;
const OPTION_PADDING_V = 6;
const OPTION_NAME_FLEX = 1;
const TAG_CONTAINER_GAP = 6;
const DESCRIPTION_MARGIN_BOTTOM = 16;

// =============================================================================
// Style Builders
// =============================================================================

export function buildGroupContainerStyle(): ViewStyle {
  return { marginBottom: GROUP_MARGIN_BOTTOM };
}

export function buildGroupHeaderStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: GROUP_HEADER_MARGIN_BOTTOM,
  };
}

export function buildGroupSubtitleStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    color: theme.colors.textSecondary,
    marginBottom: GROUP_HEADER_MARGIN_BOTTOM,
  };
}

export function buildOptionRowStyle(): ViewStyle {
  return {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: OPTION_PADDING_V,
  };
}

export function buildOptionNameStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
  isUnavailable: boolean,
): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    color: isUnavailable ? theme.colors.textSecondary : theme.colors.text,
    flex: OPTION_NAME_FLEX,
    textDecorationLine: isUnavailable ? 'line-through' : 'none',
  };
}

export function buildOptionPriceStyle(
  theme: PublicMenuTheme,
  responsive: ResponsiveLayout,
): TextStyle {
  return {
    fontFamily: theme.typography.bodyFont,
    fontSize: responsive.fontSizes.description,
    fontWeight: theme.typography.priceWeight,
    color: theme.colors.accent,
  };
}

export function buildTagContainerStyle(): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TAG_CONTAINER_GAP,
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
  };
}
