/** CategoryEditorBody - Expanded body content for a category editor. */
import React from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { categoryEditorStyles as styles } from '../categoryEditorStyles';
import CategoryStylingSection from '../CategoryStylingSection';
import CategoryContentPickers from './CategoryContentPickers';
import EmojiPicker from './EmojiPicker';
import { TestIds } from '../../../shared/testIds';
import MenuItemEditor from '../MenuItemEditor';

import type { BoxStyling, MediaSettings } from '../../../types/menuStyleTypes';
import type { Category, MenuItem } from '../../../types/menuTypes';
import type { OverrideContextProps } from '../LocationOverrides';

interface CategoryEditorBodyProps {
  category: Category;
  categoryIndex: number;
  isPhone: boolean;
  totalItems: number;
  onUpdateCategory: (updates: Partial<Category>) => void;
  onAddItem: () => void;
  onUpdateItem: (itemIndex: number, updates: Partial<MenuItem>) => void;
  onDeleteItem: (itemIndex: number) => void;
  onMoveItemUp: (itemIndex: number) => void;
  onMoveItemDown: (itemIndex: number) => void;
  onStylingChange: (styling: BoxStyling) => void;
  onImageSettingsChange: (imageSettings: MediaSettings) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
  secondaryColor: string;
  onIconChange: (icon: string | null) => void;
  menuExternalId?: string;
  isSelectionMode?: boolean;
  isSelected?: (itemId: string) => boolean;
  onToggleSelectItem?: (itemId: string) => void;
  overrideContext?: OverrideContextProps;
}

const CategoryEditorBody: React.FC<CategoryEditorBodyProps> = ({
  category, categoryIndex, isPhone, totalItems,
  onUpdateCategory, onAddItem, onUpdateItem, onDeleteItem, onMoveItemUp, onMoveItemDown,
  onStylingChange, onImageSettingsChange,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary, errorColor, secondaryColor,
  onIconChange,
  menuExternalId,
  isSelectionMode, isSelected, onToggleSelectItem,
  overrideContext,
}) => (
  <View>
    <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.categoryName')}</Text>
    <TextInput
      accessibilityHint={FM('onlineMenus.categoryNameInputHint')}
      accessibilityLabel={FM('onlineMenus.categoryNameLabel')}
      placeholder={FM('onlineMenus.categoryName')}
      placeholderTextColor={secondaryColor}
      style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
      testID={`${TestIds.CATEGORY_NAME_FULL_INPUT}-${categoryIndex}`}
      value={String(category.name ?? '')}
      onChangeText={(text) => { onUpdateCategory({ name: text }); }}
    />
    <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.categoryDescription')}</Text>
    <TextInput
      accessibilityHint={FM('onlineMenus.categoryDescriptionInputHint')}
      accessibilityLabel={FM('onlineMenus.categoryDescriptionLabel')}
      placeholder={FM('onlineMenus.categoryDescription')}
      placeholderTextColor={secondaryColor}
      style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
      testID={`${TestIds.CATEGORY_DESCRIPTION_INPUT}-${categoryIndex}`}
      value={String(category.description ?? '')}
      onChangeText={(text) => { onUpdateCategory({ description: text !== '' ? text : null }); }}
    />

    <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.categoryIcon.label')}</Text>
    <EmojiPicker
      borderColor={borderColor}
      categoryIndex={categoryIndex}
      primaryColor={primaryColor}
      selectedEmoji={category.icon}
      textColor={textColor}
      onSelect={onIconChange}
    />

    <CategoryContentPickers
      borderColor={borderColor}
      category={category}
      categoryIndex={categoryIndex}
      isPhone={isPhone}
      onUpdateCategory={onUpdateCategory}
    />

    <CategoryStylingSection
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      categoryIndex={categoryIndex}
      imageSettings={category.imageSettings}
      styling={category.styling}
      textColor={textColor}
      onUpdateImageSettings={onImageSettingsChange}
      onUpdateStyling={onStylingChange}
    />

    <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.items')}</Text>
    {category.items?.map((item, itemIndex) => (
      <MenuItemEditor
        key={item.id ?? `item-${itemIndex}`}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        categoryIndex={categoryIndex}
        categoryName={String(category.name ?? '')}
        errorColor={errorColor}
        isSelected={isSelected}
        isSelectionMode={isSelectionMode}
        item={item}
        itemIndex={itemIndex}
        menuExternalId={menuExternalId}
        overrideContext={overrideContext}
        primaryColor={primaryColor}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        textSecondary={secondaryColor}
        totalItems={totalItems}
        onDelete={() => { onDeleteItem(itemIndex); }}
        onMoveDown={() => { onMoveItemDown(itemIndex); }}
        onMoveUp={() => { onMoveItemUp(itemIndex); }}
        onToggleSelect={onToggleSelectItem}
        onUpdate={(updates) => { onUpdateItem(itemIndex, updates); }}
      />
    ))}

    <TouchableOpacity
      accessibilityHint={FM('onlineMenus.addItemHint')}
      accessibilityLabel={FM('onlineMenus.addItem')}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor: primaryColor }]}
      testID={`${TestIds.MENU_ITEM_ADD_BUTTON}-${categoryIndex}`}
      onPress={onAddItem}
    >
      <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('onlineMenus.addItem')}</Text>
    </TouchableOpacity>
  </View>
);

export default CategoryEditorBody;
