/**
 * MenuItemEditor - Editor for a single menu item.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import ItemSelectionCheckbox from './components/ItemSelectionCheckbox';
import MenuItemEditorBody from './components/MenuItemEditorBody';
import ReorderButtons from './components/ReorderButtons';
import { OverrideIndicator } from './LocationOverrides';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import PopularityTier from '../../shared/enums/PopularityTier';
import { TestIds } from '../../shared/testIds';
import { isValueDefined } from '../../utils/is';
import ItemPopularityBadge from '../Analytics/components/ItemPopularityBadge';
import { getPopularityTier } from '../Analytics/utils/popularityUtils';
import SeasonalBadge from '../PublicMenu/components/SeasonalBadge';
import InlineEditableText from '../Shared/InlineEditableText';

import type { OverrideContextProps } from './LocationOverrides';
import type { MenuItem } from '../../types/menuTypes';

interface MenuItemEditorProps {
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
  totalItems: number;
  onUpdate: (updates: Partial<MenuItem>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
  menuExternalId?: string;
  categoryName?: string;
  isSelectionMode?: boolean;
  isSelected?: (itemId: string) => boolean;
  onToggleSelect?: (itemId: string) => void;
  overrideContext?: OverrideContextProps;
  viewCount?: number;
}

const PHONE_ITEM_MARGIN_LEFT = 4;
const SELECTED_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  itemCard: { borderWidth: 1, borderRadius: 6, padding: 12, marginLeft: 16, marginBottom: 8 },
  itemCardPhone: { marginLeft: PHONE_ITEM_MARGIN_LEFT },
  itemCardSelected: { borderWidth: SELECTED_BORDER_WIDTH },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  itemNameText: { flex: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  smallButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  smallButtonText: { fontSize: 12, fontWeight: '600' },
});

const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  item, categoryIndex, itemIndex, totalItems, onUpdate, onDelete, onMoveUp, onMoveDown,
  borderColor, textColor, textSecondary, backgroundColor, primaryColor, textOnPrimary, errorColor,
  menuExternalId, categoryName,
  isSelectionMode, isSelected, onToggleSelect,
  overrideContext, viewCount,
}) => {
  const { isPhone } = useBreakpoint();
  const itemName = String(item.name);
  const itemId = String(item.id ?? '');
  const hasSelection = isSelectionMode === true && isValueDefined(isSelected);
  const checked = hasSelection && isSelected(itemId);

  const availabilityLabel = item.isAvailable === true
    ? FM('onlineMenus.available')
    : FM('onlineMenus.unavailable');

  const cardBorderColor = checked ? primaryColor : borderColor;
  const itemHasOverride = isValueDefined(overrideContext) && overrideContext.hasOverride(categoryIndex, itemIndex);
  const popularityTier = isValueDefined(viewCount) ? getPopularityTier(viewCount) : PopularityTier.Normal;

  return (
    <View
      style={[
        styles.itemCard,
        isPhone ? styles.itemCardPhone : undefined,
        checked ? styles.itemCardSelected : undefined,
        { borderColor: cardBorderColor, backgroundColor },
      ]}
      testID={`${TestIds.MENU_ITEM}-${categoryIndex}-${itemIndex}`}
    >
      <View style={styles.itemRow}>
        {isSelectionMode === true && isValueDefined(onToggleSelect) ? (
          <ItemSelectionCheckbox
            accessibilityHint={FM('onlineMenus.bulkActions.itemCheckboxHint')}
            accessibilityLabel={FM('onlineMenus.bulkActions.itemCheckboxLabel', itemName)}
            borderColor={borderColor}
            isSelected={checked}
            primaryColor={primaryColor}
            testID={`${TestIds.ITEM_SELECTION_CHECKBOX}-${categoryIndex}-${itemIndex}`}
            textOnPrimary={textOnPrimary}
            onToggle={() => { onToggleSelect(itemId); }}
          />
        ) : null}
        <InlineEditableText
          editIconColor={textColor}
          inputStyle={[styles.itemNameText, styles.input, { borderColor, color: textColor, backgroundColor }]}
          renderDisplay={(displayValue) => (
            <Text style={[styles.itemNameText, { color: textColor }]}>{displayValue}</Text>
          )}
          testID={`${TestIds.MENU_ITEM_NAME_INPUT}-${categoryIndex}-${itemIndex}`}
          value={itemName}
          onCommit={(newName) => { onUpdate({ name: newName }); }}
        />
        {itemHasOverride ? (
          <OverrideIndicator primaryColor={primaryColor} textOnPrimary={textOnPrimary} />
        ) : null}
        <SeasonalBadge
          availableFrom={item.availableFrom}
          availableTo={item.availableTo}
          primaryColor={primaryColor}
          textOnPrimary={textOnPrimary}
        />
        <ItemPopularityBadge itemName={itemName} tier={popularityTier} />
        {isSelectionMode === true ? null : (
          <>
            <ReorderButtons
              borderColor={borderColor}
              index={itemIndex}
              moveDownHint={FM('onlineMenus.moveItemDownHint')}
              moveDownLabel={FM('onlineMenus.moveItemDownLabel', itemName)}
              moveDownTestId={`${TestIds.MENU_ITEM_MOVE_DOWN_BUTTON}-${categoryIndex}-${itemIndex}`}
              moveUpHint={FM('onlineMenus.moveItemUpHint')}
              moveUpLabel={FM('onlineMenus.moveItemUpLabel', itemName)}
              moveUpTestId={`${TestIds.MENU_ITEM_MOVE_UP_BUTTON}-${categoryIndex}-${itemIndex}`}
              textColor={textColor}
              total={totalItems}
              onMoveDown={onMoveDown}
              onMoveUp={onMoveUp}
            />
            <TouchableOpacity
              accessibilityHint={FM('onlineMenus.deleteItemHint')}
              accessibilityLabel={FM('onlineMenus.deleteItemLabel', itemName)}
              accessibilityRole="button"
              style={[styles.smallButton, { backgroundColor: borderColor }]}
              testID={`${TestIds.MENU_ITEM_DELETE_BUTTON}-${categoryIndex}-${itemIndex}`}
              onPress={onDelete}
            >
              <Text style={[styles.smallButtonText, { color: textColor }]}>{FM('onlineMenus.delete')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <MenuItemEditorBody
        availabilityLabel={availabilityLabel}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        categoryIndex={categoryIndex}
        categoryName={categoryName}
        errorColor={errorColor}
        isPhone={isPhone}
        item={item}
        itemIndex={itemIndex}
        menuExternalId={menuExternalId}
        overrideContext={overrideContext}
        primaryColor={primaryColor}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        textSecondary={textSecondary}
        onUpdate={onUpdate}
      />
    </View>
  );
};

export default MenuItemEditor;
