import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import LivePreviewHeader from './LivePreviewHeader';
import PreviewContent from './PreviewContent';
import ThemeMode from '../../shared/enums/ThemeMode';
import Viewport from '../../shared/enums/Viewport';
import { TestIds } from '../../shared/testIds';
import { themePalette } from '../../theme/utils/styles';
import { sortCategoriesByDisplayOrder, sortMenuItemsByDisplayOrder } from '../../types/menuTypes';
import { isValueDefined } from '../../utils/is';

import type { RootState } from '../../store/reduxStore';
import type { MenuContents } from '../../types/menuTypes';

interface MenuLivePreviewProps {
  contents: MenuContents | null | undefined;
  menuName?: string;
  menuDescription?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const viewportWidths: Record<Viewport, number> = {
  [Viewport.Mobile]: 375,
  [Viewport.Tablet]: 768,
  [Viewport.Desktop]: 1024,
};

const MenuLivePreview: React.FC<MenuLivePreviewProps> = ({
  contents,
  menuName,
  menuDescription,
}) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const [viewport, setViewport] = useState<Viewport>(Viewport.Mobile);

  const menuContents = contents ?? { categories: [] };

  // Apply menu-level styling
  const defaultBg = String(colors.background);
  const defaultText = String(colors.text);

  const hasCustomBackground = isValueDefined(menuContents.backgroundColor);
  const menuBackgroundColor = hasCustomBackground ? String(menuContents.backgroundColor) : defaultBg;

  const hasCustomTextColor = isValueDefined(menuContents.textColor);
  const menuTextColor = hasCustomTextColor ? String(menuContents.textColor) : defaultText;

  // Sort categories and items by displayOrder
  const categories = sortCategoriesByDisplayOrder(menuContents.categories).map((category) => ({
    ...category,
    items: sortMenuItemsByDisplayOrder(category.items),
  }));

  const borderColor = String(colors.border);
  const primaryColor = String(colors.primary);
  const textOnPrimary = String(colors.textOnPrimary);
  const surfaceColor = String(colors.surface);
  const textColor = String(colors.text);

  const frameWidth = viewportWidths[viewport];
  const displayMenuName = menuName ?? FM('onlineMenus.title');

  return (
    <View style={styles.container} testID={TestIds.LIVE_PREVIEW_PANEL}>
      <LivePreviewHeader
        borderColor={borderColor}
        primaryColor={primaryColor}
        setViewport={setViewport}
        surfaceColor={surfaceColor}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        viewport={viewport}
      />
      <PreviewContent
        borderColor={borderColor}
        categories={categories}
        frameWidth={frameWidth}
        menuBackgroundColor={menuBackgroundColor}
        menuDescription={menuDescription}
        menuName={displayMenuName}
        menuTextColor={menuTextColor}
      />
    </View>
  );
};

export default MenuLivePreview;
