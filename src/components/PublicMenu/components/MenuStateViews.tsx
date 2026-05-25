import React from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';

interface LoadingStateProps {
  backgroundColor: string;
  primaryColor: string;
}

const SKELETON_BORDER_RADIUS = 8;
const SKELETON_OPACITY = 0.12;
const HEADER_HEIGHT = 32;
const SEARCH_BAR_HEIGHT = 44;
const CATEGORY_TITLE_HEIGHT = 20;
const ITEM_CARD_HEIGHT = 80;
const HEADER_MARGIN_BOTTOM = 16;
const SEARCH_MARGIN_BOTTOM = 20;
const CATEGORY_MARGIN_BOTTOM = 12;
const ITEM_MARGIN_BOTTOM = 12;
const CONTAINER_PADDING = 20;
const HEADER_WIDTH_PERCENT = '60%';
const CATEGORY_TITLE_WIDTH_PERCENT = '40%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
  },
  skeletonHeader: {
    height: HEADER_HEIGHT,
    borderRadius: SKELETON_BORDER_RADIUS,
    marginBottom: HEADER_MARGIN_BOTTOM,
    width: HEADER_WIDTH_PERCENT,
  },
  skeletonSearchBar: {
    height: SEARCH_BAR_HEIGHT,
    borderRadius: SKELETON_BORDER_RADIUS,
    marginBottom: SEARCH_MARGIN_BOTTOM,
    width: '100%',
  },
  skeletonCategoryTitle: {
    height: CATEGORY_TITLE_HEIGHT,
    borderRadius: SKELETON_BORDER_RADIUS,
    marginBottom: CATEGORY_MARGIN_BOTTOM,
    width: CATEGORY_TITLE_WIDTH_PERCENT,
  },
  skeletonItemCard: {
    height: ITEM_CARD_HEIGHT,
    borderRadius: SKELETON_BORDER_RADIUS,
    marginBottom: ITEM_MARGIN_BOTTOM,
    width: '100%',
  },
});

/**
 * Displays a skeleton loading placeholder for the menu viewer.
 * Renders placeholder rectangles for header, search bar, category titles, and item cards.
 */
export const MenuLoadingState: React.FC<LoadingStateProps> = ({ backgroundColor, primaryColor }) => {
  const skeletonColor = { backgroundColor: primaryColor, opacity: SKELETON_OPACITY };

  return (
    <View
      accessibilityHint={FM('publicMenu.skeleton.loadingHint')}
      accessibilityLabel={FM('publicMenu.skeleton.loadingLabel')}
      style={[styles.container, { backgroundColor }]}
      testID={TestIds.PUBLIC_MENU_SKELETON}
    >
      <View style={[styles.skeletonHeader, skeletonColor]} />
      <View style={[styles.skeletonSearchBar, skeletonColor]} />

      <View style={[styles.skeletonCategoryTitle, skeletonColor]} />
      <View style={[styles.skeletonItemCard, skeletonColor]} />
      <View style={[styles.skeletonItemCard, skeletonColor]} />
      <View style={[styles.skeletonItemCard, skeletonColor]} />

      <View style={[styles.skeletonCategoryTitle, skeletonColor]} />
      <View style={[styles.skeletonItemCard, skeletonColor]} />
      <View style={[styles.skeletonItemCard, skeletonColor]} />
    </View>
  );
};
