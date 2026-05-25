/** CategoryOverflowMenu - Overflow actions modal for a category (move, select all, delete). */
import React from 'react';

import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

/** Intentionally lighter than standard MODAL_OVERLAY_COLOR (0.5) for subtle context menus. */
const CATEGORY_MENU_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.3)';
const MIN_WIDTH = 180;
const BORDER_RADIUS = 8;
const PADDING = 4;
const ITEM_PADDING_H = 16;
const ITEM_PADDING_V = 10;
const ITEM_FONT_SIZE = 14;

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CATEGORY_MENU_OVERLAY_COLOR },
  menu: { minWidth: MIN_WIDTH, borderRadius: BORDER_RADIUS, padding: PADDING, borderWidth: 1 },
  menuItem: { paddingHorizontal: ITEM_PADDING_H, paddingVertical: ITEM_PADDING_V },
  menuItemText: { fontSize: ITEM_FONT_SIZE, fontWeight: '500' },
});

interface CategoryOverflowMenuProps {
  isOpen: boolean;
  categoryIndex: number;
  categoryName: string;
  isFirst: boolean;
  isLast: boolean;
  isSelectionMode: boolean;
  hasSelectAll: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  primaryColor: string;
  errorColor: string;
  onClose: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
}

export const CategoryOverflowMenu: React.FC<CategoryOverflowMenuProps> = ({
  isOpen, categoryIndex, categoryName, isFirst, isLast,
  isSelectionMode, hasSelectAll, backgroundColor, borderColor,
  textColor, primaryColor, errorColor,
  onClose, onMoveUp, onMoveDown, onSelectAll, onDelete,
}) => (
  <Modal transparent animationType="fade" visible={isOpen} onRequestClose={onClose}>
    <Pressable
      accessibilityHint={FM('onlineMenus.overflowMenu.closeOverflowHint')}
      accessibilityLabel={FM('onlineMenus.overflowMenu.moreActions')}
      style={styles.overlay}
      testID={TestIds.CATEGORY_OVERFLOW_BACKDROP}
      onPress={onClose}
    >
      <View style={[styles.menu, { backgroundColor, borderColor }]} testID={TestIds.CATEGORY_OVERFLOW_MENU}>
        {!isFirst ? (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.moveCategoryUpHint')}
            accessibilityLabel={FM('onlineMenus.moveCategoryUpLabel', categoryName)}
            accessibilityRole="button"
            style={styles.menuItem}
            testID={`${TestIds.CATEGORY_MOVE_UP_BUTTON}-${categoryIndex}`}
            onPress={onMoveUp}
          >
            <Text style={[styles.menuItemText, { color: textColor }]}>
              {FM('onlineMenus.moveUpArrow')} {FM('onlineMenus.moveCategoryUpLabel', categoryName)}
            </Text>
          </TouchableOpacity>
        ) : null}
        {!isLast ? (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.moveCategoryDownHint')}
            accessibilityLabel={FM('onlineMenus.moveCategoryDownLabel', categoryName)}
            accessibilityRole="button"
            style={styles.menuItem}
            testID={`${TestIds.CATEGORY_MOVE_DOWN_BUTTON}-${categoryIndex}`}
            onPress={onMoveDown}
          >
            <Text style={[styles.menuItemText, { color: textColor }]}>
              {FM('onlineMenus.moveDownArrow')} {FM('onlineMenus.moveCategoryDownLabel', categoryName)}
            </Text>
          </TouchableOpacity>
        ) : null}
        {isSelectionMode && hasSelectAll ? (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.bulkActions.selectAllHint')}
            accessibilityLabel={FM('onlineMenus.bulkActions.selectAll')}
            accessibilityRole="button"
            style={styles.menuItem}
            testID={`${TestIds.BULK_SELECT_ALL_IN_CATEGORY}-${categoryIndex}`}
            onPress={onSelectAll}
          >
            <Text style={[styles.menuItemText, { color: primaryColor }]}>
              {FM('onlineMenus.bulkActions.selectAll')}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.deleteCategoryHint')}
          accessibilityLabel={FM('onlineMenus.deleteCategoryLabel', categoryName)}
          accessibilityRole="button"
          style={styles.menuItem}
          testID={`${TestIds.CATEGORY_DELETE_BUTTON}-${categoryIndex}`}
          onPress={onDelete}
        >
          <Text style={[styles.menuItemText, { color: errorColor }]}>
            {FM('onlineMenus.delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Modal>
);
