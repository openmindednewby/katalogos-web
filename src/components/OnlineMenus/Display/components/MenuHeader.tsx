


/**
 * Renders the menu header with logo, banner, title, and description.
 * All display is controlled by HeaderSettings.
 */
/**
 * MenuHeader - Renders the header section of a menu with logo, banner, title, and description.
 */
import React from 'react';

import { Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { isValueDefined } from '../../../../utils/is';
import { DEFAULT_COLOR_SCHEME } from '../../../../utils/menuDefaults';
import { ContentImage } from '../../../Content';
import { DEFAULT_BANNER_HEIGHT, LOGO_SIZES, menuContentViewStyles } from '../utils/menuContentViewStyles';

import type { HeaderSettings, ColorScheme, GlobalTypography } from '../../../../types/menuStyleTypes';

// =============================================================================
// Types
// =============================================================================

interface MenuHeaderProps {
  menuName: string;
  menuDescription?: string | null;
  header: HeaderSettings;
  colorScheme: ColorScheme;
  typography: GlobalTypography;
  pagePadding: number;
}

// =============================================================================
// Constants
// =============================================================================

// Typography fallback constants
const DEFAULT_TITLE_FONT_SIZE = 32;
const DEFAULT_BODY_FONT_SIZE = 16;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Determines which header sections should be visible.
 */
function getHeaderVisibility(header: HeaderSettings, menuDescription?: string | null): {
  showLogo: boolean;
  showBanner: boolean;
  showTitle: boolean;
  showDescription: boolean;
} {
  const showLogo = header.showLogo === true && isValueDefined(header.logoContentId);
  const showBanner = isValueDefined(header.bannerContentId);
  const showTitle = header.showMenuName !== false;
  const showDescription = header.showMenuDescription !== false && isValueDefined(menuDescription);
  return { showLogo, showBanner, showTitle, showDescription };
}

/**
 * Resolves header layout settings with defaults.
 */
function resolveHeaderLayout(header: HeaderSettings): {
  logoSize: number;
  bannerHeight: number;
  titlePosition: string;
  logoPosition: string;
} {
  return {
    logoSize: LOGO_SIZES[header.logoSize ?? 'medium'],
    bannerHeight: header.bannerHeight ?? DEFAULT_BANNER_HEIGHT,
    titlePosition: header.titlePosition ?? 'center',
    logoPosition: header.logoPosition ?? 'center',
  };
}

/**
 * Builds title text style from typography and color scheme.
 */
function buildTitleTextStyle(typography: GlobalTypography, colorScheme: ColorScheme): TextStyle {
  return {
    fontSize: typography.titleFontSize ?? DEFAULT_TITLE_FONT_SIZE,
    fontWeight: typography.titleFontWeight ?? 'bold',
    color: colorScheme.text ?? DEFAULT_COLOR_SCHEME.text,
  };
}

/**
 * Builds description text style from typography and color scheme.
 */
function buildDescriptionTextStyle(typography: GlobalTypography, colorScheme: ColorScheme): TextStyle {
  return {
    fontSize: typography.bodyFontSize ?? DEFAULT_BODY_FONT_SIZE,
    fontWeight: typography.bodyFontWeight ?? 'normal',
    color: colorScheme.textSecondary ?? DEFAULT_COLOR_SCHEME.textSecondary,
  };
}

/**
 * Gets position alignment styles based on a position string.
 */
function getPositionAlignmentStyles(position: string): TextStyle | undefined {
  if (position === 'left') return menuContentViewStyles.titleLeft;
  if (position === 'right') return menuContentViewStyles.titleRight;
  if (position === 'center') return menuContentViewStyles.titleCenter;
  return undefined;
}

/**
 * Gets logo container alignment styles based on position.
 */
function getLogoAlignmentStyle(position: string): ViewStyle | undefined {
  if (position === 'left') return menuContentViewStyles.logoLeft;
  if (position === 'right') return menuContentViewStyles.logoRight;
  if (position === 'center') return menuContentViewStyles.logoCenter;
  return undefined;
}

// =============================================================================
// Component
// =============================================================================

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  menuName,
  menuDescription,
  header,
  colorScheme,
  typography,
  pagePadding,
}) => {
  const { showLogo, showBanner, showTitle, showDescription } = getHeaderVisibility(header, menuDescription);

  const hasNoContent = !showLogo && !showBanner && !showTitle && !showDescription;
  if (hasNoContent) return null;

  const { logoSize, bannerHeight, titlePosition, logoPosition } = resolveHeaderLayout(header);
  const titleTextStyle = buildTitleTextStyle(typography, colorScheme);
  const descriptionTextStyle = buildDescriptionTextStyle(typography, colorScheme);

  const headerStyle: ViewStyle = {
    paddingHorizontal: pagePadding,
    paddingTop: pagePadding,
  };

  const logoContainerStyle = [
    menuContentViewStyles.logoContainer,
    getLogoAlignmentStyle(logoPosition),
  ];

  const titleStyle = [
    menuContentViewStyles.title,
    titleTextStyle,
    getPositionAlignmentStyles(titlePosition),
  ];

  const descriptionStyle = [
    menuContentViewStyles.description,
    descriptionTextStyle,
    getPositionAlignmentStyles(titlePosition),
  ];

  return (
    <View style={[menuContentViewStyles.header, headerStyle]} testID={TestIds.MENU_CONTENT_VIEW_HEADER}>
      {showBanner ? (
        <ContentImage
          isPublic
          accessibilityHint={FM('onlineMenus.display.menuBannerHint')}
          accessibilityLabel={FM('onlineMenus.display.menuBannerLabel')}
          contentId={header.bannerContentId}
          height={bannerHeight}
          style={menuContentViewStyles.banner}
          testID={TestIds.MENU_CONTENT_VIEW_BANNER}
        />
      ) : null}

      {showLogo ? (
        <View style={logoContainerStyle}>
          <ContentImage
            isPublic
            accessibilityHint={FM('onlineMenus.display.menuLogoHint')}
            accessibilityLabel={FM('onlineMenus.display.menuLogoLabel')}
            contentId={header.logoContentId}
            height={logoSize}
            style={{ width: logoSize, height: logoSize }}
            testID={TestIds.MENU_CONTENT_VIEW_LOGO}
          />
        </View>
      ) : null}

      {showTitle ? (
        <Text style={titleStyle} testID={TestIds.MENU_CONTENT_VIEW_TITLE}>
          {menuName}
        </Text>
      ) : null}

      {showDescription ? (
        <Text style={descriptionStyle} testID={TestIds.MENU_CONTENT_VIEW_DESCRIPTION}>
          {String(menuDescription)}
        </Text>
      ) : null}
    </View>
  );
};
