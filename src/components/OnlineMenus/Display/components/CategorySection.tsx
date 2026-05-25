


// =============================================================================
// Component
// =============================================================================

/**
 * Enhanced CategorySection component that renders a menu category with full styling.
 */
/**
 * CategorySection - Enhanced display component for menu categories.
 *
 * Renders a menu category with full styling support including:
 * - Box styling (border, padding, background)
 * - Typography for category title and description
 * - Media position for category image
 * - Overlay settings
 *
 * @see BaseClient/docs/Tasks/TODO/menu-customization-feature.md
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { CategoryMedia } from './CategoryMedia';
import { TestIds } from '../../../../shared/testIds';
import MediaPosition from '../../../../types/enums/MediaPosition';
import { isValueDefined } from '../../../../utils/is';
import {
  DEFAULT_CATEGORY_IMAGE_SETTINGS,
  DEFAULT_CATEGORY_TYPOGRAPHY,
} from '../../../../utils/menuDefaults';
import { generateCategoryStyles } from '../../../../utils/menuStyleGenerator';



import type { Category, MenuItem, MenuContents } from '../../../../types/menuTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  /** The category to display */
  category: Category;
  /** Global menu styles for color scheme inheritance */
  globalStyles?: MenuContents;
  /** Callback when a menu item is pressed */
  onItemPress?: (item: MenuItem) => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_CATEGORY_NAME = 'Category';

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  contentWrapper: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  itemsContainer: {
    marginTop: 12,
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Determines flex direction based on media position.
 */
function getFlexDirection(position: MediaPosition): ViewStyle['flexDirection'] {
  switch (position) {
    case MediaPosition.Left:
      return 'row';
    case MediaPosition.Right:
      return 'row-reverse';
    case MediaPosition.Top:
      return 'column';
    case MediaPosition.Bottom:
      return 'column-reverse';
    case MediaPosition.Background:
    case MediaPosition.None:
    default:
      return 'column';
  }
}

/**
 * Checks if media should be displayed based on position.
 */
function shouldShowMedia(position: MediaPosition | undefined): boolean {
  return position !== MediaPosition.None;
}

/**
 * Checks if description should be visible based on typography settings.
 */
function isDescriptionVisible(category: Category): boolean {
  return category.typography?.descriptionVisible ?? DEFAULT_CATEGORY_TYPOGRAPHY.descriptionVisible ?? true;
}

/**
 * Gets the media position from category settings.
 */
function getMediaPosition(category: Category): MediaPosition {
  const settingsPosition = category.imageSettings?.position;
  const defaultPosition = DEFAULT_CATEGORY_IMAGE_SETTINGS.position ?? MediaPosition.Top;
  return isValueDefined(settingsPosition) ? settingsPosition : defaultPosition;
}

/**
 * Checks if category has valid media content.
 */
function hasMedia(category: Category): boolean {
  const hasImage = isValueDefined(category.imageContentId) && category.imageContentId !== '';
  const hasVideo = isValueDefined(category.videoContentId) && category.videoContentId !== '';
  return hasImage || hasVideo;
}

/**
 * Determines if media should be rendered and whether it is background media.
 */
function getMediaDisplayFlags(category: Category): { showMedia: boolean; isBackgroundMedia: boolean; mediaPosition: MediaPosition } {
  const mediaPosition = getMediaPosition(category);
  const showMedia = shouldShowMedia(mediaPosition) && hasMedia(category);
  const isBackgroundMedia = mediaPosition === MediaPosition.Background;
  return { showMedia, isBackgroundMedia, mediaPosition };
}

// =============================================================================
// Sub-Renderers
// =============================================================================

function renderMediaSection(
  category: Category,
  globalStyles: MenuContents | undefined,
  showMedia: boolean,
  isBackgroundMedia: boolean,
): React.ReactElement | null {
  if (!showMedia) return null;
  return <CategoryMedia
    category={category}
    globalStyles={globalStyles}
    isBackground={isBackgroundMedia}
  />;
}

// =============================================================================
// Main Component
// =============================================================================

export const CategorySection: React.FC<Props> = ({
  category,
  globalStyles,
  onItemPress: _onItemPress,
}) => {
  const categoryName = category.name ?? DEFAULT_CATEGORY_NAME;
  const categoryDescription = category.description;

  const generatedStyles = useMemo(
    () => generateCategoryStyles(category, globalStyles?.colorScheme),
    [category, globalStyles?.colorScheme],
  );

  const hasIcon = isValueDefined(category.icon) && category.icon !== '';
  const { showMedia, isBackgroundMedia, mediaPosition } = getMediaDisplayFlags(category);
  const showDescription = isDescriptionVisible(category) && isValueDefined(categoryDescription);
  const flexDirection = getFlexDirection(mediaPosition);
  const containerStyle = useMemo<ViewStyle>(() => ({
    ...generatedStyles.container,
    flexDirection: isBackgroundMedia ? 'column' : flexDirection,
    position: isBackgroundMedia ? 'relative' : undefined,
  }), [generatedStyles.container, flexDirection, isBackgroundMedia]);

  const items = category.items ?? [];
  const categoryId = category.id ?? categoryName;
  const titleText = hasIcon ? `${category.icon} ${categoryName}` : categoryName;

  return (
    <View
      style={[styles.section, containerStyle]}
      testID={`${TestIds.MENU_CONTENT_VIEW_CATEGORY_SECTION}-${categoryId}`}
    >
      {renderMediaSection(category, globalStyles, showMedia, isBackgroundMedia)}

      <View style={styles.contentWrapper}>
        <Text
          style={[styles.title, generatedStyles.title]}
          testID={`${TestIds.MENU_CONTENT_VIEW_TITLE}-${categoryId}`}
        >
          {titleText}
        </Text>

        {showDescription ? <Text
            style={[styles.description, generatedStyles.description]}
            testID={`${TestIds.MENU_CONTENT_VIEW_DESCRIPTION}-${categoryId}`}
          >
            {String(categoryDescription)}
          </Text> : null}

        {items.length > 0 && (
          <View
            style={styles.itemsContainer}
            testID={`${TestIds.MENU_CONTENT_VIEW_CATEGORIES}-${categoryId}`}
          >
            {items.map((item, index) => (
              <View
                key={item.id ?? `${categoryName}-item-${index}`}
                testID={`${TestIds.MENU_CONTENT_VIEW_MENU_ITEM}-${categoryId}-${index}`}
              >
                <Text style={generatedStyles.title}>{item.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default CategorySection;
