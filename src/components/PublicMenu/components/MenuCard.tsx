
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

import type { TenantMenusDto } from '../../../types/menuTypes';

interface MenuCardProps {
  menu: TenantMenusDto;
  defaultMenuTitle: string;
  viewButtonLabel: string;
  onViewMenu: (menuId: string) => void;
  primaryColor: string;
  textOnPrimary: string;
  backgroundColor: string;
  textColor: string;
  textSecondary: string;
}

const CARD_BORDER_RADIUS = 12;
const CARD_PADDING = 16;
const CARD_MARGIN_BOTTOM = 16;
const CARD_ELEVATION = 3;
const CARD_BOX_SHADOW = '0px 2px 4px rgba(0, 0, 0, 0.1)';
const NAME_FONT_SIZE = 20;
const NAME_MARGIN_BOTTOM = 8;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_MARGIN_BOTTOM = 12;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_PADDING = 12;
const BUTTON_FONT_SIZE = 16;

const styles = StyleSheet.create({
  menuCard: {
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
    boxShadow: CARD_BOX_SHADOW,
    elevation: CARD_ELEVATION,
  },
  menuName: {
    fontSize: NAME_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: NAME_MARGIN_BOTTOM,
  },
  menuDescription: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
  },
  viewButton: {
    borderRadius: BUTTON_BORDER_RADIUS,
    padding: BUTTON_PADDING,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

/**
 * Renders a menu card with name, description, and a view button.
 */
export const MenuCard: React.FC<MenuCardProps> = ({
  menu,
  defaultMenuTitle,
  viewButtonLabel,
  onViewMenu,
  primaryColor,
  textOnPrimary,
  backgroundColor,
  textColor,
  textSecondary,
}) => {
  const name = menu.name ?? defaultMenuTitle;
  const description = menu.description ?? '';
  const menuId = String(menu.externalId);

  return (
    <View style={[styles.menuCard, { backgroundColor }]} testID={`${TestIds.PUBLIC_MENU_CARD}-${menuId}`}>
      <Text style={[styles.menuName, { color: textColor }]}>{name}</Text>
      {description !== '' ? (
        <Text style={[styles.menuDescription, { color: textSecondary }]}>{description}</Text>
      ) : null}
      <TouchableOpacity
        accessibilityHint={FM('publicMenu.menuCard.viewMenuHint')}
        accessibilityLabel={FM('publicMenu.menuCard.viewMenuLabel', name)}
        accessibilityRole="button"
        style={[styles.viewButton, { backgroundColor: primaryColor }]}
        testID={`${TestIds.PUBLIC_MENU_CARD}-${menuId}-view-button`}
        onPress={() => {
          onViewMenu(menuId);
        }}
      >
        <Text style={[styles.viewButtonText, { color: textOnPrimary }]}>{viewButtonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};
